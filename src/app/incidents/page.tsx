'use client';

import { useState } from 'react';
import Link from "next/link";
import { getIncidents } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IncidentService, Incident } from "@/services/incidents";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { AIChatDialog } from "@/components/ui/ai-chat-dialog";
import { Bot } from "lucide-react";

// Initialize service
const incidentService = new IncidentService();

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState(incidentService.getIncidents());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: '',
    severity: 'warning' as 'info' | 'warning' | 'error' | 'critical',
    description: '',
    sourceIp: '',
  });

  const handleCreateIncident = async () => {
    if (!newIncident.type || !newIncident.description || !newIncident.sourceIp) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdIncident = await incidentService.createIncident({
        ...newIncident,
        timestamp: new Date().toISOString(),
      });

      setIncidents([...incidents, createdIncident]);
      setIsDialogOpen(false);
      
      // Reset form
      setNewIncident({
        type: '',
        severity: 'warning' as 'info' | 'warning' | 'error' | 'critical',
        description: '',
        sourceIp: '',
      });

      toast({
        title: "Success",
        description: "Incident created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create incident",
        variant: "destructive",
      });
    }
  };

  const handleAskAgent = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAIChatOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Security Incidents</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Incident</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
              <DialogDescription>
                Fill in the details for the new security incident.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Input
                  id="type"
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g., Malware Detection"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="severity" className="text-right">
                  Severity
                </Label>
                <Select 
                  value={newIncident.severity} 
                  onValueChange={(value) => setNewIncident({...newIncident, severity: value as 'info' | 'warning' | 'error' | 'critical'})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sourceIp" className="text-right">
                  Source IP
                </Label>
                <Input
                  id="sourceIp"
                  value={newIncident.sourceIp}
                  onChange={(e) => setNewIncident({...newIncident, sourceIp: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Describe the incident..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateIncident}>Create Incident</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{incident.type}</span>
                <Badge
                  variant={
                    incident.severity === "critical"
                      ? "destructive"
                      : incident.severity === "error"
                      ? "default"
                      : "outline"
                  }
                >
                  {incident.severity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(incident.timestamp).toLocaleString()}
                </p>
                <p className="text-sm truncate">{incident.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{incident.status}</Badge>
                  <span className="text-xs text-gray-500">
                    {incident.sourceIp}
                  </span>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAskAgent(incident)}
                    className="flex items-center gap-1"
                  >
                    <Bot className="h-4 w-4" />
                    Ask Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedIncident && (
        <AIChatDialog 
          incident={selectedIncident} 
          open={isAIChatOpen} 
          onOpenChange={setIsAIChatOpen} 
        />
      )}
    </div>
  );
} 