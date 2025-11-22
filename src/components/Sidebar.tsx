
import React from 'react';
import { ListTaskIcon, FolderIcon, UsersIcon } from './icons';

export type Section = 'auditorias' | 'clientes' | 'usuarios';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'auditorias', label: 'Auditorias', icon: <ListTaskIcon className="w-5 h-5" /> },
  { id: 'clientes', label: 'Clientes', icon: <FolderIcon className="w-5 h-5" /> },
  { id: 'usuarios', label: 'Usuarios', icon: <UsersIcon className="w-5 h-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-brand-primary text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-brand-secondary">
        <h2 className="text-2xl font-bold">AuditGen</h2>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.id);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-brand-accent text-white'
                    : 'text-gray-300 hover:bg-brand-secondary hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
