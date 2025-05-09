'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Incident} from '@/services/incidents';
import {
  Shield,
  User,
  Bot,
  Pause,
  Play,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Move,
  Minus,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import 'react-resizable/css/styles.css';
import {cn} from '@/lib/utils';

// Type definition for activity types
type ActivityType = 'new_incident' | 'triage' | 'agent_response' | 'correlation';

// Type definition for activity sources
type ActivitySource = 'System' | 'Analyst' | 'Agentforce';

// Type definition for an activity item
interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: string;
  source: ActivitySource;
  message: string;
  incident?: Incident;
  correlatedIncidents?: string[];
}

interface ActivityFeedProps {
  events: ActivityItem[];
}

// Main component for displaying the activity feed
const ActivityFeed: React.FC<ActivityFeedProps> = ({events}) => {
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | ActivitySource>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Use useEffect to listen for changes to the events prop and update the activityFeed.
  useEffect(() => {
    if (events && events.length > 0) {
      // Append new events to the existing activityFeed state
      setActivityFeed(prevFeed => [...events, ...prevFeed]);
    }
  }, [events]);

  // Effect to generate new activities
  useEffect(() => {
    if (!isRendering) return;

    const intervalId = setInterval(() => {
      const newActivity = generateActivityItem();
      setActivityFeed(prevFeed => [newActivity, ...prevFeed]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isRendering]);

  // Generate dummy activity item
  const generateActivityItem = (): ActivityItem => {
    const types: ActivityType[] = ['new_incident', 'triage', 'agent_response', 'correlation'];
    const sources: ActivitySource[] = ['System', 'Analyst', 'Agentforce'];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    let message = '';
    switch (randomType) {
      case 'new_incident':
        message = `New ${randomSource} incident detected`;
        break;
      case 'triage':
        message = `Analyst ${randomSource} triaged incident`;
        break;
      case 'agent_response':
        message = `Agentforce ${randomSource} provided a response`;
        break;
      case 'correlation':
        message = `Correlation Engine ${randomSource} correlated incidents`;
        break;
    }

    return {
      id: Date.now().toString(),
      type: randomType,
      timestamp: new Date().toISOString(),
      source: randomSource,
      message: message,
    };
  };

  // Scroll to top on new activity
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityFeed]);

  // Toggle running and generating activities
  const toggleRunning = () => {
    setIsRendering(prev => !prev);
  };

  // Get icon for activity type
  const getIconForType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_incident':
        return <ShieldAlert className="h-4 w-4 text-red-500"/>;
      case 'triage':
        return <User className="h-4 w-4 text-blue-500"/>;
      case 'agent_response':
        return <Bot className="h-4 w-4 text-purple-500"/>;
      case 'correlation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
    }
  };

  // Filtered activity feed
  const filteredFeed =
    filter === 'all' ? activityFeed : activityFeed.filter(item => item.source === filter);

  // Collapsible handler
  const toggleOpen = () => setIsExpanded(!isExpanded);

  // Minimize handler
  const handleMinimize = () => setIsCollapsed(!isCollapsed);

  const toggleOpenState = () => {
    setIsOpen(!isOpen);
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  }

  const handleValueChange = (value: string) => {
    setFilter(value as ActivitySource | 'all');
  };

  return (
    <div className="bg-[#1e1e1e] text-white rounded-md border shadow-md opacity-90 overflow-hidden flex flex-col">
      <div className="bg-[#333] p-2 cursor-move flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Live Activity Feed
        </h3>
        <div className="flex gap-2 items-center">
          <Button 
            className="hover:bg-accent hover:text-accent-foreground h-10 w-10"
            onClick={toggleOpenState}
          >
            {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}
          </Button>
          {isOpen && (
            <Button 
              className="hover:bg-accent hover:text-accent-foreground h-10 w-10"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4"/>
            </Button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="flex flex-col h-full">
          <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Sources"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="Analyst">Analyst</SelectItem>
              <SelectItem value="Agentforce">Agentforce</SelectItem>
            </SelectContent>
          </Select>
          <ScrollArea ref={scrollRef} className="h-[calc(100%-100px)] p-2">
            {filteredFeed.map(item => (
              <div key={item.id} className="mb-2 border-b pb-2">
                <div className="flex gap-2 items-center">
                  {getIconForType(item.type)}
                  <span className="text-xs text-white">{new Date(item.timestamp).toLocaleTimeString()}</span> -{' '}
                  <span className="text-sm">{item.source}</span>
                </div>
                <p className="text-sm">{item.message}</p>
                {item.correlatedIncidents && item.correlatedIncidents.length > 0 && (
                  <p className="text-xs text-white">Correlated Incidents: {item.correlatedIncidents.join(', ')}</p>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="flex p-2 justify-between">
            <Button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
              onClick={toggleRunning}
            >
              {isRendering ? <Pause className="h-4 w-4 mr-2"/> : <Play className="h-4 w-4 mr-2"/>}
              {isRendering ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
