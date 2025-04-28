'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getIncidents, Incident } from '@/services/incidents';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { toast } from '@/hooks/use-toast';
import { Check, AlertTriangle, MessageSquare, Bot } from 'lucide-react';
import ChatDialog, { Message } from "@/components/ui/chat-dialog";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import ActivityFeedOverlay from '@/components/ActivityFeed';

interface AgentResponse {
  role: "assistant" | "user"
  content: string;
}

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [analystComments, setAnalystComments] = useState<{ [key: string]: string }>({});
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);


  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  const toggleIncidentSelection = (incidentId: string) => {
    setSelectedIncidents((prevSelectedIncidents) => {
      const isSelected = prevSelectedIncidents.includes(incidentId);
      if (isSelected) {
        return prevSelectedIncidents.filter((id) => id !== incidentId);
      } else {
        return [...prevSelectedIncidents, incidentId];
      }
    });
  };

  const handleCommentChange = (incidentId: string, comment: string) => {
    setAnalystComments(prev => ({ ...prev, [incidentId]: comment }));
  };

  const handleTagIncident = (incident: Incident, tag: string) => {
    toast({
      title: `Incident ${incident.id} tagged as ${tag}`
    });
  };

  const handleExportSelected = () => {
    // Mock export functionality
    const selectedData = incidents.filter(incident => selectedIncidents.includes(incident.id));
    console.log('Exporting:', selectedData);
    toast({ title: `Exported ${selectedIncidents.length} incidents` });
  };


  const handleMarkAsResolved = () => {
    // Mock Resolve functionality
    toast({ title: `Marked ${selectedIncidents.length} incidents as Resolved` });

  };

  const handleEscalateToTier2 = () => {
    // Mock Escalate functionality
    toast({
      title: `Escalated ${selectedIncidents.length} incidents to Tier 2`,
    });
  };


  const handleAskAgentforce = async (incident: Incident) => {
    if (!incident) return;
    setSelectedIncident(incident);
    setIsChatModalOpen(true);
    setMessages([
      {
        role: "assistant",
        content: `Analyzing incident: Time: ${incident.time}, Source IP: ${incident.sourceIp}, Description: ${incident.description}. Suggested mitigations and analysis will appear below.`,
      },
    ]);
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!selectedIncident) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    const response = await agentResponse(message, selectedIncident);
    setMessages((prev) => [...prev, {
      role: response.role,
      content: response.content,
    }]);

    setIsLoading(false);
  };


  const handleCloseModal = () => {
    setIsChatModalOpen(false);
    setSelectedIncident(null);
  };


  const agentResponse = async (message: string, incident: Incident): Promise<AgentResponse> => {

    return { role: "assistant", content: `Agent response to: ${message} regarding incident: ${incident.id}` };
  };

  return (
    <>
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Security Incidents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident) => {

            const incidentId = incident.id;
            return (
              <Card key={incident.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>
                    <div className="flex items-center">
                      <Checkbox
                        id={`select-${incidentId}`}
                        checked={selectedIncidents.includes(incidentId)}
                        onCheckedChange={() => toggleIncidentSelection(incidentId)}
                      />
                      <label
                        htmlFor={`select-${incident.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Threat Level: {incident.threatLevel}
                      </label>
                    </div>
                  </CardTitle>
                  <CardDescription>Time: {incident.time}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>Source IP: {incident.sourceIp}</p>
                  <p>Description: {incident.description}</p>
                  <Textarea
                    placeholder="Add analyst comments..."
                    value={analystComments[incidentId] || ''}
                    onChange={(e) => handleCommentChange(incidentId, e.target.value)}
                  />
                </CardContent>
                <CardContent className="flex justify-around">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incident, 'False Positive')}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>False Positive</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incident, 'Confirmed Threat')}>
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confirmed Threat</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incident, 'Needs Review')}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Needs Review</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleAskAgentforce(incident)}>
                        <Bot className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ask Agentforce</p>


                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {selectedIncidents.length > 0 && (
        <div className="sticky bottom-0 bg-secondary p-4 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Triage Panel</h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportSelected}>Export Selected</Button>
            <Button onClick={handleMarkAsResolved}>Mark as Resolved</Button>
            <Button onClick={handleEscalateToTier2}>Escalate to Tier 2</Button>
          </div>
        </div>
      )}

      <section>
        <Table>
          <TableCaption>A list of security incidents and their MITRE ATT&amp;CK techniques.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead>Threat Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>MITRE Tactic</TableHead>
              <TableHead>MITRE Technique</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">{incident.time}</TableCell>
                <TableCell>{incident.sourceIp}</TableCell>
                <TableCell>{incident.threatLevel}</TableCell>
                <TableCell>{incident.description}</TableCell>
                <TableCell className={incident.mitreTactic === 'N/A' ? 'text-muted-foreground' : ''}>
                  {incident.mitreTactic}
                </TableCell>
                <TableCell className={incident.mitreTechnique === 'N/A' ? 'text-muted-foreground' : ''}>
                  {incident.mitreTechnique}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </section>
          <section>
          {isChatModalOpen && selectedIncident && (
            <ChatDialog
              messages={messages}
              incident={selectedIncident}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onClose={handleCloseModal}
              initialMessages={[
                                {
                                  role: "assistant",
                                  content: `Analyzing incident: Time: ${selectedIncident.time}, Source IP: ${selectedIncident.sourceIp}, Description: ${selectedIncident.description}. What would you like to know?`,
                                },
                              ]}
              setMessages={setMessages}
            />)}
              </section>
              <Button onClick={() => setIsActivityFeedOpen(!isActivityFeedOpen)}>
                {isActivityFeedOpen ? "Hide Activity Feed" : "Show Activity Feed"}
              </Button>
              {isActivityFeedOpen && (
                  <ActivityFeedOverlay
                    events={[
                      {
                        id: '1',
                        type: 'new_incident',
                        timestamp: new Date().toISOString(),
                        source: 'System',
                        message: 'High severity incident detected: SSH brute force from 203.0.113.5'
                      },
                      {
                        id: '2',
                        type: 'agent_response',
                        timestamp: new Date().toISOString(),
                        source: 'Agentforce',
                        message: 'Recommended firewall block: 203.0.113.0/24'
                      },
                    ]}
                  />
                )}
    </>
  );
};

export default IncidentsPage;
