import React, { useState } from 'react';
import { Wrench, Play, Copy, Check, Terminal, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SuggestedFix, SandboxResult } from '../services/api';

interface FixSuggestionCardProps {
  suggestedFix?: SuggestedFix | string;
  fixScript?: string;
  rollbackScript?: string;
  sandboxResult?: SandboxResult | null;
  onExecuteSandbox?: (script?: string) => Promise<void>;
  isExecutingSandbox?: boolean;
}

export const FixSuggestionCard: React.FC<FixSuggestionCardProps> = ({
  suggestedFix,
  fixScript = '',
  rollbackScript = '',
  sandboxResult,
  onExecuteSandbox,
  isExecutingSandbox = false,
}) => {
  const [activeTab, setActiveTab] = useState<'fix' | 'rollback'>('fix');
  const [copied, setCopied] = useState(false);

  const parsedFix: SuggestedFix = typeof suggestedFix === 'object' && suggestedFix !== null
    ? suggestedFix
    : {
        summary: typeof suggestedFix === 'string' && suggestedFix.trim() !== ''
          ? suggestedFix
          : 'Apply declarative patch and restart workload.',
        estimated_downtime: '0s (rolling update)',
        risk_level: 'LOW',
        steps: ['1. Apply patch', '2. Verify pods', '3. Confirm telemetry']
      };

  const currentScript = activeTab === 'fix' ? fixScript : rollbackScript;

  const handleCopy = () => {
    if (!currentScript) return;
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSandbox = async () => {
    if (onExecuteSandbox) {
      await onExecuteSandbox(fixScript);
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-700 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-glow-brand">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Recommended Remediation
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                Estimated Downtime: {parsedFix.estimated_downtime || '0 seconds'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {parsedFix.summary}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-dark-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Script'}</span>
          </button>

          {onExecuteSandbox && (
            <button
              type="button"
              onClick={handleRunSandbox}
              disabled={isExecutingSandbox || !fixScript}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow-emerald disabled:opacity-50 transition-all transform active:scale-95"
            >
              {isExecutingSandbox ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing in Sandbox...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute in Nebius Sandbox</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Script Tabs and Code Display */}
      <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-950">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-dark-900 border-b border-dark-800">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('fix')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'fix'
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Remediation Script (Bash / Kubectl)</span>
            </button>

            {rollbackScript && (
              <button
                type="button"
                onClick={() => setActiveTab('rollback')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'rollback'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback Procedure</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandbox Safe</span>
          </div>
        </div>

        {/* Script Code Block */}
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed">
            <code>{currentScript || '# No script available for this section'}</code>
          </pre>
        </div>
      </div>

      {/* Sandbox Live Execution Results Terminal */}
      {sandboxResult && (
        <div className="rounded-xl border border-emerald-900/40 bg-dark-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Nebius Isolated Sandbox Verification Output</span>
              </h4>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span>Exit Code: <strong className="text-emerald-400">{sandboxResult.exitCode}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-slate-200">{sandboxResult.durationMs}ms</strong></span>
              <span>•</span>
              <span>Env: <strong className="text-slate-200">{sandboxResult.environment}</strong></span>
            </div>
          </div>

          <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto max-h-48">
            {sandboxResult.stdout.split('\n').map((line, i) => (
              <div key={i} className="flex space-x-2">
                <span className="text-slate-600 select-none">{i + 1}</span>
                <span className={line.includes('Error Rate: 0.00%') ? 'text-emerald-400 font-bold' : ''}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
