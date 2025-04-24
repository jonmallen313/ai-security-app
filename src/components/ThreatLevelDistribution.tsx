'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import {Incident} from '@/services/incidents';

interface ThreatLevelDistributionProps {
  incidents: Incident[];
}

interface ThreatLevelData {
  name: string;
  value: number;
}

const ThreatLevelDistribution: React.FC<ThreatLevelDistributionProps> = ({ incidents }) => {
  // Aggregate incidents by threat level
  const aggregatedData: { [threatLevel: string]: number } = {};

  incidents.forEach((incident) => {
    aggregatedData[incident.threatLevel] = (aggregatedData[incident.threatLevel] || 0) + 1;
  });

  // Convert aggregated data to array format for Recharts
  const chartData: ThreatLevelData[] = Object.keys(aggregatedData).map((threatLevel) => ({
    name: threatLevel,
    value: aggregatedData[threatLevel],
  }));

  // Define colors for each threat level
  const threatLevelColors = {
    High: '#FF4444',   // Red
    Medium: '#FFAA00', // Orange
    Low: '#29ABE2',    // Blue
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={threatLevelColors[entry.name]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ThreatLevelDistribution;
