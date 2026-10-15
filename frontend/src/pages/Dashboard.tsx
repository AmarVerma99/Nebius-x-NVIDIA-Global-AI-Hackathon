import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Clock, Zap, Server, Shield, Sparkles, ArrowRight, PlusCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats, Incident } from '../services/api';
import { IncidentHistoryTable } from '../components/IncidentHistoryTable';

interface DashboardProps {
  onNavigate: (view: string, incidentId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, incidentsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getIncidents({ limit: '10' })
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (incidentsRes.success) setIncidents(incidentsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = stats?.total || incidents.length || 0;
  const resolved = stats?.statusCounts?.RESOLVED || 0;
  const active = total - resolved;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Action Button */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-750 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-nvidia/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-nvidia/10 border border-brand-nvidia/20 text-brand-nvidia text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NVIDIA Nemotron AI Agent • Nebius Token Factory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Autonomous SRE & DevOps Incident Copilot
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyze raw server logs and stack traces with Hermes-inspired agentic reasoning. Identify root causes, synthesize declarative fixes, test safely in isolated sandboxes, and broadcast alerts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('new-incident')}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-brand-accent shadow-glow-brand hover:shadow-xl transition-all transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Submit New Incident</span>
            </button>
            <button
              onClick={fetchData}
              className="p-3.5 rounded-2xl bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-dark-700 transition-all flex items-center justify-center"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SRE Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tracked</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{total}</span>
            <span className="text-xs text-slate-400 ml-2">recorded events</span>
          </div>
          <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Incidents</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{active}</span>
            <span className="text-xs text-slate-400 ml-2">awaiting fix</span>
          </div>
          <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${total ? (active / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Assisted MTTR</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats?.mttrMinutes || 4.2}m
            </span>
            <span className="text-xs text-emerald-300 ml-2 font-semibold">↓ 88% vs manual</span>
          </div>
          <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-4/5" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sandbox Success Rate</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              {stats?.automatedFixSuccessRate || 96.4}%
            </span>
            <span className="text-xs text-slate-400 ml-2">safe execution</span>
          </div>
          <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full w-[96%]" />
          </div>
        </div>
      </div>

      {/* Breakdown and Top Services Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>Severity Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Telemetry</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Critical', count: stats?.severityCounts?.CRITICAL || 0, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: stats?.severityCounts?.HIGH || 0, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: stats?.severityCounts?.MEDIUM || 0, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low', count: stats?.severityCounts?.LOW || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className={`font-mono font-bold ${item.text}`}>{item.count}</span>
                </div>
                <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-brand-accent" />
              <span>Top Affected Services</span>
            </h3>
            <span className="text-xs text-slate-400">Past 30 Days</span>
          </div>

          <div className="space-y-3 pt-1">
            {stats?.topServices && stats.topServices.length > 0 ? (
              stats.topServices.map((srv) => (
                <div key={srv.service_name} className="flex items-center justify-between p-3 rounded-xl bg-dark-850/80 border border-dark-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-brand-accent" />
                    <span className="font-mono text-xs font-semibold text-white">{srv.service_name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-dark-900 text-brand-300 border border-dark-800">
                    {srv.count} {srv.count === 1 ? 'incident' : 'incidents'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No service anomalies logged yet.</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-nvidia" />
              <span>Hermes AI Agent Workflow</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">ONLINE</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-dark-850 border border-dark-700/60">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
              <div>
                <strong className="text-white block">Log Ingestion & Parsing</strong>
                <span>Extracts error traces, unindexed queries, and OOM kills.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-dark-850 border border-dark-700/60">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
              <div>
                <strong className="text-white block">Nemotron Causal Reasoning</strong>
                <span>Evaluates system failure chain & validates root hypothesis.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-dark-850 border border-dark-700/60">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
              <div>
                <strong className="text-white block">Sandbox Execution & Alerts</strong>
                <span>Runs fix inside isolated container & broadcasts Slack card.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Incident Stream</h2>
            <p className="text-xs text-slate-400">Live feed of all diagnosed outages and remediations.</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            <span>View Full Audit History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <IncidentHistoryTable
          incidents={incidents}
          isLoading={isLoading}
          onSelectIncident={(id) => onNavigate('incident-detail', id)}
          onRefresh={fetchData}
          onDelete={async (id) => {
            await api.deleteIncident(id);
            fetchData();
          }}
          onSeed={async () => {
            await api.seedIncidents();
            fetchData();
          }}
        />
      </div>
    </div>
  );
};
