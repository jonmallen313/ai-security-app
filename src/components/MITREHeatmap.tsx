import React, { useState } from 'react';
import incidentsData from '@/data/incidents.json';
import mitreMapData from '@/data/mitre-map.json';

type Incident = {
  time: string;
  sourceIp: string;
  threatLevel: string;
  description: string;
};

type MitreMap = {
  [tactic: string]: {
    [technique: string]: string[];
  };
};

const MITREHeatmap: React.FC = () => {
  const incidents: Incident[] = incidentsData as Incident[];
  const mitreMap: MitreMap = mitreMapData as MitreMap;

  const tactics: string[] = Object.keys(mitreMap);
  const techniques: string[] = tactics.flatMap(tactic => Object.keys(mitreMap[tactic]));

  const matchIncidents = (
    incidents: Incident[],
    mitreMap: MitreMap
  ): { [technique: string]: Incident[] } => {
    const techniqueIncidentMap: { [technique: string]: Incident[] } = {};

    incidents.forEach(incident => {
      Object.entries(mitreMap).forEach(([tactic, techniques]) => {
        Object.entries(techniques).forEach(([technique, keywords]) => {
          keywords.forEach(keyword => {
            if (incident.description.toLowerCase().includes(keyword.toLowerCase())) {
              if (!techniqueIncidentMap[technique]) {
                techniqueIncidentMap[technique] = [];
              }
              if (!techniqueIncidentMap[technique].includes(incident)){
                techniqueIncidentMap[technique].push(incident);
              }
              
            }
          });
        });
      });
    });

    return techniqueIncidentMap;
  };

  const incidentMatches = matchIncidents(incidents, mitreMap);

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className='hidden md:block'></div>
        {tactics.map((tactic, index) => (
          <div key={index} className="text-center font-bold p-2">
            {tactic}
          </div>
        ))}
        {techniques.map((technique, index) => (
          <React.Fragment key={index}>
            <div className="font-medium p-2 border rounded">{technique}</div>
            {tactics.map((tactic, tacticIndex) => (
              <div
                key={`${index}-${tacticIndex}`}
                className={`relative p-2 border rounded text-center ${
                  incidentMatches[technique] ? 'bg-red-200' : ''
                }`}
                onMouseEnter={() => setHoveredCell(technique)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {technique}
                {hoveredCell === technique && incidentMatches[technique] && (
                  <div className="absolute top-full left-0 bg-white border shadow-md p-2 z-10 w-64">
                    <h4 className="font-bold">Incidents:</h4>
                    <ul>
                      {incidentMatches[technique].map((incident, i) => (
                        <li key={i} className="text-sm">
                          {incident.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MITREHeatmap;
