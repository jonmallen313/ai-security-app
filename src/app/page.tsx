"use client";

import React, { useState, useEffect } from "react";
import {getIncidents, Incident} from '@/services/incidents';
import IncidentTrendsChart from '@/components/IncidentTrendsChart';
import ThreatLevelDistribution from '@/components/ThreatLevelDistribution';
import SourceIpBarChart from '@/components/SourceIpBarChart';
import CumulativeIncidentsAreaChart from '@/components/CumulativeIncidentsAreaChart';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Incident Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTrendsChart incidents={incidents} />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Threat Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ThreatLevelDistribution incidents={incidents} />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Top Source IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <SourceIpBarChart incidents={incidents} />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Cumulative Incidents Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <CumulativeIncidentsAreaChart incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  );
}
