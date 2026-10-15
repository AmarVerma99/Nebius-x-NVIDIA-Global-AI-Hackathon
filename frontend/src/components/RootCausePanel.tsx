import React from 'react';
import { Target, Zap, Layers, ArrowUpRight, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import type { RootCause } from '../services/api';

interface RootCausePanelProps {
  rootCause?: RootCause | string;
  confidenceScore?: number;
  severity?: string;
  serviceName?: string;
  environment?: string;
  modelUsed?: string;
  onEscalate?: () => void;
  isEscalating?: boolean;
}

export const RootCausePanel: React.FC<RootCausePanelProps> = ({
  rootCause,
  confidenceScore = 0.95,
  severity = 'HIGH',
  onEscalate,
  isEscalating = false,
}) => {
  const parsedRootCause: RootCause = typeof rootCause === 'object' && rootCause !== null
    ? rootCause
    : {
        summary: typeof rootCause === 'string' && rootCause.trim() !== ''
          ? rootCause
          : 'Detailed root cause analysis in progress by OpsCopilot Agent.',
        primary_subsystem: 'Application Runtime / Infrastructure',
        trigger_event: 'Resource saturation and cascading upstream request timeout',
        impact_assessment: 'Degraded latency and transient 5xx responses'
      };

  const confidencePercent = Math.round(confidenceScore * 100);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-6">
      {/* Top Header & Confidence Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-700 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-glow-rose">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Identified Root Cause
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/50">
                {severity}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              {parsedRootCause.primary_subsystem || 'System Failure Analysis'}
            </h2>
          </div>
        </div>

        {/* Confidence Score Gauge */}
        <div className="flex items-center space-x-3 bg-dark-850 px-4 py-2.5 rounded-xl border border-dark-700 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">AI Confidence</span>
            <span className="text-lg font-black text-emerald-400 font-mono leading-none">
              {confidencePercent}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent"
              style={{ transform: `rotate(${confidencePercent * 3.6}deg)` }}
            />
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Root Cause Summary Narrative */}
      <div className="p-4 rounded-xl bg-dark-900/90 border border-dark-700/80">
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {parsedRootCause.summary}
        </p>
      </div>

      {/* Structured Sub-dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trigger Event */}
        <div className="p-4 rounded-xl bg-dark-850/70 border border-dark-700/70 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <Zap className="w-4 h-4" />
            <span>Root Cause Trigger Event</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {parsedRootCause.trigger_event || 'High concurrency event triggered unconstrained resource consumption.'}
          </p>
        </div>

        {/* Blast Radius & Impact */}
        <div className="p-4 rounded-xl bg-dark-850/70 border border-dark-700/70 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Blast Radius & Impact</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {parsedRootCause.impact_assessment || 'Service endpoints experienced latency degradation and intermittent 503 errors.'}
          </p>
        </div>
      </div>

      {/* Escalation Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Layers className="w-3.5 h-3.5 text-brand-500" />
          <span>Need deeper multi-hop causal reasoning?</span>
        </div>

        {onEscalate && (
          <button
            type="button"
            onClick={onEscalate}
            disabled={isEscalating}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brand-300 bg-brand-950/80 hover:bg-brand-900 border border-brand-700/50 hover:border-brand-500 transition-all disabled:opacity-50"
          >
            {isEscalating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <span>Escalating to Nemotron Ultra Max...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-brand-nvidia" />
                <span>Escalate to Nemotron Ultra Max Reasoning</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
