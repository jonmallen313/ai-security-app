'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Types for our data
interface IncidentTypeData {
  type: string;
  count: number;
}

interface IncidentTimeData {
  date: string;
  count: number;
}

interface ResolutionStatusData {
  status: string;
  value: number;
}

// Dummy data
const generateDummyData = () => {
  const incidentTypes = ['Phishing', 'Malware', 'DDoS', 'Unauthorized Access', 'Data Breach'];
  const resolutionStatuses = ['Open', 'Resolved', 'False Positive'];
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    byType: incidentTypes.map(type => ({
      type,
      count: Math.floor(Math.random() * 50) + 10
    })),
    overTime: dates.map(date => ({
      date,
      count: Math.floor(Math.random() * 20) + 5
    })),
    byStatus: resolutionStatuses.map(status => ({
      status,
      value: Math.floor(Math.random() * 100) + 20
    }))
  };
};

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const AnalyticsPage = () => {
  const [data, setData] = useState(generateDummyData());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(generateDummyData());
    setIsLoading(false);
    toast({
      title: "Data refreshed",
      description: "Analytics data has been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart
                width={500}
                height={300}
                data={data.byType}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <LineChart
                width={500}
                height={300}
                data={data.overTime}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resolution Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex justify-center">
              <PieChart width={400} height={300}>
                <Pie
                  data={data.byStatus}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage; 