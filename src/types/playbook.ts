import { Task } from './task';

export type PlaybookStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Playbook {
  id: string;
  name: string;
  steps: Task[];
  assignedAgentId?: string;
  status: PlaybookStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
} 