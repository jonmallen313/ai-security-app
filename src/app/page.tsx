"use client";

import React, { useState, useEffect } from "react";
import {getIncidents, Incident} from '@/services/incidents';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from '@/components/ui/sidebar';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {analyzeSecurityIncident} from '@/ai/flows/analyze-security-incident';
import {useToast} from "@/hooks/use-toast";
import MITREHeatmap from '@/components/MITREHeatmap';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const {toast} = useToast();

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  const handleAgentForceClick = async (incident: Incident) => {
    try {
      const analysis = await analyzeSecurityIncident(incident);
      toast({
        title: "AgentForce Analysis",
        description: analysis.analysis
      })
    } catch (error) {
      console.error("Error analyzing incident:", error);
      toast({
        title: "Error",
        description: "Failed to analyze the incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton>Dashboard</SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton>Incidents</SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 p-4 space-y-4">
            <header className="flex items-center justify-between h-16 border-b bg-background">
                <div className="flex items-center">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-semibold ml-2">SecureView Dashboard</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Security Incidents</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {incidents.map((incident, index) => (
                            <Card key={index} className="shadow-md">
                                <CardHeader>
                                    <CardTitle>Threat Level: {incident.threatLevel}</CardTitle>
                                    <CardDescription>Time: {incident.time}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>Source IP: {incident.sourceIp}</p>
                                    <p>Description: {incident.description}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => handleAgentForceClick(incident)}>Ask Agentforce</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="mt-8">
                  <h2 className="text-xl font-semibold">MITRE ATT&amp;CK Heatmap</h2>
                  <MITREHeatmap />
                </section>
              </main>
            </div>
          </div>
        </SidebarProvider>
      );
    };
