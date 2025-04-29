import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePlaybook } from '@/services/ai-service';
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Bot, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { AIChatDialog } from './AIChatDialog';
import { cn } from "@/lib/utils";

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Playbook {
  name: string;
  description: string;
  category: string;
  steps: PlaybookStep[];
  estimatedTime: string;
  difficulty: string;
}

export function PlaybookMaker() {
  const { toast } = useToast();
  const [playbook, setPlaybook] = useState<Playbook>({
    name: '',
    description: '',
    category: 'Incident Response',
    steps: [],
    estimatedTime: '1 hour',
    difficulty: 'Intermediate'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [newStep, setNewStep] = useState({ title: '', description: '' });

  const handleGeneratePlaybook = async () => {
    if (!playbook.name || !playbook.description) {
      toast({
        title: "Missing information",
        description: "Please provide a name and description for the playbook",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedPlaybook = await generatePlaybook(
        playbook.name,
        playbook.category,
        { description: playbook.description }
      );
      
      setPlaybook(prev => ({
        ...prev,
        steps: generatedPlaybook.steps,
        estimatedTime: generatedPlaybook.estimatedTime,
        difficulty: generatedPlaybook.difficulty
      }));
      
      toast({
        title: "Playbook generated",
        description: "AI has generated a playbook based on your requirements",
      });
      
      setActiveTab('steps');
    } catch (error) {
      console.error('Error generating playbook:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating the playbook",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStep = () => {
    if (!newStep.title.trim()) return;
    
    const step: PlaybookStep = {
      id: Date.now().toString(),
      title: newStep.title,
      description: newStep.description,
      order: playbook.steps.length + 1
    };
    
    setPlaybook(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));
    
    setNewStep({ title: '', description: '' });
  };

  const handleRemoveStep = (id: string) => {
    setPlaybook(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }));
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const steps = [...playbook.steps];
    const index = steps.findIndex(step => step.id === id);
    
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = steps[index];
    steps[index] = steps[newIndex];
    steps[newIndex] = temp;
    
    // Update order numbers
    steps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setPlaybook(prev => ({
      ...prev,
      steps
    }));
  };

  const handleSavePlaybook = () => {
    // In a real implementation, this would save to the backend
    toast({
      title: "Playbook saved",
      description: "Your playbook has been saved successfully",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Playbook Maker</CardTitle>
        <CardDescription>
          Create and customize security response playbooks with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Playbook Name</Label>
                <Input
                  id="name"
                  value={playbook.name}
                  onChange={(e) => setPlaybook(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Phishing Incident Response"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={playbook.description}
                  onChange={(e) => setPlaybook(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this playbook..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={playbook.category} 
                  onValueChange={(value) => setPlaybook(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Incident Response">Incident Response</SelectItem>
                    <SelectItem value="Threat Hunting">Threat Hunting</SelectItem>
                    <SelectItem value="Vulnerability Management">Vulnerability Management</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <AIChatDialog
                  trigger={
                    <Button variant="outline">
                      <Bot className="mr-2 h-4 w-4" />
                      Ask AI for Help
                    </Button>
                  }
                  initialContext={`I'm creating a playbook for ${playbook.category} called "${playbook.name}". Description: ${playbook.description}. Can you help me with the next steps?`}
                />
                <Button 
                  onClick={handleGeneratePlaybook}
                  disabled={isGenerating || !playbook.name || !playbook.description}
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="steps">
            <div className="space-y-4">
              {playbook.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No steps added yet. Add steps manually or generate with AI.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {playbook.steps.map(step => (
                    <Card key={step.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {step.order}. {step.title}
                          </CardTitle>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleMoveStep(step.id, 'up')}
                              disabled={step.order === 1}
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleMoveStep(step.id, 'down')}
                              disabled={step.order === playbook.steps.length}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Add New Step</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="stepTitle">Step Title</Label>
                    <Input
                      id="stepTitle"
                      value={newStep.title}
                      onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Verify Alert"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stepDescription">Description</Label>
                    <Textarea
                      id="stepDescription"
                      value={newStep.description}
                      onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this step involves..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleAddStep} disabled={!newStep.title.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{playbook.name || 'Untitled Playbook'}</CardTitle>
                  <CardDescription>{playbook.description || 'No description provided'}</CardDescription>
                  <div className="flex space-x-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {playbook.category}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {playbook.estimatedTime}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {playbook.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-medium mb-2">Steps</h3>
                  {playbook.steps.length === 0 ? (
                    <p className="text-muted-foreground">No steps defined</p>
                  ) : (
                    <ol className="space-y-4">
                      {playbook.steps.map(step => (
                        <li key={step.id} className="border-l-2 border-primary pl-4 pb-4">
                          <h4 className="font-medium">{step.order}. {step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePlaybook} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Playbook
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 