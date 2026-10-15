import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, PlusCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { IncidentHistoryTable } from '../components/IncidentHistoryTable';

interface HistoryProps {
  onNavigate: (view: string, incidentId?: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getIncidents({ limit: '100' });
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Failed to load incident history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete incident ${id}?`)) {
      await api.deleteIncident(id);
      fetchIncidents();
    }
  };

  const handleSeed = async () => {
    await api.seedIncidents();
    fetchIncidents();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400">
            <HistoryIcon className="w-4 h-4" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Incident Diagnosis History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full record of all server log analyses, Nemotron diagnostic runs, and sandbox remediations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeed}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-dark-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-nvidia" />
            <span>Load Demo Incidents</span>
          </button>

          <button
            onClick={() => onNavigate('new-incident')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      {/* Incident History Table */}
      <IncidentHistoryTable
        incidents={incidents}
        isLoading={isLoading}
        onSelectIncident={(id) => onNavigate('incident-detail', id)}
        onRefresh={fetchIncidents}
        onDelete={handleDelete}
        onSeed={handleSeed}
      />
    </div>
  );
};
