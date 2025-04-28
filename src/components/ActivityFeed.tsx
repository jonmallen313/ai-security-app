'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Incident, getIncidents } from '@/services/incidents';
import { Shield, User, Bot, Pause, Play, AlertTriangle, MessageSquare, ShieldAlert, Move, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import mitreMapData from '@/data/mitre-map.json';
import { ResizableBox } from 'react-resizable';
import { DndProvider, useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-resizable/css/styles.css';

// Type definitions for MITRE ATT&CK map data
interface MitreMap {
  [tactic: string]: {
    [technique: string]: string[];
  };
}

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

// Main component for displaying the activity feed
const ActivityFeed: React.FC = () => {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState<boolean>(true); // Added state to control activity generation
  const [filter, setFilter] = useState<'all' | ActivitySource>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const mitreMap: MitreMap = mitreMapData as MitreMap;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(500)
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Load incidents on component mount
  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  // Match an incident to a MITRE ATT&CK tactic and technique
  const matchIncidentToMitre = useCallback((incident: Incident): { tactic: string; technique: string } | null => {
    for (const tactic in mitreMap) {
      for (const technique in mitreMap[tactic]) {
        const keywords = mitreMap[tactic][technique];
        if (keywords.some(keyword => incident.description.toLowerCase().includes(keyword.toLowerCase()))) {
          return { tactic, technique };
        }
      }
    }
    return null;
  }, [mitreMap]);

  // Generate a new activity item for the feed
  const generateActivityItem = useCallback(() => {
    const now = new Date();
    const types: ActivityType[] = ['new_incident', 'triage', 'agent_response'];
    const sources: ActivitySource[] = ['System', 'Analyst', 'Agentforce'];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    let message = '';
    let incident: Incident | undefined;

    if (randomType === 'new_incident') {
      const newIncident: Incident = {
        time: now.toISOString(),
        sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        threatLevel: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
        description: `${['SSH brute force', 'Malware detected', 'Phishing attempt'][Math.floor(Math.random() * 3)]}`,
      };

      incident = newIncident;
      setIncidents(prev => [newIncident, ...prev]);

      const mitreMatch = matchIncidentToMitre(newIncident);
      if (mitreMatch) {
        message = `New incident detected: ${newIncident.description} - MITRE ATT&CK: ${mitreMatch.tactic} - ${mitreMatch.technique}`;

        const correlatedIncidents = activityFeed.filter(item => {
          return item.incident && item.type === 'new_incident' && item.incident !== newIncident && matchIncidentToMitre(item.incident)?.technique === mitreMatch.technique;
        }).map(item => item.id);

        if (correlatedIncidents.length > 0) {
          message += ` - Correlated with ${correlatedIncidents.length} existing incident${correlatedIncidents.length > 1 ? 's' : ''}.`;
          const correlationItem: ActivityItem = {
            id: Date.now().toString() + '-correlation',
            type: 'correlation',
            timestamp: now.toISOString(),
            source: 'System',
            message: `Incident ${newIncident.description} correlated with existing incidents due to shared MITRE ATT&CK tactic: ${mitreMatch.technique}`,
            incident: newIncident,
            correlatedIncidents: correlatedIncidents,
          };
          setActivityFeed(prev => [correlationItem, ...prev]);
        }
      } else {
        message = `New incident detected: ${newIncident.description}`;
      }
    } else if (randomType === 'triage') {
      const selectedIncident = incidents[Math.floor(Math.random() * incidents.length)];
      if (selectedIncident) {
        message = `Analyst ${['Marked as False Positive', 'Confirmed Threat', 'Needs Review'][Math.floor(Math.random() * 3)]} incident: ${selectedIncident.description}`;
      }
    } else if (randomType === 'agent_response') {
      const selectedIncident = incidents[Math.floor(Math.random() * incidents.length)];
      if (selectedIncident) {
        message = `Agentforce recommended mitigation: ${['Firewall block', 'Disable SSH', 'Quarantine host'][Math.floor(Math.random() * 3)]} for incident: ${selectedIncident.description} in ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0/24`;
      }
    }

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      type: randomType,
      timestamp: now.toISOString(),
      source: randomSource,
      message: message,
      incident: incident,
    };
    setActivityFeed(prev => [newItem, ...prev]);
  }, [matchIncidentToMitre, activityFeed]);

  // Effect to generate new activities
  useEffect(() => {
    if (!isGeneratingActivities) return;

    const intervalId = setInterval(() => {
      generateActivityItem();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [generateActivityItem, isGeneratingActivities]);

  // Scroll to top on new activity
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityFeed]);

  // Toggle running and generating activities
  const toggleRunning = () => {
      setIsRendering((prev) => !prev);

  };

  // Get icon for activity type
  const getIconForType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_incident': return <ShieldAlert className="h-4 w-4 text-red-500"/>;
      case 'triage': return <User className="h-4 w-4 text-blue-500"/>;
      case 'agent_response': return <Bot className="h-4 w-4 text-purple-500"/>;
      case 'correlation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
    }
  };

  // Filtered activity feed
  const filteredFeed = filter === 'all' ? activityFeed : activityFeed.filter(item => item.source === filter);

  // Collapsible handler
  const toggleOpen = () => setIsExpanded(!isExpanded);

  // Minimize handler
  const handleMinimize = () => setIsCollapsed(!isCollapsed);


  // React-dnd functions
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'activityFeed',
    item: { position },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'activityFeed',
    drop: (item: any, monitor: DropTargetMonitor) => {
        setPosition(monitor.getClientOffset() || {x: 0, y: 0})
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));


  return (
      
      <div ref={drop} style={{position: "fixed", top: position.y, left: position.x, zIndex: 1000}} >
      <ResizableBox 
        className={`z-1000`}
        style={{ position: 'relative', zIndex: 1000, top: 0, left: 0}}
        width={width} 
        height={height}
        handle={<div ref={drag} className="cursor-move"><Move className='h-4 w-4'/></div>}
        minConstraints={[200, 150]}
        maxConstraints={[800, 600]}
        onResizeStop={(e, data) => {
            setWidth(data.size.width);
            setHeight(data.size.height)
        }}
        resizeHandles={['se']} // Only allow resizing from the bottom-right corner
      >
          <div className="bg-secondary rounded-md border shadow-md">
          <div className="handle bg-accent p-2 cursor-move flex items-center justify-between"
>
                  <h3 className="text-lg font-semibold flex items-center gap-2">Live Activity Feed </h3>
            <div className='flex gap-2 items-center'>
                
              {isCollapsed ? (
                <Button variant="outline" size="icon" onClick={handleMinimize}>
                    <ChevronUp className="h-4 w-4"/>
                </Button>
              ) : (
                <>
                    <Button variant='ghost' size='icon' onClick={toggleRunning}>
                        {isRendering ? <Pause className='h-4 w-4'/> : <Play className='h-4 w-4'/>}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleMinimize}>
                        <Minus className="h-4 w-4"/>
                    </Button>
                </>
              )}
            </div>
          </div>
          {isExpanded && !isCollapsed && (
            <>
              <Select onValueChange={(value) => setFilter(value as ActivitySource | 'all')}>
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
                    <div className='flex gap-2 items-center'>
                      {getIconForType(item.type)}
                      <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span> - <span className='text-sm'>{item.source}</span>
                    </div>
                    <p className="text-sm">{item.message}</p>
                    {item.correlatedIncidents && item.correlatedIncidents.length > 0 && (
                      <p className="text-xs text-muted-foreground">Correlated Incidents: {item.correlatedIncidents.join(', ')}</p>
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



export default ActivityFeed;
    