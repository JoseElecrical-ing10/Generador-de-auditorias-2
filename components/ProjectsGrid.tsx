import React from 'react';
import { Project } from '../types';
import { FolderIconLarge } from './icons';

interface ProjectsGridProps {
  projects: Project[];
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {projects.map((project) => (
        <a
          key={project.id}
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex flex-col items-center p-4 rounded-lg transition-transform transform hover:-translate-y-1"
          aria-label={`Cliente ${project.name}`}
        >
          <FolderIconLarge className="w-24 h-24 text-yellow-500" />
          <span className="mt-2 text-sm font-semibold text-center text-gray-700 break-words w-full">
            {project.name}
          </span>
        </a>
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
            No se encontraron clientes.
        </div>
      )}
    </div>
  );
};