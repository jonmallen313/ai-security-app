'use client';

import React, {useState, useEffect, useCallback} from 'react';
import mitreMapData from '@/data/mitre-map.json';
import {Incident, getIncidents} from '@/services/incidents';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"

type MitreMap = {
  [tactic: string]: {
    [technique: string]: string[];
  };
};

const MitreMatrix = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const mitreMap: MitreMap = mitreMapData as MitreMap;

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

  const incidentMatches = incidents.map(incident => {
    const mitreMatch = matchIncidentToMitre(incident);
    return {
      ...incident,
      mitreTactic: mitreMatch ? mitreMatch.tactic : 'N/A',
      mitreTechnique: mitreMatch ? mitreMatch.technique : 'N/A',
    };
  });

  return (
    <div className="p-4">
      <Table>
        <TableCaption>A list of security incidents and their MITRE ATT&CK techniques.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead>Source IP</TableHead>
            <TableHead>Threat Level</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>MITRE Tactic</TableHead>
            <TableHead>MITRE Technique</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidentMatches.map((incident, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{incident.time}</TableCell>
              <TableCell>{incident.sourceIp}</TableCell>
              <TableCell>{incident.threatLevel}</TableCell>
              <TableCell>{incident.description}</TableCell>
              <TableCell>{incident.mitreTactic}</TableCell>
              <TableCell>{incident.mitreTechnique}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MitreMatrix;
