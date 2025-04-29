'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { nanoid } from 'nanoid';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BarChart2, Bell, Calendar, ChevronDown, ChevronUp, Clock, Filter, LineChart as LineChartIcon, PieChart as PieChartIcon, Search, Settings, Shield, ShieldAlert, Sliders, X, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Incident } from '@/services/incidents';
import { getIncidents } from '@/services/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Types for our dashboard
interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings?: {
    refreshInterval?: number;
    dataSource?: string;
    filters?: Record<string, any>;
    [key: string]: any;
  };
}

interface EventItem {
  id: string;
  type: 'security' | 'system' | 'user' | 'alert';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  location?: string;
}

interface DashboardProps {
  onAskAgentforce?: (incident: Incident) => void;
}

// Widget types
const WIDGET_TYPES = {
  EVENT_FEED: 'event_feed',
  METRICS_OVERVIEW: 'metrics_overview',
  ALERT_CENTER: 'alert_center',
  RECENT_ACTIONS: 'recent_actions',
  INCIDENT_TRENDS: 'incident_trends',
  THREAT_DISTRIBUTION: 'threat_distribution',
  SOURCE_IP_MAP: 'source_ip_map',
};

// Default widgets configuration
const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: nanoid(),
    type: WIDGET_TYPES.EVENT_FEED,
    title: 'Event Feed',
    position: { x: 0, y: 0 },
    size: { width: 1, height: 2 },
    settings: {
      refreshInterval: 5000,
      filters: { severity: 'all', type: 'all' }
    }
  },
  {
    id: nanoid(),
    type: WIDGET_TYPES.METRICS_OVERVIEW,
    title: 'Metrics Overview',
    position: { x: 1, y: 0 },
    size: { width: 1, height: 1 },
    settings: {
      refreshInterval: 5000
    }
  },
  {
    id: nanoid(),
    type: WIDGET_TYPES.ALERT_CENTER,
    title: 'Alert Center',
    position: { x: 2, y: 0 },
    size: { width: 1, height: 1 },
    settings: {
      refreshInterval: 5000
    }
  },
  {
    id: nanoid(),
    type: WIDGET_TYPES.RECENT_ACTIONS,
    title: 'Recent Actions',
    position: { x: 0, y: 2 },
    size: { width: 1, height: 1 },
    settings: {
      refreshInterval: 5000
    }
  },
  {
    id: nanoid(),
    type: WIDGET_TYPES.INCIDENT_TRENDS,
    title: 'Incident Trends',
    position: { x: 1, y: 1 },
    size: { width: 1, height: 1 },
    settings: {
      refreshInterval: 5000
    }
  },
  {
    id: nanoid(),
    type: WIDGET_TYPES.THREAT_DISTRIBUTION,
    title: 'Threat Distribution',
    position: { x: 2, y: 1 },
    size: { width: 1, height: 1 },
    settings: {
      refreshInterval: 5000
    }
  }
];

// Colors for different severity levels
const SEVERITY_COLORS = {
  critical: '#F44336',
  high: '#FF9800',
  medium: '#FFEB3B',
  low: '#4CAF50'
};

// Colors for different event types
const EVENT_TYPE_COLORS = {
  security: '#2196F3',
  system: '#9C27B0',
  user: '#00BCD4',
  alert: '#FF5722'
};

// Colors for different status
const STATUS_COLORS = {
  new: '#F44336',
  investigating: '#FF9800',
  resolved: '#4CAF50',
  dismissed: '#9E9E9E'
};

