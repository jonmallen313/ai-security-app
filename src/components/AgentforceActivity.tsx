'use client';

import React, { useEffect, useState } from 'react';
import { AgentforceLog, getAgentforceLogs } from '@/services/agentforce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentforceActivityProps {
  className?: string;
  maxItems?: number;
}

export function AgentforceActivity({ className, maxItems = 10 }: AgentforceActivityProps) {
  const [logs, setLogs] = useState<AgentforceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadLogs = () => {
      const allLogs = getAgentforceLogs();
      setLogs(allLogs.slice(-maxItems).reverse());
      setLoading(false);
    };

    loadLogs();

    // Set up polling to refresh logs
    const interval = setInterval(loadLogs, 5000);

    return () => clearInterval(interval);
  }, [maxItems]);

  const getActionIcon = (action: AgentforceLog['action']) => {
    switch (action) {
      case 'analyzed':
        return <Bot className="h-4 w-4" />;
      case 'alerted':
        return <AlertTriangle className="h-4 w-4" />;
      case 'mitigated':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: AgentforceLog['action']) => {
    switch (action) {
      case 'analyzed':
        return 'bg-blue-500';
      case 'alerted':
        return 'bg-red-500';
      case 'mitigated':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Agentforce Activity</CardTitle>
          <Badge className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            <span>AI Agent</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading agent activity...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bot className="h-8 w-8 mb-2 opacity-50" />
              <p>No agent activity yet</p>
              <p className="text-sm">Agentforce will appear here when processing events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={cn("rounded-full p-1.5 mt-0.5", getActionColor(log.action))}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 