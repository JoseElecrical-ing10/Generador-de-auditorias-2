import { Task, Project, User, TaskStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'AM&PM', description: 'Auditorias para AM&PM.' },
  { id: 'proj-2', name: 'Waters on the Bay', description: 'Auditorias para Waters on the Bay.' },
  { id: 'proj-3', name: 'ISI', description: 'Auditorias para ISI.' },
];

export const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Design Homepage Mockup', description: 'Create a high-fidelity mockup in Figma.', status: TaskStatus.Completed, createdBy: 'user-1', projectId: 'proj-1', createdDate: '2023-02-01' },
  { id: 'task-2', title: 'Develop Login Page', description: 'Implement frontend and backend for user authentication.', status: TaskStatus.InProgress, createdBy: 'user-2', projectId: 'proj-1', createdDate: '2023-02-15' },
  { id: 'task-3', title: 'Setup Push Notifications', description: 'Configure APNS and FCM for the mobile app.', status: TaskStatus.InProgress, createdBy: 'user-3', projectId: 'proj-2', createdDate: '2023-04-10' },
  { id: 'task-4', title: 'Research Payment Gateway', description: 'Evaluate Stripe vs. Braintree.', status: TaskStatus.New, createdBy: 'user-1', projectId: 'proj-2', createdDate: '2023-05-01' },
  { id: 'task-5', title: 'Implement OAuth Endpoint', description: 'Create the /oauth/token endpoint.', status: TaskStatus.Completed, createdBy: 'user-4', projectId: 'proj-3', createdDate: '2023-06-05' },
  { id: 'task-6', title: 'Write API Documentation', description: 'Use Swagger/OpenAPI for documentation.', status: TaskStatus.New, createdBy: 'user-2', projectId: 'proj-3', createdDate: '2023-06-20' },
];