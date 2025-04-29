'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from 'lucide-react';

// Define the settings schema with Zod
const settingsSchema = z.object({
  slackWebhookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  autoAlertsEnabled: z.boolean().default(true),
});

// Define the Settings type
type Settings = z.infer<typeof settingsSchema>;

// Default settings
const defaultSettings: Settings = {
  slackWebhookUrl: "",
  autoAlertsEnabled: true,
};

const SettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // Watch the autoAlertsEnabled value
  const autoAlertsEnabled = watch("autoAlertsEnabled");

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setValue("slackWebhookUrl", settings.webhooks?.[0]?.url || "");
      setValue("autoAlertsEnabled", settings.autoAlertsEnabled);
    }
  }, [setValue]);

  // Handle form submission
  const onSubmit = async (data: Settings) => {
    setIsSaving(true);
    
    try {
      // Format settings for the Slack service
      const formattedSettings = {
        webhooks: [{
          id: "default-webhook",
          name: "Default Security Alerts",
          url: data.slackWebhookUrl,
          enabled: true
        }],
        autoAlertsEnabled: data.autoAlertsEnabled
      };

      // Save settings to localStorage
      localStorage.setItem('appSettings', JSON.stringify(formattedSettings));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure your Slack webhook URL and alert settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="slackWebhookUrl">Slack Webhook URL</Label>
              <Input 
                id="slackWebhookUrl" 
                placeholder="https://hooks.slack.com/services/..." 
                {...register("slackWebhookUrl")} 
              />
              {errors.slackWebhookUrl && (
                <p className="text-sm text-red-500">{errors.slackWebhookUrl.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Leave empty to disable Slack notifications.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoAlertsEnabled" 
                checked={autoAlertsEnabled}
                onCheckedChange={(checked: boolean) => setValue("autoAlertsEnabled", checked)}
              />
              <Label htmlFor="autoAlertsEnabled">Enable Auto-Alerts</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              When enabled, critical and high severity alerts will be automatically sent to Slack.
            </p>
            
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 