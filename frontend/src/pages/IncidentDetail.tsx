import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Download, Terminal } from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { RootCausePanel } from '../components/RootCausePanel';
import { TavilyIntelligenceCard } from '../components/TavilyIntelligenceCard';
import { FixSuggestionCard } from '../components/FixSuggestionCard';
import { AgentActivityFeed } from '../components/AgentActivityFeed';
import { AlertMockCard } from '../components/AlertMockCard';

interface IncidentDetailProps {
  incidentId: string;
  onNavigate: (view: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incidentId, onNavigate }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isExecutingSandbox, setIsExecutingSandbox] = useState(false);
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncident = async () => {
    setIsLoading(true);
    try {
      const res = await api.getIncidentById(incidentId);
      if (res.success && res.data) {
        setIncident(res.data);
      } else {
        setError('Incident not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load incident details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
    }
  }, [incidentId]);

  const handleEscalate = async () => {
    if (!incident) return;
    setIsEscalating(true);
    try {
      const res = await api.escalateIncident(incident.id);
      if (res.success && res.data) {
        setIncident(res.data);
      }
    } catch (err: any) {
      alert(`Escalation error: ${err.message}`);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleExecuteSandbox = async (script?: string) => {
    if (!incident) return;
    setIsExecutingSandbox(true);
    try {
      const res = await api.executeSandbox(incident.id, script);
      if (res.success && res.data) {
        setIncident(res.data.incident);
      }
    } catch (err: any) {
      alert(`Sandbox execution error: ${err.message}`);
    } finally {
      setIsExecutingSandbox(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!incident) return;
    try {
      const res = await api.updateIncidentStatus(incident.id, newStatus);
      if (res.success && res.data) {
        setIncident(res.data);
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const exportPostmortemMarkdown = () => {
    if (!incident) return;
    const rootCause = typeof incident.root_cause === 'object' && incident.root_cause !== null
      ? incident.root_cause.summary
      : (incident.root_cause || '');

    const fix = typeof incident.suggested_fix === 'object' && incident.suggested_fix !== null
      ? incident.suggested_fix.summary
      : (incident.suggested_fix || '');

    const markdown = `# Incident Postmortem: ${incident.title}
**Incident ID:** ${incident.id}  
**Date:** ${incident.created_at || new Date().toISOString()}  
**Service:** ${incident.service_name}  
**Severity:** ${incident.severity}  
**Status:** ${incident.status}  
**AI Diagnostic Engine:** ${incident.model_used || 'NVIDIA Nemotron via Nebius Token Factory'}  
**Confidence Score:** ${Math.round((incident.confidence_score || 0.95) * 100)}%

---

## 1. Executive Summary & Root Cause
${rootCause}

## 2. Remediation Actions
${fix}

### Executed Remediation Script:
\`\`\`bash
${incident.fix_script || '# No script recorded'}
\`\`\`

### Rollback Plan:
\`\`\`bash
${incident.rollback_script || '# No rollback needed'}
\`\`\`

## 3. Sandbox Verification Result
${incident.sandbox_result ? `
- Sandbox ID: ${incident.sandbox_result.sandboxId}
- Exit Code: ${incident.sandbox_result.exitCode}
- Verification: ${incident.sandbox_result.status}
` : 'Not executed in sandbox.'}

---
*Generated autonomously by OpsCopilot Incident Platform*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postmortem-${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading telemetry for {incidentId}...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested incident does not exist in the database.'}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('history')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident History</span>
        </button>

        <div className="flex items-center space-x-2">
          <select
            value={incident.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-dark-850 border border-dark-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ANALYZING">Analyzing</option>
            <option value="ROOT_CAUSE_IDENTIFIED">Root Cause Identified</option>
            <option value="FIX_RECOMMENDED">Fix Recommended</option>
            <option value="RESOLVED">Resolved (Closed)</option>
          </select>

          <button
            onClick={exportPostmortemMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 transition-all"
            title="Download Postmortem Markdown"
          >
            <Download className="w-3.5 h-3.5 text-brand-accent" />
            <span>Export Postmortem</span>
          </button>
        </div>
      </div>

      {/* Incident Title Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/80 px-2.5 py-1 rounded-lg border border-brand-800/60">
            {incident.id}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
            incident.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800/60' :
            incident.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border-amber-800/60' :
            'bg-blue-950 text-blue-400 border-blue-800/60'
          }`}>
            {incident.severity}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-dark-850 text-slate-300 border border-dark-700">
            {incident.service_name}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs bg-dark-850 text-slate-400 border border-dark-700 capitalize">
            {incident.environment}
          </span>
          <span className="text-xs text-slate-500 ml-auto">
            {incident.created_at ? new Date(incident.created_at).toLocaleString() : 'Recent'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          {incident.title}
        </h1>

        {incident.incident_description && (
          <p className="text-sm text-slate-300">
            {incident.incident_description}
          </p>
        )}
      </div>

      {/* Root Cause Diagnostics Panel */}
      <RootCausePanel
        rootCause={incident.root_cause}
        confidenceScore={incident.confidence_score}
        severity={incident.severity}
        serviceName={incident.service_name}
        environment={incident.environment}
        modelUsed={incident.model_used}
        onEscalate={handleEscalate}
        isEscalating={isEscalating}
      />

      {/* Real-Time Web Intelligence & CVE Check (Tavily AI Search) */}
      <TavilyIntelligenceCard
        incidentId={incident.id}
        sources={incident.tavily_sources}
        onRefreshSuccess={(newSources) => {
          setIncident(prev => prev ? { ...prev, tavily_sources: newSources } : null);
        }}
      />

      {/* Fix Recommendation & Sandbox Execution */}
      <FixSuggestionCard
        suggestedFix={incident.suggested_fix}
        fixScript={incident.fix_script}
        rollbackScript={incident.rollback_script}
        sandboxResult={incident.sandbox_result}
        onExecuteSandbox={handleExecuteSandbox}
        isExecutingSandbox={isExecutingSandbox}
      />

      {/* Hermes Reasoning Steps Timeline */}
      <AgentActivityFeed
        steps={incident.agent_reasoning_steps}
        modelUsed={incident.model_used}
        isLive={false}
      />

      {/* Slack / Teams Alert Card Simulation */}
      <AlertMockCard
        incident={incident}
        onExecuteSandbox={handleExecuteSandbox}
      />

      {/* Raw Logs Viewer (Collapsible) */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Raw Incident Server Logs</h3>
          </div>
          <button
            onClick={() => setShowRawLogs(!showRawLogs)}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            {showRawLogs ? 'Hide Raw Logs' : 'View Full Logs'}
          </button>
        </div>

        {showRawLogs && (
          <div className="rounded-xl border border-dark-800 bg-dark-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
            <pre>
              <code>{incident.log_text}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
