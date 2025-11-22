export enum TaskStatus {
  New = 'New',
  InProgress = 'In Progress',
  Completed = 'Completed'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdBy: string;
  projectId: string;
  createdDate: string;
  attachments?: string[];
}

export interface Project {
  id:string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}