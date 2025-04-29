import React, { useEffect, useState } from 'react';
import { apiService, Agent } from '../api/api';

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await apiService.getAgents();
        setAgents(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch agents');
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{agent.name}</h2>
            <p className="text-gray-600">Type: {agent.agent_type}</p>
            <p className="text-gray-600">Status: {agent.status}</p>
            <p className="text-gray-600">Version: {agent.version}</p>
            <p className="text-gray-600">
              Last Seen: {agent.last_seen ? new Date(agent.last_seen).toLocaleString() : 'Never'}
            </p>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {agent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsPage; 