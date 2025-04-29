'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface LogSource {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  credentials: string;
  filters: string;
  enabled: boolean;
  lastSync: string;
}

export default function LogIntegrationPage() {
  const [sources, setSources] = useState<LogSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'syslog',
    endpoint: '',
    credentials: '',
    filters: ''
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/log-sources');
      if (!response.ok) throw new Error('Failed to fetch log sources');
      const data = await response.json();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log sources');
      toast.error('Failed to fetch log sources');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/log-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      });

      if (!response.ok) throw new Error('Failed to add log source');
      
      toast.success('Log source added successfully');
      setNewSource({
        name: '',
        type: 'syslog',
        endpoint: '',
        credentials: '',
        filters: ''
      });
      fetchSources();
    } catch (err) {
      toast.error('Failed to add log source');
    }
  };

  const toggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/log-sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) throw new Error('Failed to update log source');
      
      toast.success(`Log source ${enabled ? 'enabled' : 'disabled'}`);
      fetchSources();
    } catch (err) {
      toast.error('Failed to update log source');
    }
  };

  const syncSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/log-sources/${sourceId}/sync`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to sync log source');
      
      toast.success('Log source synced successfully');
      fetchSources();
    } catch (err) {
      toast.error('Failed to sync log source');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Log Source</CardTitle>
          <CardDescription>Configure a new log source for integration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSource} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name">Source Name</label>
                <Input
                  id="name"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type">Source Type</label>
                <Select
                  value={newSource.type}
                  onValueChange={(value) => setNewSource({ ...newSource, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="syslog">Syslog</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="endpoint">Endpoint URL</label>
              <Input
                id="endpoint"
                value={newSource.endpoint}
                onChange={(e) => setNewSource({ ...newSource, endpoint: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="credentials">Credentials (JSON)</label>
              <Textarea
                id="credentials"
                value={newSource.credentials}
                onChange={(e) => setNewSource({ ...newSource, credentials: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="filters">Filters (JSON)</label>
              <Textarea
                id="filters"
                value={newSource.filters}
                onChange={(e) => setNewSource({ ...newSource, filters: e.target.value })}
                placeholder="Optional: Define filters for log processing"
              />
            </div>
            <Button type="submit">Add Source</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{source.name}</CardTitle>
                  <CardDescription>
                    Last synced: {new Date(source.lastSync).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(checked) => toggleSource(source.id, checked)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => syncSource(source.id)}
                  >
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Type:</strong> {source.type}
                </div>
                <div>
                  <strong>Endpoint:</strong> {source.endpoint}
                </div>
                {source.filters && (
                  <div>
                    <strong>Filters:</strong>
                    <pre className="mt-1 p-2 bg-muted rounded-md">
                      {JSON.stringify(JSON.parse(source.filters), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 