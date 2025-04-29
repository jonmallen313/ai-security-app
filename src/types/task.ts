export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'failed';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
} 