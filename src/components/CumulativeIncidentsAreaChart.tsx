'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {Incident} from '@/services/incidents';

interface CumulativeIncidentsAreaChartProps {
  incidents: Incident[];
}

interface CumulativeIncidentData {
  date: string;
  cumulativeIncidents: number;
}

const CumulativeIncidentsAreaChart: React.FC<CumulativeIncidentsAreaChartProps> = ({ incidents }) => {
  // Aggregate incidents by day
  const aggregatedData: { [date: string]: number } = {};

  incidents.forEach((incident) => {
    const date = new Date(incident.time).toLocaleDateString(); // Extract date from timestamp
    aggregatedData[date] = (aggregatedData[date] || 0) + 1;
  });

  // Convert aggregated data to array format for Recharts
  const chartData: CumulativeIncidentData[] = Object.keys(aggregatedData).map((date) => ({
    date,
    cumulativeIncidents: 0, // Initialize cumulative count to 0
  }));

  // Sort chartData by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate cumulative incidents
  let cumulativeCount = 0;
  for (let i = 0; i < chartData.length; i++) {
    cumulativeCount += aggregatedData[chartData[i].date] || 0;
    chartData[i].cumulativeIncidents = cumulativeCount;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="cumulativeIncidents" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CumulativeIncidentsAreaChart;
