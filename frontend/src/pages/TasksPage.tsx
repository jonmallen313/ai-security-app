import React, { useEffect, useState } from 'react';
import { apiService, Task, Agent, Playbook } from '../api/api';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, agentsData, playbooksData] = await Promise.all([
          apiService.getTasks(),
          apiService.getAgents(),
          apiService.getPlaybooks(),
        ]);
        setTasks(tasksData);
        setAgents(agentsData);
        setPlaybooks(playbooksData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !selectedPlaybook) return;

    try {
      const newTask = await apiService.createTask({
        name,
        description,
        status: 'pending',
        priority,
        agent_id: selectedAgent,
        playbook_id: selectedPlaybook,
        parameters: {},
      });
      setTasks((prev) => [newTask, ...prev]);
      // Reset form
      setName('');
      setDescription('');
      setSelectedAgent('');
      setSelectedPlaybook('');
      setPriority('medium');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {/* Create Task Form */}
      <div className="mb-8 border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Playbook</label>
            <select
              value={selectedPlaybook}
              onChange={(e) => setSelectedPlaybook(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a playbook</option>
              {playbooks.map((playbook) => (
                <option key={playbook.id} value={playbook.id}>
                  {playbook.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{task.name}</h2>
                <p className="text-gray-600">{task.description}</p>
              </div>
              <div className="flex space-x-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    task.priority === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : task.status === 'running'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Created: {new Date(task.created_at).toLocaleString()}</p>
              {task.started_at && (
                <p>Started: {new Date(task.started_at).toLocaleString()}</p>
              )}
              {task.completed_at && (
                <p>Completed: {new Date(task.completed_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage; 