import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Incident } from '@/services/incidents';

interface AgentAnalysisProps {
  incident: Incident;
  onExecuteAction: (action: string) => void;
}

export function AgentAnalysis({ incident, onExecuteAction }: AgentAnalysisProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Agent Analysis</span>
          <Badge variant={incident.severity === 'critical' ? 'destructive' : 'default'}>
            {incident.severity}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Incident Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Type:</div>
              <div>{incident.type}</div>
              <div>Source IP:</div>
              <div>{incident.sourceIp}</div>
              <div>Time:</div>
              <div>{new Date(incident.timestamp).toLocaleString()}</div>
              {incident.mitreTechnique && (
                <>
                  <div>MITRE Technique:</div>
                  <div>{incident.mitreTechnique}</div>
                </>
              )}
            </div>
          </div>

          {incident.recommendations && incident.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">AI Recommendations</h3>
              <ul className="list-disc pl-4 space-y-1">
                {incident.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onExecuteAction('analyzeIncident')}
            >
              Re-analyze
            </Button>
            <Button
              variant="outline"
              onClick={() => onExecuteAction('checkCompliance')}
            >
              Check Compliance
            </Button>
            <Button
              variant="outline"
              onClick={() => onExecuteAction('assessRisk')}
            >
              Assess Risk
            </Button>
            <Button
              variant="default"
              onClick={() => onExecuteAction('generateResponse')}
            >
              Generate Response Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 