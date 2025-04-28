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
import {ResizableBox} from 'react-resizable';
import 'react-resizable/css/styles.css';

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

interface ActivityFeedOverlayProps {
  events: ActivityItem[];
}

// Main component for displaying the activity feed
const ActivityFeedOverlay: React.FC<ActivityFeedOverlayProps> = ({events}) => {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | ActivitySource>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({x: 50, y: 50});
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(500);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
      //This is where generateActivityItem should be but I removed mitreMap so I just left it.
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isRendering]);

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

  const handleDrag = (e: any, data: any) => {
    setPosition({x: data.x, y: data.y});
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 9999,
        width: width,
        height: height,
      }}
    >
      <ResizableBox
        style={{
          position: 'relative',
          zIndex: 1000,
          top: 0,
          left: 0,
        }}
        width={width}
        height={height}
        handle={<div className="cursor-move"><Move className="h-4 w-4"/></div>}
        minConstraints={[300, 200]}
        maxConstraints={[800, 600]}
        onResizeStop={(e, data) => {
          setWidth(data.size.width);
          setHeight(data.size.height);
        }}
        resizeHandles={['se']} // Only allow resizing from the bottom-right corner
      >
        <div className="bg-[#1e1e1e] text-white rounded-md border shadow-md opacity-90">
          <div className="bg-[#333] p-2 cursor-move flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Live Activity Feed
            </h3>
            <div className="flex gap-2 items-center">
              {isCollapsed ? (
                <Button variant="outline" size="icon" onClick={handleMinimize}>
                  <ChevronUp className="h-4 w-4"/>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={toggleRunning}>
                    {isRendering ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleMinimize}>
                    <Minus className="h-4 w-4"/>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={() => {
                /* TODO: Implement close functionality */
              }}>
                <X className="h-4 w-4"/>
              </Button>
            </div>
          </div>
          {isExpanded && !isCollapsed && (
            <>
              <Select onValueChange={value => setFilter(value as ActivitySource | 'all')}>
                <SelectTrigger className="w-[180px]">
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
            </>
          )}
        </div>
      </ResizableBox>
    </div>
  );
};

export default ActivityFeedOverlay;
