import { Task } from './task';
import { Playbook } from './playbook';

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed';

export interface Agent {
  id: string;
  name: string;
  description: string;
  assignedTasks: Task[];
  assignedPlaybooks: Playbook[];
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
} 