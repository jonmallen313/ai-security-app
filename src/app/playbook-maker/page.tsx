'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface PlaybookStep {
  id: string;
  name: string;
  type: string;
  description: string;
  action: string;
  parameters: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  steps: PlaybookStep[];
  enabled: boolean;
  lastRun: string;
}

export default function PlaybookMakerPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPlaybook, setNewPlaybook] = useState({
    name: '',
    description: '',
    steps: [] as PlaybookStep[]
  });
  const [newStep, setNewStep] = useState({
    name: '',
    type: 'action',
    description: '',
    action: '',
    parameters: ''
  });

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      const response = await fetch('/api/playbooks');
      if (!response.ok) throw new Error('Failed to fetch playbooks');
      const data = await response.json();
      setPlaybooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playbooks');
      toast.error('Failed to fetch playbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaybook.steps.length === 0) {
      toast.error('Please add at least one step to the playbook');
      return;
    }

    try {
      const response = await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlaybook)
      });

      if (!response.ok) throw new Error('Failed to create playbook');
      
      toast.success('Playbook created successfully');
      setNewPlaybook({
        name: '',
        description: '',
        steps: []
      });
      fetchPlaybooks();
    } catch (err) {
      toast.error('Failed to create playbook');
    }
  };

  const handleAddStep = () => {
    if (!newStep.name || !newStep.action) {
      toast.error('Please fill in all required fields');
      return;
    }

    setNewPlaybook(prev => ({
      ...prev,
      steps: [...prev.steps, { ...newStep, id: Date.now().toString() }]
    }));
    setNewStep({
      name: '',
      type: 'action',
      description: '',
      action: '',
      parameters: ''
    });
  };

  const togglePlaybook = async (playbookId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/playbooks/${playbookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) throw new Error('Failed to update playbook');
      
      toast.success(`Playbook ${enabled ? 'enabled' : 'disabled'}`);
      fetchPlaybooks();
    } catch (err) {
      toast.error('Failed to update playbook');
    }
  };

  const runPlaybook = async (playbookId: string) => {
    try {
      const response = await fetch(`/api/playbooks/${playbookId}/run`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to run playbook');
      
      toast.success('Playbook executed successfully');
      fetchPlaybooks();
    } catch (err) {
      toast.error('Failed to run playbook');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Playbook</CardTitle>
          <CardDescription>Define a new security playbook with steps</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlaybook} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Playbook Name</label>
              <Input
                id="name"
                value={newPlaybook.name}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={newPlaybook.description}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Steps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="stepName">Step Name</label>
                  <Input
                    id="stepName"
                    value={newStep.name}
                    onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stepType">Step Type</label>
                  <Select
                    value={newStep.type}
                    onValueChange={(value) => setNewStep({ ...newStep, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select step type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="stepDescription">Step Description</label>
                <Textarea
                  id="stepDescription"
                  value={newStep.description}
                  onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stepAction">Action</label>
                <Input
                  id="stepAction"
                  value={newStep.action}
                  onChange={(e) => setNewStep({ ...newStep, action: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stepParameters">Parameters (JSON)</label>
                <Textarea
                  id="stepParameters"
                  value={newStep.parameters}
                  onChange={(e) => setNewStep({ ...newStep, parameters: e.target.value })}
                />
              </div>
              <Button type="button" onClick={handleAddStep}>
                Add Step
              </Button>
            </div>

            {newPlaybook.steps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Added Steps</h3>
                <div className="space-y-2">
                  {newPlaybook.steps.map((step) => (
                    <Card key={step.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{step.name}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          <div className="text-sm">
                            <span className="px-2 py-1 bg-muted rounded-full">
                              {step.type}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit">Create Playbook</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {playbooks.map((playbook) => (
          <Card key={playbook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{playbook.name}</CardTitle>
                  <CardDescription>
                    Last run: {new Date(playbook.lastRun).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={playbook.enabled}
                    onCheckedChange={(checked) => togglePlaybook(playbook.id, checked)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => runPlaybook(playbook.id)}
                  >
                    Run Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{playbook.description}</p>
              <div className="space-y-4">
                {playbook.steps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {index + 1}. {step.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 bg-muted rounded-full">
                            {step.type}
                          </span>
                        </div>
                      </div>
                      {step.parameters && (
                        <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
                          {JSON.stringify(JSON.parse(step.parameters), null, 2)}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 