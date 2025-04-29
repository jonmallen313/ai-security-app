"use client";

import React, { useEffect, useState, useCallback } from "react";
import Dashboard from "@/components/Dashboard";
import { useTheme } from "@/hooks/use-theme";
import ChatDialog, { Message } from "@/components/ui/chat-dialog";
import ActivityFeedOverlay from '@/components/ActivityFeed';
import { Incident } from '@/services/incidents';
import { getIncidents } from '@/services/api';
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Minus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { analyzeSecurityIncident } from '@/ai/flows/analyze-security-incident';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentforceEvent, AgentforceResponse, processEvent, incidentToEvent, getAgentforceLogs } from '@/services/agentforce';
import { Bot, AlertTriangle, Shield, Activity, BarChart, LineChart, PieChart } from 'lucide-react';
import { AgentforceActivity } from '@/components/AgentforceActivity';
import { AgentforceRecommendation } from '@/components/AgentforceRecommendation';
import { sendSlackNotification, sendCriticalIncidentAlert, sendManualAlert } from "@/services/slack";
import EnhancedDashboard from "@/components/EnhancedDashboard";

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState<boolean>(false);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentforceResponses, setAgentforceResponses] = useState<Record<string, AgentforceResponse>>({});
  const [processingIncidents, setProcessingIncidents] = useState<Record<string, boolean>>({});

  const handleAskAgentforce = async (incident: Incident) => {
    if (!incident) return;
    setSelectedIncident(incident);
    setIsChatModalOpen(true);
    setIsChatExpanded(true);
    setMessages([
      {
        role: "assistant",
        content: `Analyzing incident: Time: ${incident.time}, Source IP: ${incident.sourceIp}, Description: ${incident.description}, MITRE Technique: ${incident.mitreTechnique}, MITRE Tactic: ${incident.mitreTactic}. Suggested mitigations and analysis will appear below.`,
      },
    ]);
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!selectedIncident) return;
    setIsLoading(true);
    setMessages((prev: Message[]) => [...prev, { role: "user", content: message }]);

    try {
      const analysisResult = await analyzeSecurityIncident({
        time: selectedIncident.time,
        sourceIp: selectedIncident.sourceIp,
        threatLevel: selectedIncident.threatLevel,
        description: selectedIncident.description,
        message: message,
      });

      setMessages((prev: Message[]) => [...prev, {
        role: "assistant",
        content: analysisResult.analysis,
      }]);

      // If the message contains a request to send a Slack alert, handle it
      if (message.toLowerCase().includes('send alert') || 
          message.toLowerCase().includes('notify team') || 
          message.toLowerCase().includes('slack alert')) {
        
        // Extract the alert message from the user's message
        const alertMessage = message.replace(/send alert|notify team|slack alert/i, '').trim();
        
        // Send the manual alert
        const success = await sendManualAlert(
          alertMessage || `Alert regarding incident: ${selectedIncident.description}`,
          `Team Alert: ${selectedIncident.mitreTechnique}`
        );
        
        // Add a confirmation message
        setMessages((prev: Message[]) => [...prev, {
          role: "assistant",
          content: success 
            ? "✅ Alert sent to Slack successfully." 
            : "❌ Failed to send alert to Slack. Please check your settings."
        }]);
      }

    } catch (error: any) {
      console.error("Error analyzing security incident:", error);
      setMessages((prev: Message[]) => [...prev, {
        role: "assistant",
        content: `Failed to analyze the incident. Please try again later. ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsChatModalOpen(false);
    setSelectedIncident(null);
    setIsChatExpanded(false);
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const fetchedIncidents = await getIncidents();
        setIncidents(fetchedIncidents);
        
        // Process each incident with Agentforce
        const responses: Record<string, AgentforceResponse> = {};
        const processing: Record<string, boolean> = {};
        
        fetchedIncidents.forEach((incident: Incident) => {
          processing[incident.id] = true;
          
          // Process the incident with Agentforce
          const event = incidentToEvent(incident);
          processEvent(event)
            .then(response => {
              responses[incident.id] = response;
              setAgentforceResponses(prev => ({ ...prev, [incident.id]: response }));
              
              // Send Slack notification based on incident severity and Agentforce recommendation
              if (response.shouldAlert) {
                const severity = incident.threatLevel === 'critical' ? 'critical' : 
                                incident.threatLevel === 'high' ? 'error' : 
                                incident.threatLevel === 'medium' ? 'warning' : 'info';
                
                // For critical incidents, use the dedicated function
                if (severity === 'critical') {
                  sendCriticalIncidentAlert(incident);
                } else {
                  // For other severities, use the general notification function
                  sendSlackNotification({
                    type: 'incident',
                    title: `${severity === 'error' ? '⚠️' : 'ℹ️'} Security Incident Alert`,
                    message: `A ${incident.threatLevel} severity incident has been detected.`,
                    incident,
                    severity
                  });
                }
              }
            })
            .catch(error => {
              console.error('Error processing incident with Agentforce:', error);
            })
            .finally(() => {
              processing[incident.id] = false;
              setProcessingIncidents(prev => ({ ...prev, [incident.id]: false }));
            });
        });
        
        setProcessingIncidents(processing);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <EnhancedDashboard />
    </div>
  );
}

