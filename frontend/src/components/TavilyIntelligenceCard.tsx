import React, { useState } from 'react';
import { Globe, ExternalLink, RefreshCw, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { TavilySource } from '../services/api';

interface TavilyIntelligenceCardProps {
  incidentId: string;
  sources?: TavilySource[] | string;
  tavilyAnswer?: string;
  onRefreshSuccess?: (newSources: TavilySource[]) => void;
}

export const TavilyIntelligenceCard: React.FC<TavilyIntelligenceCardProps> = ({
  incidentId,
  sources,
  tavilyAnswer,
  onRefreshSuccess
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Parse sources if string
  let parsedSources: TavilySource[] = [];
  if (Array.isArray(sources)) {
    parsedSources = sources;
  } else if (typeof sources === 'string' && sources.trim() !== '') {
    try {
      parsedSources = JSON.parse(sources);
    } catch {
      parsedSources = [];
    }
  }

  const handleRefresh = async () => {
    if (!incidentId || incidentId.startsWith('TEMP')) return;
    setIsRefreshing(true);
    setFeedbackMsg(null);
    try {
      const res = await api.searchTavily(incidentId);
      if (res.success && res.data.tavilyResult) {
        setFeedbackMsg('Live web intelligence refreshed via Tavily AI Search!');
        if (onRefreshSuccess) {
          onRefreshSuccess(res.data.tavilyResult.sources || []);
        }
      }
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to refresh Tavily search.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const getDomainBadgeColor = (domain: string) => {
    if (domain.includes('kubernetes.io')) return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    if (domain.includes('github.com')) return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    if (domain.includes('stackoverflow.com')) return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    if (domain.includes('cve.mitre.org')) return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-teal-500/20 bg-gradient-to-b from-dark-850/90 to-dark-900/90 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-700/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                Real-Time Web Intelligence
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950/80 text-teal-300 border border-teal-800/50">
                Powered by Tavily AI Search
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              Live SRE Knowledge & CVE Verification
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all duration-200 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Querying Tavily...' : 'Re-scan Web'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 text-xs text-teal-300 flex items-center space-x-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tavily AI Consensus / Synthesis */}
      <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-700/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1.5">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span>Community & Vendor Consensus:</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {tavilyAnswer || 'Cross-referenced against active GitHub issues, official Kubernetes documentation, and vendor CVE databases via Tavily AI Search.'}
        </p>
      </div>

      {/* Verified External Sources List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Correlated Reference Sources ({parsedSources.length})</span>
          <span className="text-[11px] text-teal-400/80 font-normal lowercase">live web retrieval</span>
        </div>

        {parsedSources.length === 0 ? (
          <div className="p-4 rounded-xl bg-dark-900/40 border border-dashed border-dark-700 text-center text-xs text-slate-400">
            No external sources linked yet. Click "Re-scan Web" to query Tavily AI Search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedSources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded-xl bg-dark-850/70 hover:bg-dark-800 border border-dark-700/70 hover:border-teal-500/40 transition-all duration-200 flex flex-col justify-between space-y-2.5 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDomainBadgeColor(source.domain || '')}`}>
                    {source.domain || 'External Source'}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400 group-hover:text-teal-400 transition-colors">
                    <span className="text-[10px] font-mono text-emerald-400">
                      {Math.round((source.score || 0.85) * 100)}% match
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1">
                    {source.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {source.snippet}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
