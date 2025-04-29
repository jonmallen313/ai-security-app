import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AgentsPage from './pages/AgentsPage';
import PlaybooksPage from './pages/PlaybooksPage';
import IncidentsPage from './pages/IncidentsPage';
import TasksPage from './pages/TasksPage';
import RulesPage from './pages/RulesPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-indigo-600">AI Security</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Agents
                  </Link>
                  <Link
                    to="/playbooks"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Playbooks
                  </Link>
                  <Link
                    to="/incidents"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Incidents
                  </Link>
                  <Link
                    to="/tasks"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Tasks
                  </Link>
                  <Link
                    to="/rules"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Rules
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-6">
          <Routes>
            <Route path="/" element={<AgentsPage />} />
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/rules" element={<RulesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 