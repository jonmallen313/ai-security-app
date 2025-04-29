import { Incident } from './incidents';

export interface SalesforceConfig {
  orgId: string;
  agentId: string;
  apiVersion: string;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  recommendations?: string[];
  actions?: string[];
}

export class SalesforceService {
  private config: SalesforceConfig;
  private accessToken: string | null = null;

  constructor(config: SalesforceConfig) {
    this.config = config;
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      // TODO: Implement Salesforce OAuth flow
      // This will need to be updated with actual Salesforce authentication
      const response = await fetch(`https://${this.config.orgId}.salesforce.com/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: process.env.SF_CLIENT_ID || '',
          client_secret: process.env.SF_CLIENT_SECRET || '',
          username,
          password,
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Salesforce authentication failed:', error);
      return false;
    }
  }

  async analyzeIncident(incident: Incident): Promise<AgentResponse> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Salesforce');
    }

    try {
      // Call Agentforce agent to analyze the incident
      const response = await fetch(`https://${this.config.orgId}.salesforce.com/services/data/v${this.config.apiVersion}/connect/agents/${this.config.agentId}/actions/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            id: incident.id,
            type: incident.type,
            severity: incident.severity,
            description: incident.description,
            sourceIp: incident.sourceIp,
            timestamp: incident.timestamp,
          },
        }),
      });

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        recommendations: data.recommendations,
        actions: data.actions,
      };
    } catch (error) {
      console.error('Failed to analyze incident:', error);
      return {
        success: false,
        message: 'Failed to analyze incident',
      };
    }
  }

  async executeAction(actionName: string, params: any): Promise<AgentResponse> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Salesforce');
    }

    try {
      const response = await fetch(`https://${this.config.orgId}.salesforce.com/services/data/v${this.config.apiVersion}/connect/agents/${this.config.agentId}/actions/${actionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        recommendations: data.recommendations,
        actions: data.actions,
      };
    } catch (error) {
      console.error(`Failed to execute action ${actionName}:`, error);
      return {
        success: false,
        message: `Failed to execute action ${actionName}`,
      };
    }
  }
} 