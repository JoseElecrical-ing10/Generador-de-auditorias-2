
import React from 'react';
import { Task, TaskStatus, Project, User } from '../types';
import { TrashIcon, DownloadIcon } from './icons';

interface TasksTableProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  onDelete: (taskId: string) => void;
}

const getStatusBadgeClass = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.New:
      return 'bg-blue-100 text-blue-800';
    case TaskStatus.InProgress:
      return 'bg-yellow-100 text-yellow-800';
    case TaskStatus.Completed:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const TasksTable: React.FC<TasksTableProps> = ({ tasks, projects, users, onDelete }) => {
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unassigned';
  const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || 'Sin Cliente';

  const handleExportTask = (task: Task) => {
    const userName = getUserName(task.createdBy);
    const projectName = getProjectName(task.projectId);

    const reportContent = `
      <html>
        <head>
          <title>Detalle de Auditoria: ${task.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; padding: 30px; color: #333; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: 600; color: #495057; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Detalle de Auditoria</h1>
          <table>
            <tr><th>ID</th><td>${task.id}</td></tr>
            <tr><th>Título</th><td>${task.title}</td></tr>
            <tr><th>Descripción</th><td>${task.description || 'No disponible'}</td></tr>
            <tr><th>Estado</th><td>${task.status}</td></tr>
            <tr><th>Creado por</th><td>${userName}</td></tr>
            <tr><th>Cliente</th><td>${projectName}</td></tr>
            <tr><th>Fecha de Creación</th><td>${new Date(task.createdDate).toLocaleDateString()}</td></tr>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Title</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Creado por</th>
            <th scope="col" className="px-6 py-3">Cliente</th>
            <th scope="col" className="px-6 py-3">Created</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4">{getUserName(task.createdBy)}</td>
              <td className="px-6 py-4">{getProjectName(task.projectId)}</td>
              <td className="px-6 py-4">{new Date(task.createdDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleExportTask(task)} className="text-gray-600 hover:text-gray-900" title="Exportar">
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800" 
                    title="Eliminar"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this? This action cannot be reversed.')) {
                        onDelete(task.id);
                      }
                    }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
           {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                No se encontraron auditorias.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
