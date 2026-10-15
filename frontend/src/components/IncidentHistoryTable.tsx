import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, Clock, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';
import type { Incident } from '../services/api';

interface IncidentHistoryTableProps {
  incidents: Incident[];
  isLoading: boolean;
  onSelectIncident: (id: string) => void;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onSeed?: () => void;
}

export const IncidentHistoryTable: React.FC<IncidentHistoryTableProps> = ({
  incidents,
  isLoading,
  onSelectIncident,
  onRefresh,
  onDelete,
  onSeed,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      !searchTerm ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-950/80 text-rose-400 border border-rose-800/50">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/80 text-amber-400 border border-amber-800/50">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800/50">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'FIX_RECOMMENDED':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-950/60 text-brand-300 border border-brand-800/40">
            <Clock className="w-3 h-3" />
            <span>Fix Ready</span>
          </span>
        );
      case 'ROOT_CAUSE_IDENTIFIED':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
            <AlertTriangle className="w-3 h-3" />
            <span>Root Cause Identified</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-dark-800 text-slate-300 border border-dark-700">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Analyzing</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-dark-700 overflow-hidden shadow-2xl">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-dark-700 bg-dark-900/60 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, title, or service..."
            className="w-full pl-9 pr-4 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ROOT_CAUSE_IDENTIFIED">Root Cause Identified</option>
            <option value="FIX_RECOMMENDED">Fix Ready</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ANALYZING">Analyzing</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Incidents"
              className="p-2 bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white rounded-xl border border-dark-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-700/80 bg-dark-950/60 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4">Incident ID</th>
              <th className="py-3 px-4">Title & Context</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">AI Model</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800 text-xs">
            {isLoading && incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading incident history...</span>
                </td>
              </tr>
            ) : filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 space-y-3">
                  <p>No incidents found matching the specified filters.</p>
                  {onSeed && (
                    <button
                      onClick={onSeed}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600/30 text-brand-300 border border-brand-500/40 hover:bg-brand-600/50 transition-all"
                    >
                      Load Sample SRE Incidents
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => onSelectIncident(incident.id)}
                  className="hover:bg-dark-850/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-400 text-xs whitespace-nowrap">
                    {incident.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                      {incident.title}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {incident.created_at ? new Date(incident.created_at).toLocaleString() : 'Just now'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-slate-300">
                      {incident.service_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getSeverityBadge(incident.severity)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(incident.status)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {incident.model_used || 'Nemotron-3'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident.id);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white transition-all flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(incident.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
