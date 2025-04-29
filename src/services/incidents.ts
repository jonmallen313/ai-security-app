import { sendSlackAlert as apiSendSlackAlert } from './api';
import { 
  getIncidents as apiGetIncidents, 
  getIncident as apiGetIncident,
  assessRisk,
  generateResponse,
  createReport
} from './api';
import mockIncidents from '@/data/mock-incidents.json';

export interface Incident {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  sourceIp: string;
  timestamp: string;
  status: 'new' | 'analyzing' | 'resolved';
  mitreTechnique?: string;
  mitreTactic?: string;
  threatLevel?: string;
  recommendations?: string[];
}

export class IncidentService {
  private incidents: Incident[] = [];

  constructor() {
    // Initialize with mock data
    this.incidents = mockIncidents as Incident[];
  }

  async createIncident(incident: Omit<Incident, 'id' | 'status'>): Promise<Incident> {
    const newIncident: Incident = {
      ...incident,
      id: Math.random().toString(36).substr(2, 9),
      status: 'new'
    };

    this.incidents.push(newIncident);
    
    // Send alert to Slack
    await this.sendSlackAlert(newIncident);

    return newIncident;
  }

  async analyzeIncident(incidentId: string): Promise<Incident | null> {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return null;

    incident.status = 'analyzing';

    try {
      // Get risk assessment
      const riskAssessment = await assessRisk(incidentId);
      
      if (riskAssessment.success && riskAssessment.recommendations) {
        incident.recommendations = riskAssessment.recommendations;
      }
      
      // Generate response plan
      const responsePlan = await generateResponse(incidentId);
      
      if (responsePlan.success) {
        // Store response plan in incident or handle as needed
        console.log('Response plan generated:', responsePlan.responsePlan);
      }
    } catch (error) {
      console.error('Failed to analyze incident:', error);
    }

    return incident;
  }

  async resolveIncident(incidentId: string): Promise<Incident | null> {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return null;

    incident.status = 'resolved';

    try {
      // Generate final report
      const report = await createReport('incident', ['resolution_time', 'impact_score', 'action_taken']);
      
      if (report.success) {
        console.log('Report generated:', report.report);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }

    return incident;
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }

  getIncident(id: string): Incident | null {
    return this.incidents.find(i => i.id === id) || null;
  }

  private async sendSlackAlert(incident: Incident): Promise<void> {
    try {
      await apiSendSlackAlert(
        `New security incident detected: ${incident.description}`,
        "automatic",
        incident,
        incident.severity
      );
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}
