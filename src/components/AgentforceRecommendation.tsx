'use client';

import React, { useEffect, useState } from 'react';
import { AgentforceResponse, processEvent, incidentToEvent, applyMitigation } from '@/services/agentforce';
import { Incident } from '@/services/incidents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, Shield, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AgentforceRecommendationProps {
  incident: Incident;
  className?: string;
}

export function AgentforceRecommendation({ incident, className }: AgentforceRecommendationProps) {
  const [response, setResponse] = useState<AgentforceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingMitigation, setApplyingMitigation] = useState(false);
  const [mitigationApplied, setMitigationApplied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const analyzeIncident = async () => {
      setLoading(true);
      try {
        const event = incidentToEvent(incident);
        const result = await processEvent(event);
        setResponse(result);
      } catch (error) {
        console.error('Error processing incident:', error);
        toast({
          title: 'Error',
          description: 'Failed to analyze incident with Agentforce',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    analyzeIncident();
  }, [incident, toast]);

  const handleApplyMitigation = async () => {
    if (!response) return;
    
    setApplyingMitigation(true);
    try {
      await applyMitigation(response.eventId, response.mitigation);
      setMitigationApplied(true);
      toast({
        title: 'Mitigation Applied',
        description: 'The recommended mitigation has been applied to this incident.',
      });
    } catch (error) {
      console.error('Error applying mitigation:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply mitigation',
        variant: 'destructive',
      });
    } finally {
      setApplyingMitigation(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentforce Analysis
            </CardTitle>
            <CardDescription>
              AI-powered security recommendations
            </CardDescription>
          </div>
          <Badge className={cn(
            "flex items-center gap-1",
            response?.shouldAlert ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          )}>
            {response?.shouldAlert ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Alert Recommended</span>
              </>
            ) : (
              <>
                <Shield className="h-3 w-3" />
                <span>No Alert Needed</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Agentforce is analyzing this incident...</p>
            <p className="text-xs text-muted-foreground">This may take a few moments</p>
          </div>
        ) : response ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Summary</h4>
              <p className="text-sm text-muted-foreground">{response.summary}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Recommended Mitigation</h4>
              <p className="text-sm text-muted-foreground">{response.mitigation}</p>
            </div>
            
            {response.shouldAlert && (
              <div>
                <h4 className="text-sm font-medium mb-1">Alert Reason</h4>
                <p className="text-sm text-muted-foreground">{response.alertReason}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground pt-2">
              Analysis completed in {response.processingTime}ms
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bot className="h-8 w-8 mb-2 opacity-50" />
            <p>Unable to analyze this incident</p>
          </div>
        )}
      </CardContent>
      {response && !loading && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleApplyMitigation}
            disabled={applyingMitigation || mitigationApplied}
          >
            {applyingMitigation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying Mitigation...
              </>
            ) : mitigationApplied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mitigation Applied
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Apply Recommended Mitigation
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 