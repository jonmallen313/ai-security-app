'use client';

import React, {useState, useEffect} from 'react';
import {select} from 'd3';
import {Incident, getIncidents} from '@/services/incidents';

const tactics = [
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Exfiltration',
  'Impact',
];

const techniques = [
  'Phishing',
  'PowerShell',
  'Sudo Caching',
  'Scheduled Task',
  'Drive-by Compromise',
  'Command and Scripting Interpreter',
  'Registry Run Keys / Startup Folder',
  'Valid Accounts',
  'Obfuscated Files or Information',
  'Brute Force',
  'Credential Dumping',
  'System Information Discovery',
  'Network Service Scanning',
  'Remote Services',
  'Clipboard Data',
  'Application Layer Protocol',
  'Exfiltration Over Web Service',
  'Data Destruction',
];

const MitreMatrix = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [matrixData, setMatrixData] = useState<number[][]>([]);

  useEffect(() => {
    const loadIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data);
    };
    loadIncidents();
  }, []);

  useEffect(() => {
    // Map incidents to MITRE Matrix (adjust according to your incident structure)
    const updatedMatrix: number[][] = tactics.map(tactic => {
      return techniques.map(technique => {
        return incidents.filter(incident => {
          const descriptionLower = incident.description.toLowerCase();
          return (
            descriptionLower.includes(tactic.toLowerCase()) &&
            descriptionLower.includes(technique.toLowerCase())
          );
        }).length;
      });
    });
    setMatrixData(updatedMatrix);
  }, [incidents]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MITRE ATT&amp;CK Matrix</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              <th></th>
              {techniques.map((technique, j) => (
                <th key={j} className="text-left py-2 px-4 border-b">
                  {technique}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tactics.map((tactic, i) => (
              <tr key={i}>
                <td className="text-left py-2 px-4 border-r font-bold">{tactic}</td>
                {matrixData[i]?.map((cell, j) => (
                  <td
                    key={`${i}-${j}`}
                    className={`py-2 px-4 border-r text-center ${cell > 0 ? 'bg-red-200' : 'bg-gray-100'}`}
                    onClick={() => {
                      const filteredIncidents = incidents.filter(incident => {
                        const descriptionLower = incident.description.toLowerCase();
                        return (
                          descriptionLower.includes(tactics[i].toLowerCase()) &&
                          descriptionLower.includes(techniques[j].toLowerCase())
                        );
                      });
                      console.log(`Incidents clicked: ${tactics[i]} - ${techniques[j]}`, filteredIncidents);
                    }}
                  >
                    {cell > 0 && cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MitreMatrix;
