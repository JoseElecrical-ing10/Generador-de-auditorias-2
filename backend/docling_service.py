from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path
from typing import List, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

try:
    from docling.document_converter import DocumentConverter
except ImportError as exc:  # pragma: no cover - library must be available at runtime
    raise RuntimeError(
        "docling is required to run this service. Install it in the container image."
    ) from exc

app = FastAPI(title="Docling Extraction Service", version="0.1.0")
converter = DocumentConverter()

SUPPORTED_SUFFIXES = {".pdf", ".jpg", ".jpeg", ".xlsm"}


def _serialize_result(result: object) -> object:
    """Attempt to serialize docling conversion output into JSON-compatible data."""

    for attr in ("to_dict", "model_dump"):
        if hasattr(result, attr):
            return getattr(result, attr)()
    return str(result)


async def _download_to_temp(url: str, directory: Path) -> Path:
    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()
    extension = Path(url.split("?")[0]).suffix or ".bin"
    path = directory / f"remote{extension}"
    path.write_bytes(response.content)
    return path


async def _store_upload(upload: UploadFile, directory: Path) -> Path:
    content = await upload.read()
    if not content:
        raise HTTPException(status_code=400, detail=f"Empty file: {upload.filename}")
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix and suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported extension {suffix}. Allowed: {', '.join(sorted(SUPPORTED_SUFFIXES))}.",
        )
    path = directory / (upload.filename or "upload")
    path.write_bytes(content)
    return path


async def _convert_path(path: Path) -> object:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, converter.convert, path)


@app.post("/extract")
async def extract_documents(
    files: Optional[List[UploadFile]] = File(None, description="Up to four documents."),
    drive_urls: Optional[List[str]] = Form(
        None, description="Up to four signed or temporary Google Drive download URLs."
    ),
):
    uploads = files or []
    urls = drive_urls or []
    total = len(uploads) + len(urls)
    if total == 0:
        raise HTTPException(status_code=400, detail="Provide at least one file or drive_url.")
    if total > 4:
        raise HTTPException(status_code=400, detail="A maximum of four documents is allowed.")

    results = []
    with tempfile.TemporaryDirectory() as tmpdir:
        directory = Path(tmpdir)
        tasks = []
        for upload in uploads:
            path = await _store_upload(upload, directory)
            tasks.append((upload.filename or path.name, _convert_path(path)))

        for index, url in enumerate(urls, start=1):
            path = await _download_to_temp(url, directory)
            tasks.append((f"drive-{index}{path.suffix}", _convert_path(path)))

        converted = []
        for name, coroutine in tasks:
            try:
                result = await coroutine
                converted.append((name, result))
            except Exception as exc:  # pragma: no cover - runtime dependency may vary
                raise HTTPException(
                    status_code=500, detail=f"Failed to convert {name}: {exc}"
                ) from exc

    for name, result in converted:
        results.append({"source": name, "document": _serialize_result(result)})

    return JSONResponse(content={"count": len(results), "results": results})


@app.get("/")
async def root() -> dict:
    return {"status": "ok"}
