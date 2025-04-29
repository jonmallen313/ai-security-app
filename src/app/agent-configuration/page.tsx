'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save } from 'lucide-react';

// Define the agent configuration schema with Zod
const agentConfigSchema = z.object({
  agentName: z.string().min(1, "Agent name is required"),
  slackChannel: z.string().min(1, "Slack channel is required"),
  tasks: z.object({
    sendAlerts: z.boolean().default(false),
    monitorLogs: z.boolean().default(false),
    autoGenerateMitigations: z.boolean().default(false),
  }),
});

// Define the AgentConfig type
type AgentConfig = z.infer<typeof agentConfigSchema>;

// Default configuration
const defaultConfig: AgentConfig = {
  agentName: "Agentforce",
  slackChannel: "#security-alerts",
  tasks: {
    sendAlerts: true,
    monitorLogs: true,
    autoGenerateMitigations: false,
  },
};

const AgentConfigurationPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<AgentConfig>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: defaultConfig,
  });

  // Watch the tasks values
  const tasks = watch("tasks");

  // Load configuration from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('agentConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setValue("agentName", config.agentName);
      setValue("slackChannel", config.slackChannel);
      setValue("tasks.sendAlerts", config.tasks.sendAlerts);
      setValue("tasks.monitorLogs", config.tasks.monitorLogs);
      setValue("tasks.autoGenerateMitigations", config.tasks.autoGenerateMitigations);
    }
  }, [setValue]);

  // Handle form submission
  const onSubmit = async (data: AgentConfig) => {
    setIsSaving(true);
    
    try {
      // Save configuration to localStorage
      localStorage.setItem('agentConfig', JSON.stringify(data));
      
      toast({
        title: "Configuration saved",
        description: "Your agent configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "There was an error saving your agent configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Agent Configuration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Agent</CardTitle>
          <CardDescription>
            Set up your agent's name, Slack channel, and tasks to perform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input 
                id="agentName" 
                placeholder="Enter agent name" 
                {...register("agentName")} 
              />
              {errors.agentName && (
                <p className="text-sm text-red-500">{errors.agentName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slackChannel">Slack Channel</Label>
              <Input 
                id="slackChannel" 
                placeholder="Enter Slack channel (e.g., #security-alerts)" 
                {...register("slackChannel")} 
              />
              {errors.slackChannel && (
                <p className="text-sm text-red-500">{errors.slackChannel.message}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <Label>Tasks to Perform</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendAlerts" 
                    checked={tasks.sendAlerts}
                    onCheckedChange={(checked) => setValue("tasks.sendAlerts", checked as boolean)}
                  />
                  <Label htmlFor="sendAlerts">Send Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="monitorLogs" 
                    checked={tasks.monitorLogs}
                    onCheckedChange={(checked) => setValue("tasks.monitorLogs", checked as boolean)}
                  />
                  <Label htmlFor="monitorLogs">Monitor Logs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoGenerateMitigations" 
                    checked={tasks.autoGenerateMitigations}
                    onCheckedChange={(checked) => setValue("tasks.autoGenerateMitigations", checked as boolean)}
                  />
                  <Label htmlFor="autoGenerateMitigations">Auto-Generate Mitigations</Label>
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentConfigurationPage; 