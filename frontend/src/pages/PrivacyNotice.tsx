import React from 'react';
import { Shield, Lock, EyeOff, Server, CheckCircle2, ArrowLeft } from 'lucide-react';

interface PrivacyNoticeProps {
  onNavigate: (view: string) => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to SRE Dashboard</span>
      </button>

      {/* Main Privacy Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-dark-700 space-y-8">
        <div className="flex items-center space-x-3.5 border-b border-dark-700 pb-6">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Security & Privacy Notice
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              How OpsCopilot handles log telemetry, AI model inference, and execution safety.
            </p>
          </div>
        </div>

        {/* Core Statement Box */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-brand-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Official Privacy Declaration</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            OpsCopilot processes the log text and incident descriptions you submit solely to generate AI-driven diagnostics using NVIDIA Nemotron models hosted on Nebius Token Factory. We do not sell or share your data with third parties beyond this AI inference provider. Avoid submitting logs containing real customer PII or production secrets — this is a demo/hackathon platform, not intended for production incident data.
          </p>
        </div>

        {/* Privacy Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Automatic Redaction */}
          <div className="p-5 rounded-2xl bg-dark-850/70 border border-dark-700/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <EyeOff className="w-4 h-4" />
              <span>Automatic Secret & PII Masking</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All submitted logs pass through regex sanitizers that detect and mask Bearer authorization tokens, API keys, passwords, and sensitive session credentials prior to model transmission.
            </p>
          </div>

          {/* Sandbox Isolation */}
          <div className="p-5 rounded-2xl bg-dark-850/70 border border-dark-700/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-brand-accent text-xs font-bold">
              <Server className="w-4 h-4" />
              <span>Strict Sandbox Isolation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI-generated remediation scripts are NEVER executed on the host server. All script testing occurs in virtualized Nebius container sandboxes with strict command blocklists.
            </p>
          </div>

          {/* API Key Containment */}
          <div className="p-5 rounded-2xl bg-dark-850/70 border border-dark-700/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>Backend Secrets Containment</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nebius Token Factory API keys and model parameters are kept strictly within server-side environment variables and are never bundled or transmitted into frontend client code.
            </p>
          </div>

          {/* Rate Limiting */}
          <div className="p-5 rounded-2xl bg-dark-850/70 border border-dark-700/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Quota & Abuse Rate Limiting</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To prevent quota depletion and abuse, rate limiting is actively enforced on authentication and incident submission endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
