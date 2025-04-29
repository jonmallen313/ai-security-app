import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeLogs } from '@/services/ai-service';
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Search, AlertTriangle } from 'lucide-react';
import { AIChatDialog } from './AIChatDialog';
import { cn } from "@/lib/utils";

interface LogSource {
  id: string;
  name: string;
  type: 'file' | 'api' | 'stream';
  url?: string;
  format: 'json' | 'text' | 'csv';
}

interface Threat {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  details: Record<string, any>;
}

export function LogIntegration() {
  const { toast } = useToast();
  const [logData, setLogData] = useState('');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [logSources, setLogSources] = useState<LogSource[]>([
    { id: '1', name: 'Auth Logs', type: 'file', format: 'text' },
    { id: '2', name: 'System Logs', type: 'file', format: 'text' },
    { id: '3', name: 'Network Logs', type: 'api', url: 'https://api.example.com/logs', format: 'json' }
  ]);
  const [selectedSource, setSelectedSource] = useState<string>('1');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setLogData(content);
      toast({
        title: "Log file uploaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    reader.readAsText(file);
  };

  const handleAnalyzeLogs = async () => {
    if (!logData.trim()) {
      toast({
        title: "No log data",
        description: "Please upload or enter log data to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeLogs(logData, query);
      setThreats(result.threats);
      
      toast({
        title: "Analysis complete",
        description: `Found ${result.summary.totalThreats} potential threats`,
      });
    } catch (error) {
      console.error('Error analyzing logs:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the logs",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Integration</CardTitle>
        <CardDescription>
          Upload logs, analyze them for threats, and get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Logs</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logSource">Log Source</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select log source" />
                  </SelectTrigger>
                  <SelectContent>
                    {logSources.map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="logFile">Upload Log File</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="logFile"
                    type="file"
                    accept=".log,.txt,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logFile')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    or paste log data below
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="logData">Log Data</Label>
                <Textarea
                  id="logData"
                  value={logData}
                  onChange={(e) => setLogData(e.target.value)}
                  placeholder="Paste your log data here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze">
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">Search Query (Optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., failed login OR suspicious IP"
                  />
                  <Button 
                    onClick={handleAnalyzeLogs}
                    disabled={isAnalyzing || !logData.trim()}
                  >
                    {isAnalyzing ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <AIChatDialog
                  trigger={
                    <Button variant="outline">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Ask AI About Logs
                    </Button>
                  }
                  initialContext={`I have uploaded log data and want to analyze it for security threats. The log data is: ${logData.substring(0, 500)}...`}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="threats">
            {threats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No threats detected yet. Upload and analyze logs to find threats.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {threats.map(threat => (
                  <Card 
                    key={threat.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedThreat?.id === threat.id ? "border-primary" : ""
                    )}
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center">
                          <span className={cn("w-2 h-2 rounded-full mr-2", getSeverityColor(threat.severity))} />
                          {threat.description}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {new Date(threat.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <p><strong>Source:</strong> {threat.source}</p>
                        {Object.entries(threat.details).map(([key, value]) => (
                          <p key={key}><strong>{key}:</strong> {JSON.stringify(value)}</p>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <AIChatDialog
                        trigger={
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Ask AI About This Threat
                          </Button>
                        }
                        initialContext={`I found a ${threat.severity} severity threat: ${threat.description}. Details: ${JSON.stringify(threat.details)}`}
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 