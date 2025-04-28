'use client';

import React, {useState, useEffect} from 'react';
import {getIncidents, Incident} from '@/services/incidents';
import MITREHeatmap from '@/components/MITREHeatmap';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipTrigger, TooltipContent} from '@/components/ui/tooltip';
import {toast} from '@/hooks/use-toast';
import {Check, AlertTriangle, MessageSquare, Bot} from 'lucide-react';
import {Message} from '@/components/ui/chat-dialog';
import ActivityFeed from '@/components/ActivityFeed';
import {analyzeSecurityIncident} from '@/ai/flows/analyze-security-incident';
import ChatModal from '@/components/ui/chat-dialog';
import {Dialog, DialogTrigger, DialogContent} from "@/components/ui/dialog"


const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [analystComments, setAnalystComments] = useState<{[key: string]: string}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadIncidents = async () => {
        const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  const toggleIncidentSelection = (incidentId: string) => {
    setSelectedIncidents(prev => {
      if (prev.includes(incidentId)) {
        return prev.filter(id => id !== incidentId);
      } else {
        return [...prev, incidentId];
      }
    });
  };

  const handleCommentChange = (incidentId: string, comment: string) => {
    setAnalystComments(prev => ({...prev, [incidentId]: comment}));
  };

  const handleTagIncident = (incidentId: string, tag: string) => {
    toast({
      title: `Incident ${incidentId} tagged as ${tag}`,
    });
  };

  const handleExportSelected = () => {
    // Mock export functionality
    const selectedData = incidents.filter(incident => selectedIncidents.includes(`${incident.time}-${incident.sourceIp}`));
    console.log('Exporting:', selectedData);
    toast({
      title: `Exported ${selectedIncidents.length} incidents`,
    });
  };

  const handleAskAgentforce = async (incident: Incident) => {
    setSelectedIncident(incident)
	setIsModalOpen(true);
  };

  const handleMarkAsResolved = () => {
    // Mock Resolve functionality
    toast({
      title: `Marked ${selectedIncidents.length} incidents as Resolved`,
    });
  };

  const handleEscalateToTier2 = () => {
    // Mock Escalate functionality
    toast({
      title: `Escalated ${selectedIncidents.length} incidents to Tier 2`,
    });
  };

  return (
        <div>    
    <div className="flex flex-col gap-4">
      <section>
        <h2 className="text-xl font-semibold mb-4">MITRE ATT&amp;CK Heatmap</h2>
        <MITREHeatmap/>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Security Incidents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident, index) => {
            const incidentId = `${incident.time}-${incident.sourceIp}`;
            return (
              <Card key={index} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>
                    <div className="flex items-center">
                      <Checkbox
                        id={`select-${incidentId}`}
                        checked={selectedIncidents.includes(incidentId)}
                        onCheckedChange={() => toggleIncidentSelection(incidentId)}
                      />
                      <label
                        htmlFor={`select-${incidentId}`}
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
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incidentId, 'False Positive')}>
                        <Check className="h-4 w-4"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>False Positive</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incidentId, 'Confirmed Threat')}>
                        <AlertTriangle className="h-4 w-4"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Confirmed Threat</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleTagIncident(incidentId, 'Needs Review')}>
                        <MessageSquare className="h-4 w-4"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Needs Review</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Dialog open={selectedIncident?.time === incident.time && selectedIncident?.sourceIp === incident.sourceIp && isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => handleAskAgentforce(incident)}>
                                            <Bot className="h-4 w-4"/>
                                        </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <ChatModal
                                        isOpen={isModalOpen}
                                        setIsOpen={setIsModalOpen}
                                        incident={incident}
                                        initialMessages={[{role: 'assistant', content: `Analyzing incident: Time: ${incident.time}, Source IP: ${incident.sourceIp}, Description: ${incident.description}. Suggested mitigations and analysis will appear below.`}]}
                                        setMessages={setMessages}
                                        trigger={<Button variant="outline" size="icon"><Bot className="h-4 w-4"/></Button>}
                                        />
                                </DialogContent>
                            </Dialog>
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
      <section className="h-96">
        <ActivityFeed/>
      </section>
    </div>
    </div>
  );
};

export default IncidentsPage;
