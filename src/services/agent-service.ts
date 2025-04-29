import { Agent, AgentStatus } from '@/types/agent';
import { Task, TaskStatus } from '@/types/task';
import { Playbook, PlaybookStatus } from '@/types/playbook';
import { sendSlackAlert } from './slack-alerts';

// In-memory storage for demo purposes
let agents: Agent[] = [];
let tasks: Task[] = [];
let playbooks: Playbook[] = [];

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to get current timestamp
const getTimestamp = () => new Date().toISOString();

// Initialize predefined playbooks
const initializePredefinedPlaybooks = () => {
  // Playbook 1: "Respond to SSH Brute Force Attack"
  const sshBruteForcePlaybook = createPlaybook("Respond to SSH Brute Force Attack", [
    createTask("Investigate failed login attempts", "Investigate failed login attempts from source IP."),
    createTask("Block attacking IP", "Block the attacking IP address at the firewall."),
    createTask("Notify security team", "Notify the security team via Slack."),
    createTask("Review user accounts", "Review affected user accounts for suspicious activity.")
  ]);

  // Playbook 2: "Contain Malware Infection"
  const malwarePlaybook = createPlaybook("Contain Malware Infection", [
    createTask("Isolate infected endpoint", "Isolate the infected endpoint from the network."),
    createTask("Pull endpoint logs", "Pull logs from the endpoint into the SIEM."),
    createTask("Trigger antivirus scan", "Trigger antivirus scan remotely."),
    createTask("Report findings", "Report findings and recommend next steps via Slack.")
  ]);

  // Playbook 3: "Investigate Suspicious User Behavior"
  const userBehaviorPlaybook = createPlaybook("Investigate Suspicious User Behavior", [
    createTask("Collect login activity", "Collect login activity for the user over the past 24 hours."),
    createTask("Check for impossible travel", "Check for impossible travel or multiple locations."),
    createTask("Alert user's manager", "Alert the user's manager and suspend the account if necessary."),
    createTask("Document findings", "Document findings into incident report.")
  ]);

  return [sshBruteForcePlaybook, malwarePlaybook, userBehaviorPlaybook];
};

// Initialize the service with predefined data
export const initializeService = () => {
  // Create sample agents if none exist
  if (agents.length === 0) {
    createAgent('Security Agent 1', 'Primary security monitoring agent');
    createAgent('Security Agent 2', 'Secondary security monitoring agent');
  }

  // Initialize predefined playbooks
  if (playbooks.length === 0) {
    initializePredefinedPlaybooks();
  }
};

// Agent Operations
export const createAgent = (name: string, description: string): Agent => {
  const agent: Agent = {
    id: generateId(),
    name,
    description,
    assignedTasks: [],
    assignedPlaybooks: [],
    status: 'idle',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };
  agents.push(agent);
  return agent;
};

export const getAgents = (): Agent[] => agents;

export const getAgentById = (id: string): Agent | undefined => 
  agents.find(agent => agent.id === id);

// Task Operations
export const createTask = (name: string, description: string): Task => {
  const task: Task = {
    id: generateId(),
    name,
    description,
    status: 'pending',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };
  tasks.push(task);
  return task;
};

export const assignTaskToAgent = async (taskId: string, agentId: string): Promise<void> => {
  const task = tasks.find(t => t.id === taskId);
  const agent = agents.find(a => a.id === agentId);
  
  if (!task || !agent) {
    throw new Error('Task or agent not found');
  }

  task.assignedAgentId = agentId;
  task.status = 'in-progress';
  task.updatedAt = getTimestamp();
  
  agent.assignedTasks.push(task);
  agent.status = 'running';
  agent.updatedAt = getTimestamp();

  // Send Slack notification
  await sendSlackAlert({
    messageText: `🛡️ Agent ${agent.name} started task ${task.name}`,
    alertType: 'automatic',
    severity: 'info'
  });

  // Simulate task execution
  setTimeout(async () => {
    const success = Math.random() > 0.9; // 10% failure rate for demo
    if (success) {
      task.status = 'done';
      task.completedAt = getTimestamp();
      await sendSlackAlert({
        messageText: `✅ Agent ${agent.name} completed task ${task.name}`,
        alertType: 'automatic',
        severity: 'info'
      });
    } else {
      task.status = 'failed';
      task.error = 'Task execution failed';
      await sendSlackAlert({
        messageText: `❌ Agent ${agent.name} failed task ${task.name}`,
        alertType: 'automatic',
        severity: 'error'
      });
    }
    task.updatedAt = getTimestamp();
    agent.status = 'idle';
    agent.updatedAt = getTimestamp();
  }, 5000); // 5 second simulation
};

