import React, { useState } from 'react';
import { Bell, MessageSquare, Copy, Check, Bot } from 'lucide-react';
import type { Incident } from '../services/api';

interface AlertMockCardProps {
  incident: Incident;
  onExecuteSandbox?: () => void;
}

export const AlertMockCard: React.FC<AlertMockCardProps> = ({ incident, onExecuteSandbox }) => {
  const [activePlatform, setActivePlatform] = useState<'slack' | 'teams' | 'raw'>('slack');
  const [copiedPayload, setCopiedPayload] = useState(false);

  const rootCauseSummary = typeof incident.root_cause === 'object' && incident.root_cause !== null
    ? incident.root_cause.summary
    : (incident.root_cause || 'Root cause under investigation');

  const fixSummary = typeof incident.suggested_fix === 'object' && incident.suggested_fix !== null
    ? incident.suggested_fix.summary
    : (incident.suggested_fix || 'Remediation script available');

  const payloadString = JSON.stringify(incident.alert_payload || {}, null, 2);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadString);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const severityColor = incident.severity === 'CRITICAL' ? 'border-l-rose-500' : incident.severity === 'HIGH' ? 'border-l-amber-500' : 'border-l-blue-500';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-700 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Incident Alert Broadcast Mockup</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-dark-800 text-slate-300 font-mono">
                Webhook Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live preview of Slack Block Kit & Microsoft Teams alerts generated automatically by OpsCopilot.
            </p>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-dark-900 border border-dark-700">
          <button
            type="button"
            onClick={() => setActivePlatform('slack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'slack'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Slack Block Kit
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'teams'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MS Teams
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'raw'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Platform Display */}
      {activePlatform === 'slack' && (
        <div className="rounded-xl border border-dark-750 bg-[#1A1D21] p-4 sm:p-5 text-slate-200 font-sans shadow-xl">
          {/* Slack Channel Header */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3 pb-2 border-b border-dark-700/50">
            <span className="font-bold text-slate-300">#sre-incidents</span>
            <span>•</span>
            <span className="text-[11px]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Bot Post Header */}
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">OpsCopilot</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-dark-700 text-slate-300 font-bold uppercase">APP</span>
                <span className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</span>
              </div>

              {/* Slack Attachment Block */}
              <div className={`border-l-4 ${severityColor} bg-[#222529] rounded-r-lg p-4 space-y-3`}>
                <div className="font-bold text-sm text-white flex items-center space-x-2">
                  <span>🚨 [OpsCopilot AI Alert] {incident.title}</span>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Service:</span>
                    <span className="font-mono font-bold text-brand-300">{incident.service_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Severity:</span>
                    <span className="font-bold text-rose-400">{incident.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">AI Confidence:</span>
                    <span className="font-bold text-emerald-400">{Math.round((incident.confidence_score || 0.95) * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Incident ID:</span>
                    <span className="font-mono text-slate-300">{incident.id}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 block font-semibold">🔍 Root Cause Summary:</span>
                  <p className="text-slate-200 leading-relaxed">{rootCauseSummary}</p>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 block font-semibold">🛠️ Recommended Fix:</span>
                  <p className="text-slate-200 leading-relaxed">{fixSummary}</p>
                </div>

                {/* Slack Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onExecuteSandbox}
                    className="px-3 py-1.5 bg-[#007A5A] hover:bg-[#148567] text-white text-xs font-bold rounded shadow transition-all flex items-center space-x-1"
                  >
                    <span>⚡ Execute in Sandbox</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (incident.fix_script) navigator.clipboard.writeText(incident.fix_script);
                    }}
                    className="px-3 py-1.5 bg-[#35373B] hover:bg-[#43464B] text-slate-200 text-xs font-medium rounded border border-dark-600 transition-all"
                  >
                    <span>📋 Copy Fix Command</span>
                  </button>
                  <span className="text-[11px] text-slate-500 ml-auto font-mono">NVIDIA Nemotron-3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activePlatform === 'teams' && (
        <div className="rounded-xl border border-dark-700 bg-[#201F1F] p-5 text-slate-200 font-sans shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Microsoft Teams Adaptive Card (v1.4)</span>
          </div>

          <div className="p-4 rounded-lg bg-[#292828] border-l-4 border-l-rose-500 space-y-3">
            <h4 className="text-sm font-bold text-white">🚨 [OpsCopilot] {incident.title}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div><strong>Service:</strong> {incident.service_name}</div>
              <div><strong>Severity:</strong> {incident.severity}</div>
              <div><strong>Environment:</strong> {incident.environment}</div>
              <div><strong>Model:</strong> {incident.model_used || 'NVIDIA Nemotron'}</div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{rootCauseSummary}</p>
          </div>
        </div>
      )}

      {activePlatform === 'raw' && (
        <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-950 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Webhook JSON Payload</span>
            <button
              type="button"
              onClick={handleCopyPayload}
              className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
            </button>
          </div>
          <pre className="p-3 bg-dark-900 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-64">
            <code>{payloadString}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
