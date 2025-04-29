import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Agent {
  id: string;
  name: string;
  agent_type: 'network' | 'endpoint' | 'cloud';
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: Array<{
    name: string;
    action: string;
    parameters: Record<string, any>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  agent_id: string;
  playbook_id: string;
  parameters: Record<string, any>;
  result: Record<string, any> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source: string;
  agent_id: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  rule_type: 'detection' | 'prevention' | 'response';
  conditions: Record<string, any>;
  actions: Array<Record<string, any>>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API functions
export const apiService = {
  // Agents
  getAgents: async (): Promise<Agent[]> => {
    const response = await api.get('/api/agents');
    return response.data;
  },

  getAgent: async (id: string): Promise<Agent> => {
    const response = await api.get(`/api/agents/${id}`);
    return response.data;
  },

  createAgent: async (agent: Omit<Agent, 'id' | 'last_seen' | 'created_at' | 'updated_at'>): Promise<Agent> => {
    const response = await api.post('/api/agents', agent);
    return response.data;
  },

  // Playbooks
  getPlaybooks: async (): Promise<Playbook[]> => {
    const response = await api.get('/api/playbooks');
    return response.data;
  },

  getPlaybook: async (id: string): Promise<Playbook> => {
    const response = await api.get(`/api/playbooks/${id}`);
    return response.data;
  },

  createPlaybook: async (playbook: Omit<Playbook, 'id' | 'created_at' | 'updated_at'>): Promise<Playbook> => {
    const response = await api.post('/api/playbooks', playbook);
    return response.data;
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Omit<Task, 'id' | 'result' | 'started_at' | 'completed_at' | 'created_at' | 'updated_at'>): Promise<Task> => {
    const response = await api.post('/api/tasks', task);
    return response.data;
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    const response = await api.get('/api/incidents');
    return response.data;
  },

  getIncident: async (id: string): Promise<Incident> => {
    const response = await api.get(`/api/incidents/${id}`);
    return response.data;
  },

  createIncident: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>): Promise<Incident> => {
    const response = await api.post('/api/incidents', incident);
    return response.data;
  },

  simulateIncident: async (data: { agent_id: string; severity: Incident['severity']; description: string }): Promise<{ incident: Incident; recommended_playbook: Playbook | null }> => {
    const response = await api.post('/api/incidents/simulate', data);
    return response.data;
  },

  // Rules
  getRules: async (): Promise<Rule[]> => {
    const response = await api.get('/api/rules');
    return response.data;
  },

  getRule: async (id: string): Promise<Rule> => {
    const response = await api.get(`/api/rules/${id}`);
    return response.data;
  },

  createRule: async (rule: Omit<Rule, 'id' | 'created_at' | 'updated_at'>): Promise<Rule> => {
    const response = await api.post('/api/rules', rule);
    return response.data;
  },
}; 