const EnhancedDashboard: React.FC<DashboardProps> = ({ onAskAgentforce }) => {
  const { resolvedTheme } = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWidgets = localStorage.getItem('enhancedDashboardWidgets');
      return storedWidgets ? JSON.parse(storedWidgets) : DEFAULT_WIDGETS;
    }
    return DEFAULT_WIDGETS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load incidents from the API
  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    
    loadIncidents();
  }, []);

  // Save widgets to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enhancedDashboardWidgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Generate dummy events for demonstration
  useEffect(() => {
    if (!isRendering) return;

    const intervalId = setInterval(() => {
      const newEvent = generateEventItem();
      setEvents(prevEvents => [newEvent, ...prevEvents]);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isRendering]);

  // Generate a dummy event item
  const generateEventItem = (): EventItem => {
    const types: EventItem['type'][] = ['security', 'system', 'user', 'alert'];
    const severities: EventItem['severity'][] = ['critical', 'high', 'medium', 'low'];
    const statuses: EventItem['status'][] = ['new', 'investigating', 'resolved', 'dismissed'];
    const sources = ['Firewall', 'IDS', 'User Activity', 'System Logs', 'Network Monitor'];
    const locations = ['US-East', 'US-West', 'EU-Central', 'Asia-Pacific', 'Global'];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    let description = '';
    switch (randomType) {
      case 'security':
        description = `Security ${randomSeverity} severity event detected from ${randomSource}`;
        break;
      case 'system':
        description = `System ${randomSeverity} severity event: ${randomSource} reported an issue`;
        break;
      case 'user':
        description = `User ${randomSeverity} severity activity: Unusual login pattern detected`;
        break;
      case 'alert':
        description = `Alert ${randomSeverity} severity: ${randomSource} triggered an alert`;
        break;
    }

    return {
      id: nanoid(),
      type: randomType,
      severity: randomSeverity,
      timestamp: new Date().toISOString(),
      source: randomSource,
      description,
      status: randomStatus,
      location: randomLocation
    };
  };

  // Filter events based on search query and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  // Toggle real-time updates
  const toggleRealTime = () => {
    setIsRendering(!isRendering);
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Toggle widget expansion
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Toggle widget minimization
  const handleMinimize = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle widget open state
  const toggleOpenState = () => {
    setIsOpen(!isOpen);
  };

  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Handle widget drag start
  const handleDragStart = (widgetId: string) => {
    setIsDragging(true);
    setSelectedWidget(widgetId);
  };

  // Handle widget drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setSelectedWidget(null);
  };

  // Handle widget drop
  const handleDrop = (widgetId: string, position: { x: number; y: number }) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, position } 
          : widget
      )
    );
  };

  // Handle widget resize
  const handleResize = (widgetId: string, size: { width: number; height: number }) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, size } 
          : widget
      )
    );
  };

  // Handle widget settings update
  const handleWidgetSettingsUpdate = (widgetId: string, settings: any) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, settings: { ...widget.settings, ...settings } } 
          : widget
      )
    );
  };

  // Render a widget based on its type
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case WIDGET_TYPES.EVENT_FEED:
        return <EventFeedWidget 
          events={filteredEvents} 
          settings={widget.settings} 
          onEventClick={(event) => console.log('Event clicked:', event)}
        />;
      case WIDGET_TYPES.METRICS_OVERVIEW:
        return <MetricsOverviewWidget 
          events={events} 
          settings={widget.settings} 
        />;
      case WIDGET_TYPES.ALERT_CENTER:
        return <AlertCenterWidget 
          events={events.filter(e => e.type === 'alert')} 
          settings={widget.settings} 
        />;
      case WIDGET_TYPES.RECENT_ACTIONS:
        return <RecentActionsWidget 
          events={events} 
          settings={widget.settings} 
          onActionClick={(action) => console.log('Action clicked:', action)}
        />;
      case WIDGET_TYPES.INCIDENT_TRENDS:
        return <IncidentTrendsWidget 
          incidents={incidents} 
          settings={widget.settings} 
        />;
      case WIDGET_TYPES.THREAT_DISTRIBUTION:
        return <ThreatDistributionWidget 
          incidents={incidents} 
          settings={widget.settings} 
        />;
      case WIDGET_TYPES.SOURCE_IP_MAP:
        return <SourceIpMapWidget 
          incidents={incidents} 
          settings={widget.settings} 
        />;
      default:
        return <div>Unknown widget type: {widget.type}</div>;
    }
  };

  // Render the dashboard
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn(
        'w-full h-full transition-all duration-300',
        isCollapsed ? 'h-16' : 'h-full'
      )}>
        <div className={cn(
          'bg-background border rounded-md shadow-md overflow-hidden flex flex-col h-full',
          isCollapsed ? 'h-16' : 'h-full'
        )}>
          {/* Dashboard Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Security Dashboard</h2>
              <Badge className={cn(
                'text-xs',
                isRealTimeEnabled ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}>
                {isRealTimeEnabled ? "Live" : "Paused"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                className={cn(
                  "flex items-center space-x-1",
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={toggleRealTime}
              >
                {isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isRealTimeEnabled ? "Pause" : "Resume"}</span>
              </Button>
              <Button 
                className={cn(
                  "flex items-center space-x-1",
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={toggleSettings}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button 
                className={cn(
                  "flex items-center space-x-1",
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                <span>{isMinimized ? "Maximize" : "Minimize"}</span>
              </Button>
            </div>
          </div>

          {/* Dashboard Content */}
          {!isCollapsed && (
            <div className="flex-1 p-4 overflow-hidden flex flex-col h-full">
              {/* Filters and Search */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className={cn(
                    "flex items-center space-x-1",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </div>

              {/* Widgets Grid */}
              <div className="grid grid-cols-3 gap-4 flex-1 overflow-auto">
                {widgets.map(widget => (
                  <div 
                    key={widget.id}
                    className={cn(
                      'border rounded-md shadow-sm overflow-hidden h-full',
                      isDragging && selectedWidget === widget.id ? 'opacity-50' : ''
                    )}
                    style={{
                      gridColumn: `span ${widget.size.width}`,
                      gridRow: `span ${widget.size.height}`,
                    }}
                  >
                    <div className="flex items-center justify-between p-2 border-b bg-muted/50">
                      <h3 className="font-medium">{widget.title}</h3>
                      <div className="flex items-center space-x-1">
                        <Button 
                          className={cn(
                            "h-6 w-6 p-0",
                            "bg-transparent hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          className={cn(
                            "h-6 w-6 p-0",
                            "bg-transparent hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-[calc(100%-2.5rem)]">
                      {renderWidget(widget)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

// Widget Components
const EventFeedWidget: React.FC<{ 
  events: EventItem[]; 
  settings?: any;
  onEventClick?: (event: EventItem) => void;
}> = ({ events, settings, onEventClick }) => {
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No events found</div>
          ) : (
            events.map(event => (
              <div 
                key={event.id}
                className={cn(
                  'p-3 rounded-md border cursor-pointer transition-colors',
                  'hover:bg-muted/50'
                )}
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={cn(
                        'text-xs',
                        event.severity === 'critical' ? "bg-destructive text-destructive-foreground" :
                        event.severity === 'high' ? "bg-red-500 text-white" :
                        event.severity === 'medium' ? "bg-yellow-500 text-white" :
                        "bg-green-500 text-white"
                      )}
                    >
                      {event.severity}
                    </Badge>
                    <Badge 
                      className={cn(
                        'text-xs',
                        event.type === 'security' ? "bg-blue-500 text-white" :
                        event.type === 'system' ? "bg-purple-500 text-white" :
                        event.type === 'user' ? "bg-green-500 text-white" :
                        "bg-orange-500 text-white"
                      )}
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm font-medium">{event.description}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-muted-foreground">
                    Source: {event.source}
                  </div>
                  <Badge 
                    className={cn(
                      'text-xs',
                      event.status === 'new' ? "bg-blue-500 text-white" :
                      event.status === 'investigating' ? "bg-yellow-500 text-white" :
                      event.status === 'resolved' ? "bg-green-500 text-white" :
                      "bg-gray-500 text-white"
                    )}
                  >
                    {event.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const MetricsOverviewWidget: React.FC<{ 
  events: EventItem[]; 
  settings?: any;
}> = ({ events, settings }) => {
  // Calculate metrics
  const totalEvents = events.length;
  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const highEvents = events.filter(e => e.severity === 'high').length;
  const mediumEvents = events.filter(e => e.severity === 'medium').length;
  const lowEvents = events.filter(e => e.severity === 'low').length;
  
  const newEvents = events.filter(e => e.status === 'new').length;
  const investigatingEvents = events.filter(e => e.status === 'investigating').length;
  const resolvedEvents = events.filter(e => e.status === 'resolved').length;
  const dismissedEvents = events.filter(e => e.status === 'dismissed').length;

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2 p-2 flex-1">
        <Card className="col-span-2">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">Event Severity</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Critical</div>
                <div className="text-sm font-bold text-red-500">{criticalEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">High</div>
                <div className="text-sm font-bold text-orange-500">{highEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Medium</div>
                <div className="text-sm font-bold text-yellow-500">{mediumEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Low</div>
                <div className="text-sm font-bold text-green-500">{lowEvents}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-sm">Event Status</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">New</div>
                <div className="text-sm font-bold text-red-500">{newEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Investigating</div>
                <div className="text-sm font-bold text-orange-500">{investigatingEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Resolved</div>
                <div className="text-sm font-bold text-green-500">{resolvedEvents}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Dismissed</div>
                <div className="text-sm font-bold text-gray-500">{dismissedEvents}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex items-center justify-center">
            <div className="text-3xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AlertCenterWidget: React.FC<{ 
  events: EventItem[]; 
  settings?: any;
}> = ({ events, settings }) => {
  // Filter alerts by severity
  const criticalAlerts = events.filter(e => e.severity === 'critical');
  const highAlerts = events.filter(e => e.severity === 'high');
  const mediumAlerts = events.filter(e => e.severity === 'medium');
  const lowAlerts = events.filter(e => e.severity === 'low');

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2 p-2 mb-2">
        <Alert variant="destructive" className="p-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs">Critical</AlertTitle>
          <AlertDescription className="text-xs">{criticalAlerts.length} alerts</AlertDescription>
        </Alert>
        <Alert variant="default" className="p-2 bg-orange-500/20 border-orange-500">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-xs text-orange-500">High</AlertTitle>
          <AlertDescription className="text-xs text-orange-500">{highAlerts.length} alerts</AlertDescription>
        </Alert>
        <Alert variant="default" className="p-2 bg-yellow-500/20 border-yellow-500">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-xs text-yellow-500">Medium</AlertTitle>
          <AlertDescription className="text-xs text-yellow-500">{mediumAlerts.length} alerts</AlertDescription>
        </Alert>
        <Alert variant="default" className="p-2 bg-green-500/20 border-green-500">
          <AlertTriangle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-xs text-green-500">Low</AlertTitle>
          <AlertDescription className="text-xs text-green-500">{lowAlerts.length} alerts</AlertDescription>
        </Alert>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No alerts found</div>
          ) : (
            events.map(event => (
              <div 
                key={event.id}
                className={cn(
                  'p-2 rounded-md border cursor-pointer transition-colors',
                  'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{event.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Source: {event.source}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const RecentActionsWidget: React.FC<{ 
  events: EventItem[]; 
  settings?: any;
  onActionClick?: (action: EventItem) => void;
}> = ({ events, settings, onActionClick }) => {
  // Get recent actions (last 5)
  const recentActions = events.slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {recentActions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No recent actions</div>
          ) : (
            recentActions.map(event => (
              <div 
                key={event.id}
                className={cn(
                  'p-2 rounded-md border cursor-pointer transition-colors',
                  'hover:bg-muted/50'
                )}
                onClick={() => onActionClick?.(event)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{event.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {event.source}
                  </div>
                  <div className="flex space-x-1">
                    <Button className="h-6 w-6 p-0 bg-transparent hover:bg-accent hover:text-accent-foreground">
                      <Shield className="h-3 w-3" />
                    </Button>
                    <Button className="h-6 w-6 p-0 bg-transparent hover:bg-accent hover:text-accent-foreground">
                      <ShieldAlert className="h-3 w-3" />
                    </Button>
                    <Button className="h-6 w-6 p-0 bg-transparent hover:bg-accent hover:text-accent-foreground">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const IncidentTrendsWidget: React.FC<{ 
  incidents: Incident[]; 
  settings?: any;
}> = ({ incidents, settings }) => {
  // Group incidents by date
  const incidentsByDate = incidents.reduce<Record<string, number>>((acc, incident) => {
    const date = incident.time.split(' ')[0]; // Extract date part
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  const chartData = Object.entries(incidentsByDate).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="h-full flex flex-col p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#2196F3" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ThreatDistributionWidget: React.FC<{ 
  incidents: Incident[]; 
  settings?: any;
}> = ({ incidents, settings }) => {
  // Group incidents by threat level
  const incidentsByThreatLevel = incidents.reduce<Record<string, number>>((acc, incident) => {
    acc[incident.threatLevel] = (acc[incident.threatLevel] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  const chartData = Object.entries(incidentsByThreatLevel).map(([threatLevel, count]) => ({
    threatLevel,
    count,
  }));

  // Colors for different threat levels
  const COLORS = ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50'];

  return (
    <div className="h-full flex flex-col p-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="threatLevel"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const SourceIpMapWidget: React.FC<{ 
  incidents: Incident[]; 
  settings?: any;
}> = ({ incidents, settings }) => {
  // Group incidents by source IP
  const incidentsBySourceIp = incidents.reduce<Record<string, number>>((acc, incident) => {
    acc[incident.sourceIp] = (acc[incident.sourceIp] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  const chartData = Object.entries(incidentsBySourceIp).map(([sourceIp, count]) => ({
    sourceIp,
    count,
  }));

  return (
    <div className="h-full flex flex-col p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sourceIp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#2196F3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedDashboard; 