'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Incident} from '@/services/incidents';
import {
  ShieldAlert,
  User,
  Bot,
  CheckCircle,
  Pause,
  Play,
  AlertTriangle,
  MessageSquare,
  Check,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';

interface ActivityItem {
  id: string;
  type: 'new_incident' | 'triage' | 'agent_response';
  timestamp: string;
  source: 'System' | 'Analyst' | 'Agentforce';
  message: string;
  incident?: Incident;
}

const ActivityFeed: React.FC = () => {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [filter, setFilter] = useState<'all' | 'System' | 'Analyst' | 'Agentforce'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateActivityItem = useCallback(() => {
    const now = new Date();
    const types = ['new_incident', 'triage', 'agent_response'];
    const sources = ['System', 'Analyst', 'Agentforce'];

    const randomType = types[Math.floor(Math.random() * types.length)] as ActivityItem['type'];
    const randomSource = sources[Math.floor(Math.random() * sources.length)] as ActivityItem['source'];

    let message = '';
    switch (randomType) {
      case 'new_incident':
        message = `New incident detected: ${
          ['SSH brute force', 'Malware detected', 'Phishing attempt'][Math.floor(Math.random() * 3)]
        } from ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        break;
      case 'triage':
        message = `Analyst ${
          ['Marked as False Positive', 'Confirmed Threat', 'Needs Review'][Math.floor(Math.random() * 3)]
        } ${Math.floor(Math.random() * 5)} incidents`;
        break;
      case 'agent_response':
        message = `Agentforce recommended mitigation: ${
          ['Firewall block', 'Disable SSH', 'Quarantine host'][Math.floor(Math.random() * 3)]
        } ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0/24`;
        break;
    }

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      type: randomType,
      timestamp: now.toISOString(),
      source: randomSource,
      message: message,
    };

    setActivityFeed(prev => [newItem, ...prev]);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      intervalId = setInterval(() => {
        generateActivityItem();
      }, 5000 + Math.random() * 5000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, generateActivityItem]);

  useEffect(() => {
    // Scroll to the top when new items are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityFeed]);

  const toggleRunning = () => {
    setIsRunning(prev => !prev);
  };

  const getIconForType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_incident':
        return <ShieldAlert className="h-4 w-4 text-red-500"/>;
      case 'triage':
        return <User className="h-4 w-4 text-blue-500"/>;
      case 'agent_response':
        return <Bot className="h-4 w-4 text-purple-500"/>;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
    }
  };

  const filteredFeed =
    filter === 'all' ? activityFeed : activityFeed.filter(item => item.source === filter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-lg font-semibold">Live Activity Feed</h3>
        <div className="flex gap-2 items-center">
          <Select value={filter} onValueChange={value => setFilter(value as any)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Filter by Source"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="Analyst">Analyst</SelectItem>
              <SelectItem value="Agentforce">Agentforce</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleRunning}>
            {isRunning ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 rounded-md border p-2">
        <div ref={scrollRef} className="overflow-y-auto flex flex-col-reverse">
          {filteredFeed.map(item => (
            <div key={item.id} className="py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-2">
                {getIconForType(item.type)}
                <p className="text-sm font-medium">{item.message}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleTimeString()} - {item.source}
              </div>
            </div>
          ))}
          {filteredFeed.length === 0 && (
            <div className="py-4 text-center text-muted-foreground">
              No activities to display.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityFeed;
