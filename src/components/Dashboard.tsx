import React, { useState, useEffect, useCallback } from 'react';
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
  Sector,
  Cell,
  ResponsiveContainer,
  Pie,
} from 'recharts';
import { useTheme } from '@/hooks/use-theme'; 
import WidgetSettingsModal from './WidgetSettingsModal';
import { nanoid } from 'nanoid';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import ActivityFeedOverlay from "@/components/ActivityFeed";
import {cn} from "@/lib/utils";

interface Incident {
  timestamp: string; 
  sourceIP: string;
  category: string;
  severity: string;
  mitreTactic: string;
  location: {
    country: string;
    lat: number;
    lon: number;
  };
  time: string;
  sourceIp: string;
  threatLevel: string;
  description: string;
}

interface Widget {
  id: string;
  type: string;
  category: string;
  color?: string;
  settings?: {
    sourceColors?: { [key: string]: string };
    typeColors?: { [key: string]: string };
    severityColors?: { [key: string]: string };
    [key: string]: any;
  };
}

interface WidgetConfig {
  type: string;
  label: string;
  categories?: string[];
  visualizations?: string[];
}

const widgetConfigs: WidgetConfig[] = [
  {
    type: 'TotalIncidents',
    label: 'Total Incidents',
  },
  {
    type: 'IncidentTrends',
    label: 'Incident Trends over Time',
    visualizations: ['line'],
  },
  {
    type: 'TopSourceIps',
    label: 'Top Source IPs',
    visualizations: ['bar', 'pie'],
  },
  {
    type: 'CommonAttackTypes',
    label: 'Common Attack Types',
    visualizations: ['bar', 'pie'],
  },

];

interface DashboardProps {
    onAskAgentforce: (incident: Incident) => void;
    isActivityFeedOpen: boolean;
    setIsActivityFeedOpen: (isOpen: boolean) => void;
    activityFeedPosition: { top: number; left: number };
}