// Playbook Operations
export const createPlaybook = (name: string, steps: Task[]): Playbook => {
  const playbook: Playbook = {
    id: generateId(),
    name,
    steps,
    status: 'pending',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };
  playbooks.push(playbook);
  return playbook;
};

export const getPlaybooks = (): Playbook[] => playbooks;

export const getPlaybookById = (id: string): Playbook | undefined => 
  playbooks.find(playbook => playbook.id === id);

export const assignPlaybookToAgent = async (playbookId: string, agentId: string): Promise<void> => {
  const playbook = playbooks.find(p => p.id === playbookId);
  const agent = agents.find(a => a.id === agentId);
  
  if (!playbook || !agent) {
    throw new Error('Playbook or agent not found');
  }

  playbook.assignedAgentId = agentId;
  playbook.status = 'running';
  playbook.updatedAt = getTimestamp();
  
  agent.assignedPlaybooks.push(playbook);
  agent.status = 'running';
  agent.updatedAt = getTimestamp();

  // Send Slack notification for playbook assignment
  await sendSlackAlert({
    messageText: `📚 Playbook "${playbook.name}" assigned to agent ${agent.name}`,
    alertType: 'automatic',
    severity: 'info'
  });

  // Execute playbook steps sequentially
  for (const step of playbook.steps) {
    step.status = 'in-progress';
    step.assignedAgentId = agentId;
    step.updatedAt = getTimestamp();

    // Send Slack notification for step start
    await sendSlackAlert({
      messageText: `🔄 Agent ${agent.name} started step "${step.name}" in playbook "${playbook.name}"`,
      alertType: 'automatic',
      severity: 'info'
    });

    // Simulate step execution with random delay between 3-5 seconds
    const delay = 3000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 10% chance of failure for demo purposes
    const success = Math.random() > 0.1;
    if (success) {
      step.status = 'done';
      step.completedAt = getTimestamp();
      
      // Send Slack notification for step completion
      await sendSlackAlert({
        messageText: `✅ Agent ${agent.name} completed step "${step.name}" in playbook "${playbook.name}"`,
        alertType: 'automatic',
        severity: 'info'
      });
    } else {
      step.status = 'failed';
      step.error = 'Step execution failed';
      playbook.status = 'failed';
      playbook.error = `Playbook failed at step "${step.name}"`;
      playbook.updatedAt = getTimestamp();
      agent.status = 'error';
      agent.updatedAt = getTimestamp();
      
      // Send Slack notification for step failure
      await sendSlackAlert({
        messageText: `❌ Agent ${agent.name} failed step "${step.name}" in playbook "${playbook.name}"`,
        alertType: 'automatic',
        severity: 'error'
      });
      
      // Send Slack notification for playbook failure
      await sendSlackAlert({
        messageText: `❌ Playbook "${playbook.name}" failed during execution by agent ${agent.name}`,
        alertType: 'automatic',
        severity: 'error'
      });
      
      return;
    }
    step.updatedAt = getTimestamp();
  }

  playbook.status = 'completed';
  playbook.completedAt = getTimestamp();
  playbook.updatedAt = getTimestamp();
  agent.status = 'idle';
  agent.updatedAt = getTimestamp();

  // Send Slack notification for playbook completion
  await sendSlackAlert({
    messageText: `📚 Playbook "${playbook.name}" completed by agent ${agent.name}`,
    alertType: 'automatic',
    severity: 'info'
  });
}; 