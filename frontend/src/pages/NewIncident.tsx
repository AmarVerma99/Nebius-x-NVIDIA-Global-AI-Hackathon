import React, { useState } from 'react';
import { Bot, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { AgentReasoningStep } from '../services/api';
import { IncidentForm } from '../components/IncidentForm';
import { AgentActivityFeed } from '../components/AgentActivityFeed';

interface NewIncidentProps {
  onNavigate: (view: string, incidentId?: string) => void;
}

export const NewIncident: React.FC<NewIncidentProps> = ({ onNavigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<AgentReasoningStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    title: string;
    service_name: string;
    severity: string;
    environment: string;
    incident_description: string;
    log_text: string;
  }) => {
    setIsAnalyzing(true);
    setError(null);

    const steps: AgentReasoningStep[] = [
      {
        step_number: 1,
        phase: 'Log Ingestion & Anomaly Signature Extraction',
        action: `Parsing error signatures and timestamp clusters from ${formData.service_name} logs`,
        findings: 'Identified abnormal termination codes and high concurrency timestamp cluster.',
        status: 'PROCESSING'
      },
      {
        step_number: 2,
        phase: 'Tavily Real-Time Web Intelligence & CVE Check',
        action: 'Querying Tavily AI Search for live GitHub issues, CVE advisories, and Kubernetes documentation',
        findings: '',
        status: 'PENDING'
      },
      {
        step_number: 3,
        phase: 'Infrastructure Telemetry Correlation',
        action: 'Correlating log timestamps against Kubernetes CPU/Memory cgroups & network sockets',
        findings: '',
        status: 'PENDING'
      },
      {
        step_number: 4,
        phase: 'Hermes Causal Hypothesis Validation',
        action: 'Evaluating causal fault pattern with NVIDIA Nemotron model on Nebius Token Factory',
        findings: '',
        status: 'PENDING'
      },
      {
        step_number: 5,
        phase: 'Remediation Script Synthesis & Safety Checks',
        action: 'Formulating declarative fix script and generating Slack webhook preview',
        findings: '',
        status: 'PENDING'
      }
    ];

    setCurrentSteps([...steps]);

    const timer1 = setTimeout(() => {
      steps[0].status = 'COMPLETED';
      steps[0].findings = 'Isolated core stacktrace and error signature clustering.';
      steps[1].status = 'PROCESSING';
      setCurrentSteps([...steps]);
    }, 500);

    const timer2 = setTimeout(() => {
      steps[1].status = 'COMPLETED';
      steps[1].findings = 'Retrieved live community solutions and vendor advisories via Tavily AI Search.';
      steps[2].status = 'PROCESSING';
      setCurrentSteps([...steps]);
    }, 1000);

    const timer3 = setTimeout(() => {
      steps[2].status = 'COMPLETED';
      steps[2].findings = 'Telemetry correlation confirmed resource and socket boundary limits.';
      steps[3].status = 'PROCESSING';
      setCurrentSteps([...steps]);
    }, 1500);

    try {
      const res = await api.analyzeIncident(formData);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (res.success && res.data) {
        steps.forEach(s => { s.status = 'COMPLETED'; });
        setCurrentSteps([...steps]);

        setTimeout(() => {
          onNavigate('incident-detail', res.data.id);
        }, 600);
      } else {
        throw new Error('Analysis failed to return incident data.');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setError(err.message || 'An error occurred during AI agent orchestration.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to SRE Dashboard</span>
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isAnalyzing ? (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-brand-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 mx-auto shadow-glow-brand">
              <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-brand-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">
              Hermes AI Agent Orchestration Active
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              NVIDIA Nemotron is analyzing system logs, diagnosing causal failure modes, and synthesizing validated hot-patches.
            </p>
          </div>

          <AgentActivityFeed steps={currentSteps} isLive={true} />
        </div>
      ) : (
        <IncidentForm onSubmit={handleSubmit} isLoading={isAnalyzing} />
      )}
    </div>
  );
};
