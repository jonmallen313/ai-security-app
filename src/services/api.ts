import axios from 'axios';
import { Incident } from './incidents';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RiskAssessmentResponse {
  success: boolean;
  incidentId: string;
  riskScore: number;
  riskLevel: string;
  recommendations: string[];
}

export interface ResponsePlan {
  incidentId: string;
  steps: {
    order: number;
    action: string;
    description: string;
    assignee: string;
  }[];
  estimatedTime: string;
  priority: string;
}

export interface ResponsePlanResponse {
  success: boolean;
  responsePlan: ResponsePlan;
}

export interface ReportResponse {
  success: boolean;
  report: {
    title: string;
    generatedAt: string;
    summary: {
      totalIncidents: number;
      criticalIncidents: number;
      resolvedIncidents: number;
      averageResolutionTime: string;
    };
    metrics: Record<string, string>;
    recommendations: string[];
  };
}

export interface SlackResponse {
  success: boolean;
  message: string;
}

// API functions
export const getIncidents = async (): Promise<Incident[]> => {
  const response = await api.get('/incidents');
  return response.data;
};

export const getIncident = async (id: string): Promise<Incident> => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const assessRisk = async (incidentId: string): Promise<RiskAssessmentResponse> => {
  const response = await api.post('/assess-risk', { incidentId });
  return response.data;
};

export const generateResponse = async (incidentId: string): Promise<ResponsePlanResponse> => {
  const response = await api.post('/generate-response', { incidentId });
  return response.data;
};

export const createReport = async (timeRange: string, metrics: string[]): Promise<ReportResponse> => {
  const response = await api.post('/create-report', { timeRange, metrics });
  return response.data;
};

export const sendSlackAlert = async (
  messageText: string,
  alertType: string,
  incident?: Incident,
  severity?: string
): Promise<SlackResponse> => {
  try {
    const response = await api.post('/api/alerts/slack', {
      message: messageText,
      alert_type: alertType,
      severity: severity || 'info',
      incident_id: incident?.id
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 