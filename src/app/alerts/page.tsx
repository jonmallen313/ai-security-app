"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Plus, Send, Trash2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { sendSlackAlert, sendTestAlert } from "@/services/slack-alerts";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

interface AlertSettings {
  autoAlertsEnabled: boolean;
  webhooks: WebhookConfig[];
}

export default function AlertsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AlertSettings>({
    autoAlertsEnabled: false,
    webhooks: []
  });
  const [testMessage, setTestMessage] = useState("");
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "" });
  const [isSending, setIsSending] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        autoAlertsEnabled: parsed.autoAlertsEnabled || false,
        webhooks: parsed.webhooks || []
      });
    } else {
      // Set default webhook configuration if no settings exist
      const defaultSettings = {
        autoAlertsEnabled: true,
        webhooks: [
          {
            id: "default-webhook",
            name: "Default Security Alerts",
            url: "",
            enabled: true
          }
        ]
      };
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: AlertSettings) => {
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    toast({
      title: "Settings saved",
      description: "Your alert settings have been updated.",
    });
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and URL for the webhook.",
        variant: "destructive",
      });
      return;
    }

    const updatedSettings = {
      ...settings,
      webhooks: [
        ...settings.webhooks,
        {
          id: Date.now().toString(),
          name: newWebhook.name,
          url: newWebhook.url,
          enabled: true
        }
      ]
    };
    saveSettings(updatedSettings);
    setNewWebhook({ name: "", url: "" });
  };

  const handleRemoveWebhook = (id: string) => {
    const updatedSettings = {
      ...settings,
      webhooks: settings.webhooks.filter(webhook => webhook.id !== id)
    };
    saveSettings(updatedSettings);
  };

  const handleToggleWebhook = (id: string) => {
    const updatedSettings = {
      ...settings,
      webhooks: settings.webhooks.map(webhook =>
        webhook.id === id ? { ...webhook, enabled: !webhook.enabled } : webhook
      )
    };
    saveSettings(updatedSettings);
  };

  const handleToggleAutoAlerts = () => {
    const updatedSettings = {
      ...settings,
      autoAlertsEnabled: !settings.autoAlertsEnabled
    };
    saveSettings(updatedSettings);
  };

  const handleTestAlert = async () => {
    if (!testMessage) {
      toast({
        title: "Validation Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const success = await sendSlackAlert({
        messageText: testMessage,
        alertType: "manual",
        severity: "info"
      });
      
      if (success) {
        toast({
          title: "Alert Sent",
          description: "Test alert was sent successfully.",
        });
        setTestMessage("");
      } else {
        throw new Error("Failed to send alert");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test alert. Please check your webhook configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickTest = async () => {
    setIsSending(true);
    try {
      // Check if webhooks are configured
      if (!settings.webhooks || settings.webhooks.length === 0) {
        toast({
          title: "No webhooks configured",
          description: "Please add a Slack webhook URL in the settings above.",
          variant: "destructive",
        });
        return;
      }

      // Check if any webhooks are enabled
      const enabledWebhooks = settings.webhooks.filter(webhook => webhook.enabled);
      if (enabledWebhooks.length === 0) {
        toast({
          title: "No enabled webhooks",
          description: "Please enable at least one webhook in the settings above.",
          variant: "destructive",
        });
        return;
      }

      // Check if any webhooks have a URL
      const webhooksWithUrl = enabledWebhooks.filter(webhook => webhook.url && webhook.url.trim() !== "");
      if (webhooksWithUrl.length === 0) {
        toast({
          title: "No webhook URLs configured",
          description: "Please add a valid Slack webhook URL in the settings above.",
          variant: "destructive",
        });
        return;
      }

      const success = await sendTestAlert();
      
      if (success) {
        toast({
          title: "Test Alert Sent",
          description: "A test alert was sent to Slack successfully.",
        });
      } else {
        throw new Error("Failed to send test alert");
      }
    } catch (error) {
      console.error("Error sending test alert:", error);
      toast({
        title: "Error",
        description: "Failed to send test alert. Please check your webhook configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alert Settings</h1>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="text-muted-foreground">Configure alert notifications</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Alerts</CardTitle>
          <CardDescription>Configure automatic alert settings for security incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.autoAlertsEnabled}
              onCheckedChange={handleToggleAutoAlerts}
            />
            <Label>Enable automatic alerts for critical and high severity incidents</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slack Webhooks</CardTitle>
          <CardDescription>Manage Slack webhook configurations for different channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="webhookName">Webhook Name</Label>
              <Input
                id="webhookName"
                placeholder="e.g., Security Alerts Channel"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.slack.com/services/..."
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleAddWebhook} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>

          <div className="space-y-2">
            {settings.webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{webhook.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{webhook.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.enabled}
                    onCheckedChange={() => handleToggleWebhook(webhook.id)}
                  />
                  <Button
                    className={buttonVariants({ variant: "destructive", size: "icon" })}
                    onClick={() => handleRemoveWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Alerts</CardTitle>
          <CardDescription>Send a test alert to verify your webhook configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleQuickTest} 
              disabled={isSending}
              className="w-full mb-4"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send Quick Test Alert"}
            </Button>
            
            <div>
              <Label htmlFor="testMessage">Custom Alert Message</Label>
              <Textarea
                id="testMessage"
                placeholder="Enter your test alert message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleTestAlert}
            disabled={isSending || !testMessage}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Sending..." : "Send Custom Alert"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 