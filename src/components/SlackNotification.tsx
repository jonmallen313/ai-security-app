import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendSlackAlert } from '@/services/api';
import { Incident } from '@/services/incidents';
import { toast } from 'sonner';

interface SlackNotificationProps {
  incident?: Incident;
}

export function SlackNotification({ incident }: SlackNotificationProps) {
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('manual');
  const [severity, setSeverity] = useState('info');
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await sendSlackAlert(
        message,
        alertType,
        incident,
        severity
      );
      
      if (response.success) {
        toast.success('Slack notification sent successfully');
        setMessage('');
      } else {
        toast.error(`Failed to send notification: ${response.message}`);
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      toast.error('Failed to send Slack notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Slack Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alert Type</label>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
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
          </div>
          
          <Button 
            onClick={handleSendNotification} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 