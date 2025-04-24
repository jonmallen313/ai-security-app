'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {Incident} from '@/services/incidents';

interface IncidentTrendsChartProps {
  incidents: Incident[];
}

interface IncidentData {
  date: string;
  High: number;
  Medium: number;
  Low: number;
}

const IncidentTrendsChart: React.FC<IncidentTrendsChartProps> = ({ incidents }) => {
  // Aggregate incidents by day and threat level
  const aggregatedData: { [date: string]: { High: number; Medium: number; Low: number } } = {};

  incidents.forEach((incident) => {
    const date = new Date(incident.time).toLocaleDateString(); // Extract date from timestamp
    if (!aggregatedData[date]) {
      aggregatedData[date] = { High: 0, Medium: 0, Low: 0 };
    }
    switch (incident.threatLevel) {
      case 'High':
        aggregatedData[date].High += 1;
        break;
      case 'Medium':
        aggregatedData[date].Medium += 1;
        break;
      case 'Low':
        aggregatedData[date].Low += 1;
        break;
    }
  });

  // Convert aggregated data to array format for Recharts
  const chartData: IncidentData[] = Object.keys(aggregatedData).map((date) => ({
    date,
    ...aggregatedData[date],
  }));

  // Define colors for each threat level
  const threatLevelColors = {
    High: '#FF4444',   // Red
    Medium: '#FFAA00', // Orange
    Low: '#29ABE2',    // Blue
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="High" stroke={threatLevelColors.High} name="High Threat" />
        <Line type="monotone" dataKey="Medium" stroke={threatLevelColors.Medium} name="Medium Threat" />
        <Line type="monotone" dataKey="Low" stroke={threatLevelColors.Low} name="Low Threat" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncidentTrendsChart;
