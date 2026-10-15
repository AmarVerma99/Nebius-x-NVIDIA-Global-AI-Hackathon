import React, { useState } from 'react';
import { Bot, CheckCircle2, ChevronDown, ChevronRight, Sparkles, Terminal } from 'lucide-react';
import type { AgentReasoningStep } from '../services/api';

interface AgentActivityFeedProps {
  steps?: AgentReasoningStep[];
  modelUsed?: string;
  isLive?: boolean;
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  steps = [],
  modelUsed = 'nvidia/nemotron-3-ultra',
  isLive = false,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });

  const toggleStep = (idx: number) => {
    setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const displaySteps = steps.length > 0 ? steps : [
    {
      step_number: 1,
      phase: 'Log Parsing & Anomaly Extraction',
      action: 'Extracted error signatures and timestamp clustering from raw input',
      findings: 'Identified abnormal termination codes and high concurrency timestamp cluster.',
      status: 'COMPLETED' as const
    },
    {
      step_number: 2,
      phase: 'Infrastructure & Metric Correlation',
      action: 'Correlated stack trace telemetry against Kubernetes/Cloud metrics',
      findings: 'Metric anomaly correlated with memory ceiling and connection wait queues.',
      status: 'COMPLETED' as const
    },
    {
      step_number: 3,
      phase: 'Hermes Causal Hypothesis Validation',
      action: 'Evaluated causal failure chain via NVIDIA Nemotron multi-hop reasoning',
      findings: 'Causal link confirmed between resource constraint and cascading upstream 5xx errors.',
      status: 'COMPLETED' as const
    },
    {
      step_number: 4,
      phase: 'Remediation Synthesis & Safety Validation',
      action: 'Generated declarative remediation script and calculated rollback risks',
      findings: 'Validated hot-patch script syntax with zero-downtime rolling update strategy.',
      status: 'COMPLETED' as const
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-dark-700 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-700 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Hermes Agent Orchestration Activity</span>
              {isLive && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  <span>LIVE REASONING</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Step-by-step diagnostic reasoning trace executed by NVIDIA Nemotron
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-dark-850 border border-dark-700 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-nvidia" />
            <span className="text-slate-400">Model:</span>
            <span className="font-mono font-medium text-slate-200">{modelUsed}</span>
          </div>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-3 pt-1">
        {displaySteps.map((step, idx) => {
          const isExpanded = expandedSteps[idx] !== false;
          const isCompleted = step.status === 'COMPLETED';
          const isProcessing = step.status === 'PROCESSING';

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                isProcessing
                  ? 'bg-brand-950/20 border-brand-500/40 shadow-glow-brand'
                  : 'bg-dark-850/60 border-dark-700/80 hover:border-dark-600'
              }`}
            >
              <div
                onClick={() => toggleStep(idx)}
                className="flex items-center justify-between p-3.5 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : isProcessing ? (
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-dark-800 border border-dark-700 text-slate-500 flex items-center justify-center text-xs font-mono">
                        {step.step_number || idx + 1}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Phase {step.step_number || idx + 1}:
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {step.phase}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{step.action}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-400">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : isProcessing
                      ? 'bg-brand-950/60 text-brand-300 border border-brand-700/40 animate-pulse'
                      : 'bg-dark-800 text-slate-400'
                  }`}>
                    {step.status}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && step.findings && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-dark-700/50">
                  <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-dark-950/70 border border-dark-800 text-xs">
                    <Terminal className="w-3.5 h-3.5 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-400 text-[11px] block mb-0.5">Agent Diagnostic Finding:</span>
                      <p className="text-slate-200 font-mono text-[11px] leading-relaxed">{step.findings}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
