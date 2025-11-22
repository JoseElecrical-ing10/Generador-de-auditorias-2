
import React, { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { Task, TaskStatus, Project, User } from '../types';
import { XIcon, UploadIcon } from './icons';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdDate' | 'projectId'> & { projectName: string }) => void;
  projects: Project[];
  users: User[];
  taskToEdit?: Task | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, projects, users, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.New);
  const [createdBy, setCreatedBy] = useState('');
  const [projectName, setProjectName] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAddingNewUser, setIsAddingNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isNewProject, setIsNewProject] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setStatus(taskToEdit.status);
        setCreatedBy(taskToEdit.createdBy);
        const proj = projects.find(p => p.id === taskToEdit.projectId);
        setProjectName(proj ? proj.name : '');
        setAttachments([]);
        setIsAddingNewUser(false);
        setNewUserName('');
        setIsNewProject(false);
      } else {
        setTitle('');
        setDescription('');
        setStatus(TaskStatus.New);
        setCreatedBy('');
        setProjectName('');
        setAttachments([]);
        setIsAddingNewUser(false);
        setNewUserName('');
        setIsNewProject(false);
      }
    }
  }, [isOpen, taskToEdit, projects]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };
  
  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProjectName(name);

    if (name.trim() === '') {
        setIsNewProject(false);
        return;
    }

    const projectExists = projects.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    setIsNewProject(!projectExists);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (isAddingNewUser && !newUserName.trim()) return;

    onSave({
      title,
      description,
      status,
      createdBy: isAddingNewUser ? newUserName.trim() : createdBy,
      projectName,
      attachments: attachments.map(f => f.name),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">
            {taskToEdit ? 'Editar Auditoria' : 'Agregar Nueva Auditoria'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
              required
            />
          </div>
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                required
              >
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-1">Creado por</label>
              <select
                id="userSelect"
                value={isAddingNewUser ? '__add_new__' : createdBy}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddingNewUser(true);
                    setCreatedBy('');
                  } else {
                    setIsAddingNewUser(false);
                    setCreatedBy(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value="">Seleccionar Usuario...</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                <option value="__add_new__" className="font-bold text-brand-accent">-- Agregar Nuevo Creador --</option>
              </select>
               {isAddingNewUser && (
                <div className="mt-2">
                   <input
                        type="text"
                        id="newUserName"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        placeholder="Nombre del Nuevo Creador..."
                        required
                    />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
                type="text"
                id="projectSelect"
                list="project-list"
                value={projectName}
                onChange={handleProjectNameChange}
                placeholder="Seleccionar o crear un cliente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            />
            <datalist id="project-list">
                {projects.map(project => <option key={project.id} value={project.name} />)}
            </datalist>
            {isNewProject && projectName.trim() && (
                <p className="text-xs text-gray-500 mt-1">
                    Se creará un nuevo cliente: <span className="font-semibold">{projectName.trim()}</span>
                </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subir Archivos</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-accent hover:text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-accent">
                            <span>Selecciona un archivo</span>
                            <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                multiple
                                accept=".csv, .pdf, .xlsm, .jpg, .jpeg"
                                onChange={handleFileChange}
                            />
                        </label>
                        <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        Archivos aceptados: CSV, PDF, XSLM, JPG
                    </p>
                </div>
            </div>
             {attachments.length > 0 && (
                <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        {attachments.map((file, index) => <li key={index}>{file.name}</li>)}
                    </ul>
                </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-blue-600">
              {taskToEdit ? 'Guardar Cambios' : 'Agregar Auditoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
