import React, { useEffect, useState } from 'react';
import { apiService, Rule } from '../api/api';

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleType, setRuleType] = useState<Rule['rule_type']>('detection');
  const [conditions, setConditions] = useState('');
  const [actions, setActions] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await apiService.getRules();
        setRules(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rules');
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse conditions and actions from JSON strings
      const parsedConditions = JSON.parse(conditions);
      const parsedActions = JSON.parse(actions);

      const newRule = await apiService.createRule({
        name,
        description,
        rule_type: ruleType,
        conditions: parsedConditions,
        actions: parsedActions,
        is_active: true,
      });

      setRules((prev) => [newRule, ...prev]);
      // Reset form
      setName('');
      setDescription('');
      setRuleType('detection');
      setConditions('');
      setActions('');
    } catch (err) {
      setError('Failed to create rule. Make sure conditions and actions are valid JSON.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rules</h1>

      {/* Create Rule Form */}
      <div className="mb-8 border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Rule</h2>
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Rule Type</label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as Rule['rule_type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="detection">Detection</option>
              <option value="prevention">Prevention</option>
              <option value="response">Response</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Conditions (JSON)
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
              rows={4}
              placeholder='{"condition": "value"}'
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Actions (JSON array)
            </label>
            <textarea
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
              rows={4}
              placeholder='[{"action": "value"}]'
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Rule
          </button>
        </form>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{rule.name}</h2>
                <p className="text-gray-600">{rule.description}</p>
              </div>
              <div className="flex space-x-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    rule.rule_type === 'detection'
                      ? 'bg-blue-100 text-blue-800'
                      : rule.rule_type === 'prevention'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {rule.rule_type}
                </span>
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Conditions:</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(rule.conditions, null, 2)}
              </pre>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Actions:</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(rule.actions, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RulesPage; 