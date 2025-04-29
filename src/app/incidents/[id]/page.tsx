import { notFound } from "next/navigation";
import { IncidentService } from "@/services/incidents";
import { AgentAnalysis } from "@/components/AgentAnalysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIncident } from "@/services/api";

// Initialize service
const incidentService = new IncidentService();

export default async function IncidentPage({
  params,
}: {
  params: { id: string };
}) {
  let incident;
  
  try {
    // Try to get incident from API first
    incident = await getIncident(params.id);
  } catch (error) {
    // Fallback to local service if API fails
    incident = incidentService.getIncident(params.id);
  }
  
  if (!incident) {
    notFound();
  }

  const handleExecuteAction = async (action: string) => {
    'use server';
    
    try {
      let result;
      
      switch (action) {
        case 'analyzeIncident':
          result = await incidentService.analyzeIncident(incident.id);
          break;
        case 'checkCompliance':
          // This would be implemented in the API
          console.log('Checking compliance for incident:', incident.id);
          break;
        case 'assessRisk':
          // This would be implemented in the API
          console.log('Assessing risk for incident:', incident.id);
          break;
        case 'generateResponse':
          // This would be implemented in the API
          console.log('Generating response for incident:', incident.id);
          break;
        default:
          console.error('Unknown action:', action);
          return;
      }
      
      if (result) {
        // Refresh the page to show updated recommendations
        // In a real app, you'd want to use client-side state management
        window.location.reload();
      }
    } catch (error) {
      console.error(`Failed to execute action ${action}:`, error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incident Details</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => incidentService.analyzeIncident(incident.id)}
          >
            Analyze
          </Button>
          <Button
            variant="default"
            onClick={() => incidentService.resolveIncident(incident.id)}
          >
            Mark Resolved
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Basic Information</span>
              <Badge variant={incident.severity === 'critical' ? 'destructive' : 'default'}>
                {incident.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Status:</div>
              <div>{incident.status}</div>
              <div className="font-medium">Type:</div>
              <div>{incident.type}</div>
              <div className="font-medium">Source IP:</div>
              <div>{incident.sourceIp}</div>
              <div className="font-medium">Time:</div>
              <div>{new Date(incident.timestamp).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <AgentAnalysis
          incident={incident}
          onExecuteAction={handleExecuteAction}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{incident.description}</p>
        </CardContent>
      </Card>
    </div>
  );
} 