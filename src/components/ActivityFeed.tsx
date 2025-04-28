'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Incident, getIncidents} from '@/services/incidents';
import {
  ShieldAlert,
  User,
  Bot,
  Pause,
  Play,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import mitreMapData from '@/data/mitre-map.json'
import Draggable from 'react-draggable';
import {Resizable} from 'react-resizable';
import 'react-resizable/css/styles.css';


type MitreMap = {
  [tactic: string]: {
    [technique: string]: string[];
  };
};

interface ActivityItem {
  id: string;
  type: 'new_incident' | 'triage' | 'agent_response' | 'correlation';
  timestamp: string;
  source: 'System' | 'Analyst' | 'Agentforce';
  message: string;
  incident?: Incident;
  correlatedIncidents?: string[];
}

const ActivityFeed: React.FC = () => {
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [filter, setFilter] = useState<'all' | 'System' | 'Analyst' | 'Agentforce'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const mitreMap: MitreMap = mitreMapData as MitreMap;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isOpen, setIsOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);

  
  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

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

  const generateActivityItem = useCallback(() => {
    const now = new Date();
    const types = ['new_incident', 'triage', 'agent_response'];
    const sources = ['System', 'Analyst', 'Agentforce'];

    const randomType = types[Math.floor(Math.random() * types.length)] as ActivityItem['type'];
    const randomSource = sources[Math.floor(Math.random() * sources.length)] as ActivityItem['source'];

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

        // Attempt to correlate with existing incidents
        const correlatedIncidents = activityFeed.filter(item => {
          return item.incident && item.type === 'new_incident' && item.incident !== newIncident && matchIncidentToMitre(item.incident)?.technique === mitreMatch.technique;
        }).map(item => item.id);

        if (correlatedIncidents.length > 0) {
          message += ` - Correlated with ${correlatedIncidents.length} existing incidents.`;
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
      message = `Analyst ${
        ['Marked as False Positive', 'Confirmed Threat', 'Needs Review'][Math.floor(Math.random() * 3)]
      } ${Math.floor(Math.random() * 5)} incidents`;
    } else if (randomType === 'agent_response') {
      message = `Agentforce recommended mitigation: ${
        ['Firewall block', 'Disable SSH', 'Quarantine host'][Math.floor(Math.random() * 3)]
      } ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0/24`;
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
      case 'correlation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
    }
  };

  const filteredFeed =
    filter === 'all' ? activityFeed : activityFeed.filter(item => item.source === filter);

    const handleDrag = (e: any, ui: any) => {
      setPosition({ x: ui.x, y: ui.y });
    };
  
    const handleResize = (event: any, { element, size }: any) => {
      setSize(size);
    };
  
    const toggleOpen = () => {
      setIsOpen(!isOpen);
    };
  
    const handleMinimize = () => {
      setMinimized(!minimized);
    };

  return (
    
      
        <Draggable
          handle=".handle"
          position={position}
          onDrag={handleDrag}
        >
          <Resizable
          size={size}
          style={{ position: 'relative', zIndex: 1000, top: 0, left: 0 }}
          
          width={size.width}
          height={size.height}
          onResize={handleResize}
          minConstraints={[200, 150]}
          maxConstraints={[800, 600]}
        >
          <div
          className="bg-secondary rounded-md border shadow-md"
        >
            <div className="handle bg-accent p-2 cursor-move flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Activity Feed</h3>
              <div>
                <Button variant="outline" size="icon" onClick={handleMinimize}>
                  {minimized ? <Play className="h-4 w-4"/> : <Pause className="h-4 w-4"/>}
                </Button>
              </div>
            </div>
            {isOpen && (
                
                  
                    All Sources
                    System
                    Analyst
                    Agentforce
                  
                  
                    {isRunning ?  : }
                  
                
                
                  
                    {filteredFeed.map(item => (
                      
                        
                          {getIconForType(item.type)}
                          
                        
                        
                          {new Date(item.timestamp).toLocaleTimeString()} - {item.source}
                        
                        {item.correlatedIncidents && item.correlatedIncidents.length > 0 && (
                          
                            Correlated Incidents: {item.correlatedIncidents.join(', ')}
                          
                        )}
                      
                    ))}
                    {filteredFeed.length === 0 && (
                      
                        No activities to display.
                      
                    )}
                  
                
              
            )}
        
        </Resizable>
        </Draggable>
      
    
  );
};

export default ActivityFeed;
