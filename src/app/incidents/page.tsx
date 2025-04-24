'use client';

import React, {useState, useEffect} from 'react';
import {getIncidents, Incident} from '@/services/incidents';
import MITREHeatmap from '@/components/MITREHeatmap';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h2 className="text-xl font-semibold mb-4">MITRE ATT&amp;CK Heatmap</h2>
        <MITREHeatmap/>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Security Incidents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {incidents.map((incident, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <CardTitle>Threat Level: {incident.threatLevel}</CardTitle>
                <CardDescription>Time: {incident.time}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Source IP: {incident.sourceIp}</p>
                <p>Description: {incident.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IncidentsPage;
