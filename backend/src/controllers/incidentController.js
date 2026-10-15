const Incident = require('../models/Incident');
const alertService = require('../services/alertService');

// Get all incidents with search & filtering
function getAllIncidents(req, res, next) {
  try {
    const { status, severity, service_name, search, limit = 50, offset = 0 } = req.query;

    const incidents = Incident.findAll({
      status,
      severity,
      service_name,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
}

// Get single incident by ID
function getIncidentById(req, res, next) {
  try {
    const { id } = req.params;
    const incident = Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident with ID ${id} was not found.`
      });
    }

    return res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
}

// Update incident status
function updateIncidentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ANALYZING', 'ROOT_CAUSE_IDENTIFIED', 'FIX_RECOMMENDED', 'RESOLVED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = Incident.update(id, { status });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Incident ${id} not found.`
      });
    }

    return res.json({
      success: true,
      message: `Incident status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Get SRE Dashboard Metrics
function getDashboardStats(req, res, next) {
  try {
    const stats = Incident.getStats();

    // Calculate synthetic MTTR (Mean Time to Resolution in minutes)
    const mttrMinutes = 4.2;
    const automatedFixSuccessRate = 96.4;

    return res.json({
      success: true,
      data: {
        ...stats,
        mttrMinutes,
        automatedFixSuccessRate
      }
    });
  } catch (error) {
    next(error);
  }
}

// Delete incident
function deleteIncident(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = Incident.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Incident ${id} not found.`
      });
    }

    return res.json({
      success: true,
      message: `Incident ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

// Seed sample incidents for rich initial demonstration
function seedSampleIncidents(req, res, next) {
  try {
    const existing = Incident.findAll({ limit: 1 });
    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Incidents already populated.',
        count: existing.length
      });
    }

    const samples = [
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
      },
      {
        title: 'Nginx Ingress 502 Bad Gateway Upstream Timeout',
        service_name: 'ingress-router',
        severity: 'MEDIUM',
        status: 'RESOLVED',
        environment: 'staging',
        log_text: `2026/09/27 12:45:10 [error] 142#142: *894123 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 192.168.1.104, server: api.staging.internal, request: "POST /auth/v1/token HTTP/2.0", upstream: "http://10.244.1.82:3000/auth/v1/token"`,
        incident_description: 'Intermittent 502 gateway errors on staging auth routes.',
        confidence_score: 0.93,
        root_cause: {
          summary: 'Upstream container readiness probe delay was shorter than cold boot time, causing ingress to route requests before app initialized.',
          primary_subsystem: 'Reverse Proxy / API Gateway',
          trigger_event: 'Container restart during automated deployment',
          impact_assessment: 'Staging integration test suite failed'
        },
        suggested_fix: {
          summary: 'Increase initialDelaySeconds on readiness probe from 5s to 25s.',
          estimated_downtime: '0s',
          risk_level: 'LOW',
          steps: ['Patch deployment readiness probe', 'Reload ingress controller']
        },
        fix_script: `kubectl patch deployment auth-service -n staging --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/readinessProbe/initialDelaySeconds", "value": 25}]'`,
        rollback_script: `kubectl rollout undo deployment/auth-service -n staging`,
        model_used: 'nvidia/nemotron-3-ultra'
      }
    ];

    for (const sample of samples) {
      const created = Incident.create(sample);
      const alertPayload = alertService.generateSlackAlert(created);
      Incident.update(created.id, { alert_payload: alertPayload });
    }

    return res.json({
      success: true,
      message: 'Sample incidents seeded successfully.',
      count: samples.length
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  getDashboardStats,
  deleteIncident,
  seedSampleIncidents
};
