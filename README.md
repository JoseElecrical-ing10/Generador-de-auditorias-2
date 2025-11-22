<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SiXLqfS6Vp49QDuBJTNcPCrvAnHdxub3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key
3. Run the app:
   `npm run dev`

## Docling extraction microservice

A small FastAPI service powered by `docling` is available at `backend/docling_service.py`. It exposes a `/extract` POST endpoint that accepts up to four uploaded documents (PDF/JPG/XLSM) or Google Drive download URLs and returns the parsed payload from Docling.

### Request
- **URL:** `/extract`
- **Method:** `POST`
- **Content type:** `multipart/form-data`
- **Fields:**
  - `files`: up to four uploaded files (PDF, JPG/JPEG, XLSM)
  - `drive_urls`: up to four signed or temporary Google Drive download URLs

### Response
A successful call returns JSON with one entry per processed document:

```json
{
  "count": 2,
  "results": [
    {"source": "contract.pdf", "document": {"...": "Docling output"}},
    {"source": "drive-2.pdf", "document": {"...": "Docling output"}}
  ]
}
```

### Running locally
1. Build the image: `docker build -t docling-extractor .`
2. Start the service: `docker run -p 8080:8080 docling-extractor`
3. Send a request:

```bash
curl -X POST \
  -F "files=@sample.pdf" \
  -F "drive_urls=https://drive.google.com/uc?export=download&id=FILE_ID" \
  http://localhost:8080/extract
```

### Deploying to Cloud Run
1. Replace `PROJECT_ID` in `cloudrun.yaml` with your project.
2. Build and push the container: `gcloud builds submit --tag gcr.io/PROJECT_ID/docling-extractor`.
3. Deploy: `gcloud run services replace cloudrun.yaml`.

### Apps Script: temporary Drive URLs and upload
Use Apps Script to create a short-lived public permission and call the service with `UrlFetchApp`:

```javascript
function createTempDownloadUrl(fileId) {
  const expirationMinutes = 15;
  Drive.Permissions.insert(
    {
      type: "anyone",
      role: "reader",
      expirationTime: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString(),
    },
    fileId,
    { supportsAllDrives: true }
  );
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
}

function sendToDocling(fileId, serviceUrl) {
  const downloadUrl = createTempDownloadUrl(fileId);
  const payload = {
    drive_urls: [downloadUrl],
  };
  const options = {
    method: "post",
    muteHttpExceptions: true,
    payload,
  };
  const response = UrlFetchApp.fetch(`${serviceUrl}/extract`, options);
  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());
}
```

Use `createTempDownloadUrl` to generate a time-boxed link for each Drive file, then pass it as a `drive_urls` entry in the `/extract` request.
