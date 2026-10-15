import React, { useState } from 'react';
import { Terminal, Cpu, Database, Server, Key, HardDrive, Play, Sparkles, ShieldCheck, FileText } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (formData: {
    title: string;
    service_name: string;
    severity: string;
    environment: string;
    incident_description: string;
    log_text: string;
  }) => void;
  isLoading: boolean;
}

interface IncidentPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  title: string;
  service_name: string;
  severity: string;
  environment: string;
  description: string;
  logs: string;
}

const PRESETS: IncidentPreset[] = [
  {
    id: 'k8s-oom',
    name: 'K8s OOMKilled (Exit 137)',
    icon: Cpu,
    title: 'Kubernetes Pod OOMKilled during batch sync in checkout-worker',
    service_name: 'checkout-worker',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'Multiple worker pods abruptly restarting during scheduled batch processing, causing order queue spikes.',
    logs: `[2026-09-27T10:14:22.812Z] [ERROR] [cgroup-memory] Memory cgroup out of memory: Killed process 19284 (node) total-vm:1842048kB, anon-rss:524288kB, file-rss:0kB, shmem-rss:0kB
[2026-09-27T10:14:23.001Z] [FATAL] Container checkout-worker-7f89b-x92zk exited with status 137 (OOMKilled)
[2026-09-27T10:14:23.119Z] [WARN] k8s-node-04 kubelet: Back-off restarting failed container checkout-worker in pod checkout-worker-7f89b-x92zk
[2026-09-27T10:14:25.402Z] [INFO] [k8s-controller] Pod status transitioned from Running -> CrashLoopBackOff`
  },
  {
    id: 'pg-locks',
    name: 'PostgreSQL Lock Contention',
    icon: Database,
    title: 'Postgres Connection Pool Starvation and Exclusive Lock Wait',
    service_name: 'orders-database',
    severity: 'HIGH',
    environment: 'production',
    description: 'Orders API queries timing out across all worker threads. PgBouncer pool saturated.',
    logs: `2026-09-27 11:22:04.102 UTC [32194] FATAL: remaining connection slots are reserved for non-replication superuser connections
2026-09-27 11:22:04.105 UTC [32195] ERROR: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL: too many connections for role "order_service"
2026-09-27 11:22:05.891 UTC [32201] WARNING: process 8841 still waiting for RowExclusiveLock on relation 16402 of database 16384 after 30000.123 ms
2026-09-27 11:22:06.002 UTC [32204] DETAIL: Process holding the lock: 7421 (state: idle in transaction, query: UPDATE orders SET status = 'reconciled' WHERE created_at < NOW())`
  },
  {
    id: 'nginx-502',
    name: 'Nginx 502 Bad Gateway',
    icon: Server,
    title: 'Nginx Ingress 502 Bad Gateway Upstream Connection Refused',
    service_name: 'ingress-gateway',
    severity: 'HIGH',
    environment: 'production',
    description: 'API gateway returning HTTP 502 Bad Gateway to external mobile clients during deployment rollout.',
    logs: `2026/09/27 12:45:10 [error] 142#142: *894123 connect() to 10.244.2.45:8080 failed (111: Connection refused) while connecting to upstream, client: 192.168.1.104, server: api.production.internal, request: "POST /v1/checkout HTTP/2.0", upstream: "http://10.244.2.45:8080/v1/checkout"
2026/09/27 12:45:11 [error] 142#142: *894124 upstream timed out (110: Connection timed out) while reading response header from upstream
2026/09/27 12:45:12 [warn] 142#142: *894125 [lua] balancer.lua: no healthy upstreams found for upstream "auth-backend-pool"`
  },
  {
    id: 'redis-ooms',
    name: 'Redis Memory Eviction Storm',
    icon: Server,
    title: 'Redis MaxMemory Limit Reached & Key Eviction Storm',
    service_name: 'session-cache',
    severity: 'HIGH',
    environment: 'production',
    description: 'Session authentication latency spiked 200x; cache reporting OOM command rejection errors.',
    logs: `1:M 27 Sep 2026 13:01:45.120 # WARNING: [redis] used_memory:4294967296 exceeds maxmemory:4294967296 (4.00G)
1:M 27 Sep 2026 13:01:45.121 # (error) OOM command not allowed when used memory > 'maxmemory'.
1:M 27 Sep 2026 13:01:45.189 * Evicting 25000 keys per second under volatile-lru policy
1:M 27 Sep 2026 13:01:46.002 # WARNING: Client 10.0.12.42:54910 timed out waiting for redis response (latency > 5000ms)`
  },
  {
    id: 'iam-expired',
    name: 'AWS IAM STS Token Expiration',
    icon: Key,
    title: 'Cloud IAM Security Token Expired in S3 Document Storage',
    service_name: 'document-processor',
    severity: 'MEDIUM',
    environment: 'production',
    description: 'Document upload worker failing to write multipart chunks to S3 with 403 Forbidden.',
    logs: `com.amazonaws.services.s3.model.AmazonS3Exception: The security token included in the request is expired (Service: Amazon S3; Status Code: 403; Error Code: ExpiredToken; Request ID: 9F2A819C4)
    at com.amazonaws.http.AmazonHttpClient$RequestExecutor.handleErrorResponse(AmazonHttpClient.java:1879)
    at com.amazonaws.http.AmazonHttpClient$RequestExecutor.executeOneRequest(AmazonHttpClient.java:1372)
    at com.amazonaws.auth.AWSSessionCredentialsProvider.refresh(AWSSessionCredentialsProvider.java:88)
[WARN] AWS metadata token daemon refresh loop failed: connection reset by peer (169.254.169.254)`
  },
  {
    id: 'disk-full',
    name: 'Disk ENOSPC Storage Full',
    icon: HardDrive,
    title: 'Filesystem Inode & Block Exhaustion on /var/log Partition',
    service_name: 'analytics-aggregator',
    severity: 'CRITICAL',
    environment: 'production',
    description: 'Elasticsearch and filebeat ingest buffers crashed with No Space Left on Device.',
    logs: `[2026-09-27T13:40:11,891][ERROR][o.e.b.ElasticsearchUncaughtExceptionHandler] [node-01] fatal error in thread [elasticsearch[node-01][write]], exiting
java.io.IOException: No space left on device
    at java.io.FileOutputStream.writeBytes(Native Method)
[2026-09-27T13:40:12] Kernel: [ 8912.441] EXT4-fs error (device sda1): ext4_lookup: deleted inode referenced: 184912
[2026-09-27T13:40:13] Systemd: Failed to write journal log: ENOSPC`
  }
];

