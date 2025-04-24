'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {Incident} from '@/services/incidents';

interface SourceIpBarChartProps {
  incidents: Incident[];
}

interface SourceIpData {
  sourceIp: string;
  count: number;
}

const SourceIpBarChart: React.FC<SourceIpBarChartProps> = ({ incidents }) => {
  // Aggregate incidents by source IP
  const aggregatedData: { [sourceIp: string]: number } = {};

  incidents.forEach((incident) => {
    aggregatedData[incident.sourceIp] = (aggregatedData[incident.sourceIp] || 0) + 1;
  });

  // Convert aggregated data to array format for Recharts
  const chartData: SourceIpData[] = Object.keys(aggregatedData).map((sourceIp) => ({
    sourceIp,
    count: aggregatedData[sourceIp],
  }));

  // Sort chartData by count in descending order
  chartData.sort((a, b) => b.count - a.count);

  // Take the top 10 source IPs
  const topSourceIps = chartData.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={topSourceIps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="sourceIp" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SourceIpBarChart;
