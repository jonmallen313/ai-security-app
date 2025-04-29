import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  context?: any;
}

/**
 * Send a message to the AI assistant and get a response
 */
export async function sendMessageToAI(
  message: string, 
  context?: any
): Promise<AIResponse> {
  try {
    // For now, simulate the API response
    // In a real implementation, this would call the backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: `I'm analyzing your request about "${message}". Based on the security context, I recommend implementing the following steps:\n\n1. First, verify the source of the alert\n2. Check if this is a false positive\n3. If confirmed, initiate the incident response playbook\n4. Assign the appropriate agent to handle this incident`,
          context: context
        });
      }, 1500);
    });
    
    // Real implementation would look like:
    // const response = await api.post('/api/ai/chat', {
    //   message,
    //   context
    // });
    // return response.data;
  } catch (error) {
    console.error('Error communicating with AI service:', error);
    throw error;
  }
}

/**
 * Generate a playbook based on the incident details
 */
export async function generatePlaybook(
  incidentType: string,
  severity: string,
  details: any
): Promise<any> {
  try {
    // For now, simulate the API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: `${incidentType} Response Playbook`,
          description: `Automatically generated playbook for ${incidentType} incidents with ${severity} severity`,
          steps: [
            {
              id: '1',
              title: 'Verify Alert',
              description: 'Confirm the alert is not a false positive',
              order: 1
            },
            {
              id: '2',
              title: 'Contain the Threat',
              description: 'Isolate affected systems to prevent further damage',
              order: 2
            },
            {
              id: '3',
              title: 'Investigate Root Cause',
              description: 'Determine how the incident occurred',
              order: 3
            },
            {
              id: '4',
              title: 'Remediate',
              description: 'Fix the vulnerability and restore systems',
              order: 4
            },
            {
              id: '5',
              title: 'Document and Report',
              description: 'Create a detailed report of the incident and response',
              order: 5
            }
          ],
          estimatedTime: '2 hours',
          difficulty: 'Intermediate'
        });
      }, 2000);
    });
    
    // Real implementation would look like:
    // const response = await api.post('/api/ai/generate-playbook', {
    //   incidentType,
    //   severity,
    //   details
    // });
    // return response.data;
  } catch (error) {
    console.error('Error generating playbook:', error);
    throw error;
  }
}

/**
 * Analyze logs and detect threats
 */
export async function analyzeLogs(
  logData: string,
  query?: string
): Promise<any> {
  try {
    // For now, simulate the API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          threats: [
            {
              id: '1',
              severity: 'high',
              description: 'Suspicious login attempt from unknown IP',
              timestamp: new Date().toISOString(),
              source: 'auth.log',
              details: {
                ip: '192.168.1.100',
                user: 'admin',
                success: false
              }
            },
            {
              id: '2',
              severity: 'medium',
              description: 'Multiple failed login attempts',
              timestamp: new Date().toISOString(),
              source: 'auth.log',
              details: {
                ip: '10.0.0.5',
                user: 'root',
                attempts: 5
              }
            }
          ],
          summary: {
            totalThreats: 2,
            highSeverity: 1,
            mediumSeverity: 1,
            lowSeverity: 0
          }
        });
      }, 1500);
    });
    
    // Real implementation would look like:
    // const response = await api.post('/api/ai/analyze-logs', {
    //   logData,
    //   query
    // });
    // return response.data;
  } catch (error) {
    console.error('Error analyzing logs:', error);
    throw error;
  }
} 