export const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [serviceName, setServiceName] = useState('checkout-worker');
  const [severity, setSeverity] = useState('CRITICAL');
  const [environment, setEnvironment] = useState('production');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [logText, setLogText] = useState('');

  const loadPreset = (preset: IncidentPreset) => {
    setTitle(preset.title);
    setServiceName(preset.service_name);
    setSeverity(preset.severity);
    setEnvironment(preset.environment);
    setIncidentDescription(preset.description);
    setLogText(preset.logs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;

    onSubmit({
      title: title.trim() || `Incident in ${serviceName}`,
      service_name: serviceName.trim() || 'system',
      severity,
      environment,
      incident_description: incidentDescription.trim(),
      log_text: logText.trim()
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Load Preset Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-nvidia" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instant SRE Incident Scenarios (1-Click Presets)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click to populate sample logs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700/80 hover:border-brand-500/50 text-slate-300 hover:text-white transition-all text-center group"
              >
                <Icon className="w-5 h-5 mb-1.5 text-slate-400 group-hover:text-brand-accent transition-colors" />
                <span className="text-[11px] font-medium line-clamp-1">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Incident Submission Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-dark-700 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-brand-500" />
              <span>Submit Incident & Server Logs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              NVIDIA Nemotron AI Agent will perform multi-hop causal root cause analysis and synthesize a tested fix.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PII & Secrets Auto-Masked</span>
          </div>
        </div>

        {/* Top Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Incident Headline / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., K8s Pod CrashLoopBackOff in payment-service"
              className="w-full px-3.5 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Service / Component
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., auth-service"
              required
              className="w-full px-3.5 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
            >
              <option value="production">Production (AWS/EKS)</option>
              <option value="staging">Staging (Cluster-02)</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        {/* Severity and Description Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Severity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => {
                const isSelected = severity === lvl;
                const colors = {
                  CRITICAL: isSelected ? 'bg-rose-600 text-white border-rose-500' : 'bg-dark-850 text-rose-400 border-rose-900/30 hover:border-rose-700',
                  HIGH: isSelected ? 'bg-amber-600 text-white border-amber-500' : 'bg-dark-850 text-amber-400 border-amber-900/30 hover:border-amber-700',
                  MEDIUM: isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-dark-850 text-blue-400 border-blue-900/30 hover:border-blue-700',
                  LOW: isSelected ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-dark-850 text-emerald-400 border-emerald-900/30 hover:border-emerald-700',
                };
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${colors[lvl]}`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observed Symptoms & User Context (Optional)
            </label>
            <input
              type="text"
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="e.g. Users receiving 504 Gateway Timeout during checkout promotion"
              className="w-full px-3.5 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Server Logs Paste Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-accent" />
              <span>Server Logs / Stack Trace / Diagnostic Output</span>
              <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {logText.length.toLocaleString()} / 30,000 chars
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-dark-700 bg-dark-950 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
            <div className="flex items-center justify-between px-3.5 py-2 bg-dark-900 border-b border-dark-800 text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-slate-400 text-[11px]">stdout / stderr stream</span>
              </div>
              <button
                type="button"
                onClick={() => setLogText('')}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              rows={9}
              required
              placeholder="Paste raw server logs, Kubernetes events, PostgreSQL errors, Nginx access/error logs, or Java/Node.js stack traces here..."
              className="w-full p-3.5 bg-transparent text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-y placeholder-slate-600"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-nvidia animate-pulse"></span>
            <span>Nebius Token Factory: NVIDIA Nemotron-3 Ultra Agent</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !logText.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:from-brand-500 hover:to-brand-accent shadow-glow-brand hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Orchestrating Nemotron Agent...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Hermes Agent Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
