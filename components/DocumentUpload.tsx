import React, { useEffect, useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { UploadIcon, XIcon } from './icons';

interface DocumentUploadProps {
  onTasksCreated: (tasks: Task[]) => void;
}

interface ExtractedDocument {
  title?: string;
  text?: string;
  metadata?: Record<string, any>;
}

const MAX_FILES = 4;

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onTasksCreated }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const canUpload = useMemo(() => selectedFiles.length > 0 && !isUploading, [selectedFiles.length, isUploading]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (isUploading) {
      intervalId = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 7, 90));
      }, 350);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isUploading]);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    if (incoming.length + selectedFiles.length > MAX_FILES) {
      setError(`Solo puedes subir hasta ${MAX_FILES} archivos.`);
    } else {
      setError('');
    }

    setSelectedFiles(prev => [...prev, ...incoming].slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mapDocumentsToTasks = (documents: ExtractedDocument[]): Task[] => {
    const now = Date.now();
    return documents.slice(0, MAX_FILES).map((doc, index) => {
      const meta = doc.metadata || {};
      return {
        id: meta.id || `doc-${now}-${index}`,
        title: doc.title || meta.title || selectedFiles[index]?.name || `Documento ${index + 1}`,
        description: doc.text || meta.text || 'Contenido procesado del documento.',
        status: TaskStatus.Completed,
        createdBy: meta.createdBy || '',
        projectId: meta.projectId || '',
        createdDate: new Date().toISOString().split('T')[0],
        attachments: meta.attachments || (meta.source ? [meta.source] : undefined),
      };
    });
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    setIsUploading(true);
    setError('');
    setStatusMessage('Subiendo archivos y extrayendo contenido...');
    setUploadProgress(10);

    try {
      const response = await fetch('/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('No se pudo procesar la solicitud de extracción.');
      }

      const payload = await response.json();
      const documents: ExtractedDocument[] = Array.isArray(payload?.documents)
        ? payload.documents
        : Array.isArray(payload)
          ? payload
          : payload?.document
            ? [payload.document]
            : [];

      if (!documents.length) {
        throw new Error('La respuesta del servidor no incluyó documentos procesados.');
      }

      const tasksFromDocuments = mapDocumentsToTasks(documents);
      onTasksCreated(tasksFromDocuments);
      setStatusMessage('Documentos procesados correctamente.');
      setSelectedFiles([]);
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al procesar los archivos.');
      setStatusMessage('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Subir documentos</h3>
          <p className="text-sm text-gray-500">Carga hasta {MAX_FILES} archivos para extraer contenido y crear auditorías automáticamente.</p>
        </div>
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className={`px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${canUpload ? 'bg-brand-accent hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Procesar
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="mx-auto flex justify-center">
          <label className="cursor-pointer flex flex-col items-center gap-2" htmlFor="document-upload-input">
            <UploadIcon className="w-10 h-10 text-gray-400" />
            <span className="text-brand-accent font-medium">Seleccionar archivos</span>
            <span className="text-xs text-gray-500">(máximo {MAX_FILES} archivos: PDF, CSV, XLSM, JPG, JPEG)</span>
            <input
              id="document-upload-input"
              type="file"
              multiple
              accept=".csv, .pdf, .xlsm, .jpg, .jpeg"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700">
                <div className="truncate" title={file.name}>{file.name}</div>
                <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500" aria-label={`Eliminar ${file.name}`}>
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isUploading || uploadProgress > 0) && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{statusMessage || 'Procesando...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {!error && statusMessage && !isUploading && uploadProgress === 100 && (
        <p className="mt-3 text-sm text-green-600">{statusMessage}</p>
      )}
    </div>
  );
};

export default DocumentUpload;
