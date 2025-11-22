
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Project, User, TaskStatus } from './types';
import { MOCK_TASKS, MOCK_PROJECTS, MOCK_USERS } from './constants';
import { Sidebar, Section } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { AddTaskModal } from './components/AddTaskModal';
import { TasksTable } from './components/TasksTable';
import { ProjectsGrid } from './components/ProjectsGrid';
import { UsersGrid } from './components/UsersGrid';
import { PlusIcon, SearchIcon } from './components/icons';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('auditorias');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setTasks(MOCK_TASKS);
      setProjects(MOCK_PROJECTS);
      setUsers(MOCK_USERS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.InProgress).length;
    const completed = tasks.filter(t => t.status === TaskStatus.Completed).length;
    return { total, inProgress, completed };
  }, [tasks]);

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdDate' | 'projectId'> & { projectName: string }) => {
    const { projectName, createdBy: createdByValue, ...restTaskData } = taskData;
    let finalProjectId = '';
    let finalUserId = '';

    // Find if project already exists (case-insensitive)
    const existingProject = projects.find(p => p.name.toLowerCase() === projectName.trim().toLowerCase());

    if (existingProject) {
      finalProjectId = existingProject.id;
    } else if (projectName.trim() !== '') {
      // Create new project if it doesn't exist and the name is not empty
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: projectName.trim(),
        description: `Auditorias para ${projectName.trim()}.`
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      finalProjectId = newProject.id;
    }

    // Handle user creation
    const existingUser = users.find(u => u.id === createdByValue);
    if (existingUser) {
        finalUserId = existingUser.id;
    } else if (createdByValue && createdByValue.trim() !== '') {
        // If createdByValue is not an existing ID and is not empty, it's a new user's name
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: createdByValue.trim(),
            // Generate a dummy email, as it's required by the User type
            email: `${createdByValue.trim().toLowerCase().replace(/\s/g, '.')}@example.com`
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        finalUserId = newUser.id;
    }

    const newTask: Task = {
      ...restTaskData,
      createdBy: finalUserId,
      id: `task-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      projectId: finalProjectId,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);


  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'auditorias':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total de Auditorias" value={taskStats.total} />
              <StatCard title="In Progress" value={taskStats.inProgress} />
              <StatCard title="Completed" value={taskStats.completed} />
            </div>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-700">Todas las Auditorias</h3>
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar auditorias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <TasksTable 
                  tasks={filteredTasks} 
                  projects={projects} 
                  users={users} 
                  onDelete={handleDeleteTask}
                />
            </div>
          </>
        );
      case 'clientes':
        return <ProjectsGrid projects={projects} />;
      case 'usuarios':
        return <UsersGrid users={users} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeSection}</h1>
            {activeSection === 'auditorias' && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
                >
                    <PlusIcon className="w-5 h-5" />
                    Agregar Nueva Auditoria
                </button>
            )}
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {renderSection()}
        </div>
      </main>
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        projects={projects}
        users={users}
      />
    </div>
  );
};

export default App;
