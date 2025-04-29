'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  createAgent, 
  getAgents, 
  createTask, 
  createPlaybook,
  assignTaskToAgent,
  assignPlaybookToAgent,
  getPlaybooks,
  initializeService
} from '@/services/agent-service';
import { Agent } from '@/types/agent';
import { Task } from '@/types/task';
import { Playbook } from '@/types/playbook';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isPlaybookDialogOpen, setIsPlaybookDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the service with predefined data
    initializeService();
    
    // Load initial data
    setAgents(getAgents());
    setPlaybooks(getPlaybooks());
    
    // Set up polling to refresh data every 2 seconds
    const interval = setInterval(() => {
      setAgents(getAgents());
      setPlaybooks(getPlaybooks());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAssignTask = async (agentId: string) => {
    try {
      const task = createTask('New Task', 'Task description');
      await assignTaskToAgent(task.id, agentId);
      setAgents(getAgents());
      toast({
        title: 'Task Assigned',
        description: 'Task has been assigned to the agent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign task',
        variant: 'destructive',
      });
    }
  };

  const handleAssignPlaybook = async (playbookId: string, agentId: string) => {
    try {
      await assignPlaybookToAgent(playbookId, agentId);
      setAgents(getAgents());
      setIsPlaybookDialogOpen(false);
      toast({
        title: 'Playbook Assigned',
        description: 'Playbook has been assigned to the agent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign playbook',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'idle': return 'secondary';
      case 'running': return 'default';
      case 'error': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getTaskStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in-progress': return 'default';
      case 'done': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPlaybookStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'running': return 'default';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Agents Dashboard</h1>
      
      <Tabs defaultValue="agents" className="mb-6">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="playbooks">Available Playbooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.name}</span>
                    <Badge variant={getStatusVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Assigned Tasks</h3>
                      {agent.assignedTasks.length === 0 ? (
                        <p className="text-sm text-gray-500">No tasks assigned</p>
                      ) : (
                        agent.assignedTasks.map((task) => (
                          <div key={task.id} className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{task.name}</span>
                              <Badge variant={getTaskStatusVariant(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            <Progress 
                              value={
                                task.status === 'done' ? 100 :
                                task.status === 'in-progress' ? 50 :
                                task.status === 'failed' ? 100 : 0
                              }
                              className="h-1"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Assigned Playbooks</h3>
                      {agent.assignedPlaybooks.length === 0 ? (
                        <p className="text-sm text-gray-500">No playbooks assigned</p>
                      ) : (
                        agent.assignedPlaybooks.map((playbook) => (
                          <div key={playbook.id} className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{playbook.name}</span>
                              <Badge variant={getPlaybookStatusVariant(playbook.status)}>
                                {playbook.status}
                              </Badge>
                            </div>
                            <Progress 
                              value={
                                playbook.status === 'completed' ? 100 :
                                playbook.status === 'running' ? 
                                  (playbook.steps.filter(s => s.status === 'done').length / playbook.steps.length) * 100 :
                                playbook.status === 'failed' ? 100 : 0
                              }
                              className="h-1"
                            />
                            {playbook.status === 'running' && (
                              <p className="text-xs text-gray-500 mt-1">
                                {playbook.steps.filter(s => s.status === 'done').length} of {playbook.steps.length} steps completed
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleAssignTask(agent.id)}
                        disabled={agent.status === 'running'}
                      >
                        Assign Task
                      </Button>
                      <Dialog open={isPlaybookDialogOpen} onOpenChange={setIsPlaybookDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            disabled={agent.status === 'running'}
                            onClick={() => setSelectedAgent(agent)}
                          >
                            Assign Playbook
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Assign Playbook to {selectedAgent?.name}</DialogTitle>
                            <DialogDescription>
                              Select a playbook to assign to this agent
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {playbooks.map((playbook) => (
                              <Card key={playbook.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                  <CardTitle className="text-lg">{playbook.name}</CardTitle>
                                  <CardDescription>
                                    {playbook.steps.length} steps
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {playbook.steps.map((step, index) => (
                                      <div key={step.id} className="flex items-center">
                                        <span className="text-sm mr-2">{index + 1}.</span>
                                        <span className="text-sm">{step.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <Button 
                                    className="w-full mt-4"
                                    onClick={() => handleAssignPlaybook(playbook.id, selectedAgent?.id || '')}
                                    disabled={!selectedAgent || selectedAgent.status === 'running'}
                                  >
                                    Assign
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="playbooks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbooks.map((playbook) => (
              <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{playbook.name}</CardTitle>
                  <CardDescription>
                    {playbook.steps.length} steps • {playbook.assignedAgentId ? 'Assigned' : 'Available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {playbook.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <span className="text-sm mr-2">{index + 1}.</span>
                        <span className="text-sm">{step.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-500">
                      {playbook.steps.map(step => step.description).join(' ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 