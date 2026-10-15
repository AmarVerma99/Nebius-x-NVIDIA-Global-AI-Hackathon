require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const Incident = require('./models/Incident');
const alertService = require('./services/alertService');

const authRoutes = require('./routes/auth.routes');
const incidentRoutes = require('./routes/incidents.routes');
const agentRoutes = require('./routes/agent.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development, electron, or specified web origins
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for demo web previews
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use('/api/', apiLimiter);

// Health Check route (Phase 1 Requirement)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OpsCopilot Backend Agent Engine',
    ai_provider: 'Nebius Token Factory (NVIDIA Nemotron)',
    models_configured: {
      primary: process.env.NEBIUS_MODEL || 'nvidia/nemotron-3-ultra',
      escalation: process.env.NEBIUS_REASONING_MODEL || 'nvidia/nemotron-4-340b-instruct'
    },
    sandbox_mode: process.env.SANDBOX_MODE || 'simulated',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/agent', agentRoutes);

// Seed initial sample incidents if database is fresh
try {
  const existing = Incident.findAll({ limit: 1 });
  if (existing.length === 0) {
    const initialSamples = [
      {
        title: 'Kubernetes Container OOMKilled in payment-gateway-v2',
        service_name: 'payment-gateway',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        environment: 'production',
        log_text: `[2026-09-27T10:14:22.812Z] [ERROR] [cgroup-memory] Memory cgroup out of memory: Killed process 19284 (node) total-vm:1842048kB, anon-rss:524288kB, file-rss:0kB, shmem-rss:0kB\n[2026-09-27T10:14:23.001Z] [FATAL] Container payment-gateway-7f89b-x92zk exited with status 137 (OOMKilled)\n[2026-09-27T10:14:23.119Z] [WARN] k8s-node-04 kubelet: Back-off restarting failed container payment-gateway in pod payment-gateway-7f89b-x92zk`,
        incident_description: 'High payment traffic surge caused worker pods to crash with exit code 137.',
        confidence_score: 0.98,
        root_cause: {
          summary: 'Container memory limit of 512Mi was exceeded during concurrent webhook batch processing, causing the Linux cgroup killer to terminate the Node.js process.',
          primary_subsystem: 'Memory / Kubernetes Runtime',
          trigger_event: 'Traffic surge during 10:00 UTC promotion batch checkout',
          impact_assessment: '1,420 checkout attempts experienced 503 Service Unavailable'
        },
        suggested_fix: {
          summary: 'Patch Kubernetes deployment memory limit from 512Mi to 1.5Gi with requests at 768Mi.',
          estimated_downtime: '0s (rolling update)',
          risk_level: 'LOW',
          steps: ['Update manifest resource limits', 'Trigger rolling restart', 'Verify memory metrics']
        },
        fix_script: `kubectl patch deployment payment-gateway --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/resources/limits/memory", "value": "1536Mi"}]'\nkubectl rollout restart deployment/payment-gateway`,
        rollback_script: `kubectl rollout undo deployment/payment-gateway`,
        model_used: 'nvidia/nemotron-3-ultra'
      },
      {
        title: 'PostgreSQL Active Connection Saturation on orders-db',
        service_name: 'orders-database',
        severity: 'HIGH',
        status: 'FIX_RECOMMENDED',
        environment: 'production',
        log_text: `2026-09-27 11:22:04.102 UTC [32194] FATAL: remaining connection slots are reserved for non-replication superuser connections\n2026-09-27 11:22:04.105 UTC [32195] ERROR: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL: too many connections for role "order_service"\n2026-09-27 11:22:05.891 UTC [32201] WARNING: process 8841 still waiting for RowExclusiveLock on relation 16402 of database 16384 after 30000.123 ms`,
        incident_description: 'Checkout order submissions failing with database connection timeout errors.',
        confidence_score: 0.95,
        root_cause: {
          summary: 'Rogue transaction PID 8841 held exclusive table locks during an unindexed batch table scan, blocking 90+ client connection slots.',
          primary_subsystem: 'Database / PostgreSQL',
          trigger_event: 'Unindexed batch query on orders table',
          impact_assessment: 'Checkout API latency degraded to >30s with 40% query timeouts'
        },
        suggested_fix: {
          summary: 'Terminate blocking PID 8841 and set default session statement_timeout to 15 seconds.',
          estimated_downtime: '0s',
          risk_level: 'LOW',
          steps: ['Identify blocking PID via pg_stat_activity', 'Terminate backend session', 'Configure role timeout']
        },
        fix_script: `psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(8841);"\npsql "$DATABASE_URL" -c "ALTER ROLE order_service SET statement_timeout = '15000';"`,
        rollback_script: `psql "$DATABASE_URL" -c "ALTER ROLE order_service RESET statement_timeout;"`,
        model_used: 'nvidia/nemotron-3-ultra'
      }
    ];

    for (const sample of initialSamples) {
      const created = Incident.create(sample);
      const alertPayload = alertService.generateSlackAlert(created);
      Incident.update(created.id, { alert_payload: alertPayload });
    }
    console.log('[OpsCopilot DB] Initialized sample incidents successfully.');
  }
} catch (e) {
  console.warn('[OpsCopilot DB] Auto-seed note:', e.message);
}

// Serve static frontend in production if built
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 [OpsCopilot Backend] Server running on http://localhost:${PORT}`);
    console.log(`⚡ [AI Engine] Powered by Nebius Token Factory & NVIDIA Nemotron`);
    console.log(`🛡️  [Security] Sandbox Isolation & Rate Limiting ACTIVE`);
  });
}

module.exports = app;
