'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface SlackNotification {
  id: string;
  message: string;
  channel: string;
  type: string;
  severity: string;
  timestamp: string;
}

export default function SlackNotificationsPage() {
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('');
  const [type, setType] = useState('alert');
  const [severity, setSeverity] = useState('medium');
  const [isSending, setIsSending] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<SlackNotification[]>([]);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/slack/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          channel: channel || undefined,
          type,
          severity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      
      // Add the new notification to the list
      setRecentNotifications([
        {
          id: data.id,
          message,
          channel: channel || 'default',
          type,
          severity,
          timestamp: new Date().toISOString(),
        },
        ...recentNotifications,
      ]);

      // Clear the form
      setMessage('');
      setChannel('');
      setType('alert');
      setSeverity('medium');

      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Slack Notifications</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>Send a notification to Slack</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Channel (optional)</label>
                <Input
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="Enter channel name without #"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Alert Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>View your recently sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.length === 0 ? (
                <p className="text-gray-500">No recent notifications</p>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{notification.type}</span>
                        <span className="text-gray-500 ml-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          notification.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : notification.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : notification.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {notification.severity}
                      </span>
                    </div>
                    <p className="text-gray-700">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      Channel: #{notification.channel}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 