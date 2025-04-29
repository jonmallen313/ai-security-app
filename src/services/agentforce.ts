import { Incident } from './incidents';

// Types for Agentforce
export interface AgentforceEvent {
  id: string;
  timestamp: Date;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  rawData?: any;
}

export interface AgentforceResponse {
  eventId: string;
  timestamp: Date;
  summary: string;
  mitigation: string;
  shouldAlert: boolean;
  alertReason?: string;
  processingTime: number;
}

export interface AgentforceLog {
  id: string;
  timestamp: Date;
  eventId: string;
  action: 'analyzed' | 'alerted' | 'mitigated';
  details: string;
}

// In-memory storage for Agentforce logs
let agentforceLogs: AgentforceLog[] = [];

// Function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Function to simulate processing delay
const simulateProcessing = async (minMs = 500, maxMs = 2000) => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
  return delay;
};

// Function to convert an Incident to an AgentforceEvent
export const incidentToEvent = (incident: Incident): AgentforceEvent => {
  return {
    id: generateId(),
    timestamp: new Date(incident.time),
    source: incident.sourceIp,
    severity: incident.threatLevel as 'low' | 'medium' | 'high' | 'critical',
    details: `${incident.mitreTechnique} - ${incident.description}`,
    rawData: incident
  };
};

// Function to process an event through Agentforce
export const processEvent = async (event: AgentforceEvent): Promise<AgentforceResponse> => {
  const startTime = Date.now();
  
  // Simulate processing delay
  const processingTime = await simulateProcessing();
  
  // Generate a summary based on the event
  const summary = generateSummary(event);
  
  // Generate a mitigation suggestion
  const mitigation = generateMitigation(event);
  
  // Decide whether to send an alert
  const shouldAlert = decideAlert(event);
  const alertReason = shouldAlert ? generateAlertReason(event) : undefined;
  
  const response: AgentforceResponse = {
    eventId: event.id,
    timestamp: new Date(),
    summary,
    mitigation,
    shouldAlert,
    alertReason,
    processingTime
  };
  
  // Log the analysis
  logAgentforceAction({
    id: generateId(),
    timestamp: new Date(),
    eventId: event.id,
    action: 'analyzed',
    details: `Analyzed event from ${event.source} with severity ${event.severity}`
  });
  
  // If an alert is needed, log it
  if (shouldAlert) {
    logAgentforceAction({
      id: generateId(),
      timestamp: new Date(),
      eventId: event.id,
      action: 'alerted',
      details: `Alerted on event from ${event.source} due to ${alertReason}`
    });
  }
  
  return response;
};

// Function to generate a summary for an event
const generateSummary = (event: AgentforceEvent): string => {
  const templates = [
    `Security event detected from ${event.source} with ${event.severity} severity.`,
    `Potential security incident identified originating from ${event.source}.`,
    `Suspicious activity observed from ${event.source} requiring attention.`,
    `Security alert triggered for activity from ${event.source}.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)] + ' ' + event.details;
};

// Function to generate a mitigation suggestion
const generateMitigation = (event: AgentforceEvent): string => {
  const mitigations = [
    `Block traffic from ${event.source} and investigate the source.`,
    `Implement additional monitoring for ${event.source} and similar patterns.`,
    `Update security rules to prevent this type of activity from ${event.source}.`,
    `Isolate affected systems and apply security patches.`,
    `Review and update access controls for systems accessed by ${event.source}.`
  ];
  
  return mitigations[Math.floor(Math.random() * mitigations.length)];
};

// Function to decide whether to send an alert
const decideAlert = (event: AgentforceEvent): boolean => {
  // Higher severity events are more likely to trigger alerts
  const severityWeights = {
    low: 0.1,
    medium: 0.3,
    high: 0.7,
    critical: 0.9
  };
  
  return Math.random() < severityWeights[event.severity];
};

// Function to generate a reason for an alert
const generateAlertReason = (event: AgentforceEvent): string => {
  const reasons = [
    `High severity event from ${event.source}`,
    `Suspicious pattern detected from ${event.source}`,
    `Potential security breach from ${event.source}`,
    `Unusual activity pattern from ${event.source}`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Function to log an Agentforce action
export const logAgentforceAction = (log: AgentforceLog) => {
  agentforceLogs.push(log);
  
  // Keep only the last 100 logs
  if (agentforceLogs.length > 100) {
    agentforceLogs = agentforceLogs.slice(-100);
  }
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('agentforceLogs', JSON.stringify(agentforceLogs));
  } catch (error) {
    console.error('Failed to save Agentforce logs to localStorage:', error);
  }
};

// Function to get all Agentforce logs
export const getAgentforceLogs = (): AgentforceLog[] => {
  return [...agentforceLogs];
};

// Function to get logs for a specific event
export const getLogsForEvent = (eventId: string): AgentforceLog[] => {
  return agentforceLogs.filter(log => log.eventId === eventId);
};

// Function to apply a mitigation to an event
export const applyMitigation = async (eventId: string, mitigation: string): Promise<void> => {
  // Simulate processing delay
  await simulateProcessing(300, 1000);
  
  // Log the mitigation
  logAgentforceAction({
    id: generateId(),
    timestamp: new Date(),
    eventId,
    action: 'mitigated',
    details: `Applied mitigation: ${mitigation}`
  });
};

// Initialize logs from localStorage if available
try {
  const savedLogs = localStorage.getItem('agentforceLogs');
  if (savedLogs) {
    agentforceLogs = JSON.parse(savedLogs).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  }
} catch (error) {
  console.error('Failed to load Agentforce logs from localStorage:', error);
} 