const Dashboard: React.FC<DashboardProps> = ({ onAskAgentforce, isActivityFeedOpen, setIsActivityFeedOpen, activityFeedPosition }) => {
  const { resolvedTheme } = useTheme()
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWidgets = localStorage.getItem('dashboardWidgets');
      return storedWidgets ? JSON.parse(storedWidgets) : [];
    }
    return [];
  });
  const [showAddWidgetModal, setShowAddWidgetModal] = useState<boolean>(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('');
  const [selectedVisualization, setSelectedVisualization] = useState<string>('');

  const [widgetToEdit, setWidgetToEdit] = useState<Widget | null>(null);

  useEffect(() => {
    fetch('/incidents.json')
      .then((response) => response.json())
      .then((data) => setIncidents(data));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  const addWidget = () => {
    if (selectedWidgetType && selectedVisualization) {
      const newWidget: Widget = {
        id: nanoid(),
        type: selectedWidgetType,
        category: selectedVisualization,
      };
      setWidgets([...widgets, newWidget]);
      setShowAddWidgetModal(false);
      setSelectedWidgetType('');
      setSelectedVisualization('');
    }
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
  };

  const handleWidgetSettings = useCallback((id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (widget) {
      setWidgetToEdit(widget);
    }
  }, [widgets]);

  const closeSettings = useCallback(() => {
    setWidgetToEdit(null);
  }, []);

  const updateWidgetSettings = (widget: Widget, settingType: string, key: string, color: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widget.id
        ? {
          ...w,
          settings: {
             ...w.settings,
            [settingType]: { ...w.settings?.[settingType], [key]: color },
          },
        }
        : w
    );
    setWidgets(updatedWidgets);
  };

  const dataByDate = incidents.reduce<Record<string, number>>((acc, incident) => {
    const timestamp = incident.timestamp;
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      const date = timestamp.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});  
  const incidentTrendsData = Object.entries(dataByDate).map(([date, count]) => ({
    date,
    count,
  }));
  const incidentSources = incidents.reduce<Record<string, number>>((acc, incident) => {
    acc[incident.sourceIP] = (acc[incident.sourceIP] || 0) + 1;
    return acc;
  }, {});
  const topSourcesData = Object.entries(incidentSources)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }));
  const incidentCategories = incidents.reduce<Record<string, number>>((acc, incident) => {
    acc[incident.category] = (acc[incident.category] || 0) + 1;
    return acc;
  }, {});

  const topCategoriesData = Object.entries(incidentCategories)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([category, count]) => ({ category, count }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#00FF00', '#0000FF', '#8884d8', '#82ca9d'];
  const getColor = (widget: Widget, dataKey: string, dataValue: string, index: number) => {
    const colorMap = widget.settings?.[dataKey + 'Colors'];
    return colorMap && colorMap[dataValue] ? colorMap[dataValue] : COLORS[index % COLORS.length];
  };  const renderWidget = useCallback((widget: Widget) => { 
    switch (widget.type) {
      case 'TotalIncidents':
        return (
          <Card className="shadow-md">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Total Incidents
                </CardTitle>
             </CardHeader>
             <CardContent>
             <div className={`p-4 rounded-lg shadow-md text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}>
             <p className="text-3xl font-bold">{incidents.length}</p>
             <Button variant="outline" size="icon" onClick={() => onAskAgentforce({
                time: '',
                sourceIP: '',
                category: '',
                severity: '',
                mitreTactic: '',
                location: {
                  country: '',
                  lat: 0,
                  lon: 0
                },
                timestamp: '',
                description: '',
                threatLevel: ''
              })}>
                <Bot className="h-4 w-4" />
              </Button>
             </div>
             </CardContent>
            </Card>
        );
      case 'IncidentTrends':
        return (<Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Incident Trends over Time
                </CardTitle>
             </CardHeader>
            <CardContent>
            <div className={`p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={
                        widget.color || resolvedTheme === "dark" ? COLORS[7] : COLORS[8]
                    }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
          </Card>
        );
      case 'TopSourceIps':
        if (widget.category === 'bar') {
          return (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Top Source IPs
                </CardTitle>
             </CardHeader>
            <CardContent>
            <div className={`p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}>
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSourcesData} >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis tick={{ fill: resolvedTheme === "dark" ? "white" : "black"}}/>
                  <Tooltip />
                  <Legend />
                  <Bar 
                      dataKey="count" 
                      fill={
                          widget.color || resolvedTheme === "dark" ? COLORS[9] : COLORS[1]
                      } />
                </BarChart>
              </ResponsiveContainer> 
            </div>
            </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Top Source IPs
                </CardTitle>
             </CardHeader>
            <CardContent>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height={300}>               
                <PieChart>
                  <Pie
                    data={topSourcesData}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={
                        widget.color || resolvedTheme === "dark" ? COLORS[7] : COLORS[8]
                    }
                    label
                  >
                    {topSourcesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColor(widget, "source", entry.source, index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
            </Card>
          );
        }
      case 'CommonAttackTypes':
        if (widget.category === 'bar') {
          return (
             <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Common Attack Types
                </CardTitle>
             </CardHeader>
            <CardContent>
            <div className={`p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCategoriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" 
                    fill={
                        widget.color || resolvedTheme === "dark" ? COLORS[9] : COLORS[1]
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
             </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                 Common Attack Types
                </CardTitle>
             </CardHeader>
            <CardContent>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height={300}>             
                <PieChart>
                  <Pie
                    data={topCategoriesData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={
                        widget.color || resolvedTheme === "dark" ? COLORS[7] : COLORS[8]
                    }
                    label
                  >
                    {topCategoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColor(widget, "category", entry.category, index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
            </Card>
          );
        }


      default:
        return null;
    }
  }, [incidents, resolvedTheme, onAskAgentforce]);

  return (
    <div className={`${resolvedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"} p-4 min-h-screen`}>
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Security Dashboard</h2>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 dark:bg-blue-700 dark:hover:bg-blue-900"
        onClick={() => setShowAddWidgetModal(true)}
      > 
        + Add Visualization
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <div key={widget.id} className="relative">
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
              {widget.type !== 'TotalIncidents' && (
               <button
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                onClick={() => handleWidgetSettings(widget.id)}
                >
                ⚙️
                </button>
              )}
              <button
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                onClick={() => removeWidget(widget.id)}
              >
                ❌
              </button>
            </div>
            {renderWidget(widget)}
          </div>
        ))}
      </div>
      {widgetToEdit !== null && (
          <WidgetSettingsModal
            widget={widgetToEdit}
            onClose={closeSettings}
            onUpdate={updateWidgetSettings}
            incidents={incidents}
          />
        )}


      {showAddWidgetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center dark:bg-gray-800 dark:bg-opacity-50">
          <div className="relative bg-white dark:bg-gray-700 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Widget</h3>
            <div className="mb-4">
              <label htmlFor="widgetType" className="block text-gray-700 text-sm font-bold mb-2 dark:text-white">
                Widget Type
              </label>               
              <select
                id="widgetType"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedWidgetType}
                onChange={(e) => setSelectedWidgetType(e.target.value)}
              >
                <option value="">Select Widget Type</option>
                {widgetConfigs.map((config) => (
                  <option key={config.type} value={config.type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            {selectedWidgetType && widgetConfigs.find((config) => config.type === selectedWidgetType)?.visualizations && (
              <div className="mb-4">
                <label htmlFor="visualization" className="block text-gray-700 text-sm font-bold mb-2 dark:text-white">
                  Visualization
                </label>
                <select
                  id="visualization"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedVisualization}
                  onChange={(e) => setSelectedVisualization(e.target.value)}
                >
                  <option value="">Select Visualization</option>
                  {widgetConfigs
                    .find((config) => config.type === selectedWidgetType)
                    ?.visualizations?.map((vis) => (
                      <option key={vis} value={vis}>
                        {vis.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2 dark:bg-gray-600 dark:hover:bg-gray-800"
                onClick={() => setShowAddWidgetModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-700 dark:hover:bg-blue-900"
                onClick={addWidget}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
