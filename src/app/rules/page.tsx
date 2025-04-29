'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Rule {
  id: string;
  name: string;
  description: string;
  type: string;
  conditions: string;
  actions: string;
  enabled: boolean;
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'alert',
    conditions: '',
    actions: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/rules');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
      toast.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });

      if (!response.ok) throw new Error('Failed to create rule');
      
      toast.success('Rule created successfully');
      setNewRule({
        name: '',
        description: '',
        type: 'alert',
        conditions: '',
        actions: ''
      });
      fetchRules();
    } catch (err) {
      toast.error('Failed to create rule');
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) throw new Error('Failed to update rule');
      
      toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`);
      fetchRules();
    } catch (err) {
      toast.error('Failed to update rule');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Rule</CardTitle>
          <CardDescription>Define a new security rule for your system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name">Rule Name</label>
                <Input
                  id="name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type">Rule Type</label>
                <Select
                  value={newRule.type}
                  onValueChange={(value) => setNewRule({ ...newRule, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="conditions">Conditions (JSON)</label>
              <Textarea
                id="conditions"
                value={newRule.conditions}
                onChange={(e) => setNewRule({ ...newRule, conditions: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="actions">Actions (JSON)</label>
              <Textarea
                id="actions"
                value={newRule.actions}
                onChange={(e) => setNewRule({ ...newRule, actions: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Create Rule</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{rule.name}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <Button
                  variant={rule.enabled ? "default" : "secondary"}
                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Type:</strong> {rule.type}
                </div>
                <div>
                  <strong>Conditions:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded-md">
                    {JSON.stringify(JSON.parse(rule.conditions), null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded-md">
                    {JSON.stringify(JSON.parse(rule.actions), null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 