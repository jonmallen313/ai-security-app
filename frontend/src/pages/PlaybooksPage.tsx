import React, { useEffect, useState } from 'react';
import { apiService, Playbook } from '../api/api';

const PlaybooksPage: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const data = await apiService.getPlaybooks();
        setPlaybooks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch playbooks');
        setLoading(false);
      }
    };

    fetchPlaybooks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Playbooks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playbooks.map((playbook) => (
          <div key={playbook.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{playbook.name}</h2>
            <p className="text-gray-600 mb-2">{playbook.description}</p>
            <p className="text-gray-600">Version: {playbook.version}</p>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Steps:</h3>
              <ol className="list-decimal list-inside space-y-2">
                {playbook.steps.map((step, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{step.name}</span>
                    <span className="text-gray-500"> ({step.action})</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaybooksPage; 