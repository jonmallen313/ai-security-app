import React, { useEffect, useState } from 'react';
import { apiService, Incident, Agent } from '../api/api';

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Form state
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [severity, setSeverity] = useState<Incident['severity']>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsData, agentsData] = await Promise.all([
          apiService.getIncidents(),
          apiService.getAgents(),
        ]);
        setIncidents(incidentsData);
        setAgents(agentsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSimulateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setSimulating(true);
    try {
      const result = await apiService.simulateIncident({
        agent_id: selectedAgent,
        severity,
        description,
      });
      setIncidents((prev) => [result.incident, ...prev]);
      // Reset form
      setDescription('');
      setSeverity('medium');
    } catch (err) {
      setError('Failed to simulate incident');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Incidents</h1>

      {/* Simulation Form */}
      <div className="mb-8 border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Simulate Incident</h2>
        <form onSubmit={handleSimulateIncident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Incident['severity'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {simulating ? 'Simulating...' : 'Simulate Incident'}
          </button>
        </form>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 gap-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{incident.title}</h2>
                <p className="text-gray-600">{incident.description}</p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  incident.severity === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : incident.severity === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : incident.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {incident.severity}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Status: {incident.status}</p>
              <p>Source: {incident.source}</p>
              <p>Created: {new Date(incident.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentsPage; 