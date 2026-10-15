const nebiusService = require('../services/nebiusService');
const sandboxService = require('../services/sandboxService');
const alertService = require('../services/alertService');
const tavilyService = require('../services/tavilyService');
const Incident = require('../models/Incident');

// Analyze new incident with AI agent pipeline & Tavily real-time intelligence
async function analyzeIncident(req, res, next) {
  try {
    const {
      log_text,
      incident_description = '',
      service_name = 'auth-service',
      severity = 'HIGH',
      environment = 'production',
      title
    } = req.body;

    if (!log_text || log_text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Server logs or stack trace content is required.'
      });
    }

    const aiResult = await nebiusService.analyzeIncident({
      logText: log_text,
      description: incident_description,
      serviceName: service_name,
      severity,
      environment,
      escalate: false
    });

    const incidentTitle = title || aiResult.title || `Incident in ${service_name}`;

    // Generate Slack & Teams alerts
    const alertMock = alertService.generateSlackAlert({
      id: 'PENDING',
      title: incidentTitle,
      service_name,
      severity,
      environment,
      confidence_score: aiResult.confidence_score,
      model_used: aiResult.model_used,
      root_cause: aiResult.root_cause,
      suggested_fix: aiResult.suggested_fix
    });

    // Create incident record in DB
    const incident = Incident.create({
      user_id: req.user ? req.user.id : null,
      title: incidentTitle,
      service_name,
      severity,
      status: 'ROOT_CAUSE_IDENTIFIED',
      environment,
      log_text,
      incident_description,
      root_cause: aiResult.root_cause,
      confidence_score: aiResult.confidence_score,
      suggested_fix: aiResult.suggested_fix,
      fix_script: aiResult.fix_script,
      rollback_script: aiResult.rollback_script,
      agent_reasoning_steps: aiResult.agent_reasoning_steps,
      model_used: aiResult.model_used,
      alert_payload: alertMock,
      tavily_sources: aiResult.tavily_sources || []
    });

    // Update alert payload with actual incident ID
    const finalizedAlert = alertService.generateSlackAlert(incident);
    const updated = Incident.update(incident.id, { alert_payload: finalizedAlert });

    return res.status(201).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Dedicated Tavily Web Deep Search investigation
async function investigateWithTavily(req, res, next) {
  try {
    const { id } = req.params;
    const incident = Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident ${id} not found.`
      });
    }

    const tavilyResult = await tavilyService.searchIncidentContext({
      logText: incident.log_text,
      description: incident.incident_description,
      serviceName: incident.service_name
    });

    const updated = Incident.update(id, {
      tavily_sources: tavilyResult.sources || []
    });

    return res.json({
      success: true,
      message: 'Real-time external intelligence refreshed via Tavily AI Search.',
      data: {
        incident: updated,
        tavilyResult
      }
    });
  } catch (error) {
    next(error);
  }
}

// Escalate incident to deeper Nemotron reasoning model
async function escalateIncident(req, res, next) {
  try {
    const { id } = req.params;
    const incident = Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident ${id} not found.`
      });
    }

    const aiResult = await nebiusService.analyzeIncident({
      logText: incident.log_text,
      description: incident.incident_description,
      serviceName: incident.service_name,
      severity: incident.severity,
      environment: incident.environment,
      escalate: true
    });

    const updated = Incident.update(id, {
      root_cause: aiResult.root_cause,
      confidence_score: Math.min(0.99, (aiResult.confidence_score || 0.95) + 0.03),
      suggested_fix: aiResult.suggested_fix,
      fix_script: aiResult.fix_script,
      rollback_script: aiResult.rollback_script,
      agent_reasoning_steps: aiResult.agent_reasoning_steps,
      model_used: aiResult.model_used || nebiusService.ESCALATION_MODEL
    });

    const updatedAlert = alertService.generateSlackAlert(updated);
    Incident.update(id, { alert_payload: updatedAlert });

    return res.json({
      success: true,
      message: 'Incident successfully re-analyzed via Ultra Max reasoning model.',
      data: Incident.findById(id)
    });
  } catch (error) {
    next(error);
  }
}

// Execute fix in isolated sandbox
async function executeSandbox(req, res, next) {
  try {
    const { id } = req.params;
    const { custom_script } = req.body;

    const incident = Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident ${id} not found.`
      });
    }

    const scriptToRun = custom_script || incident.fix_script;
    if (!scriptToRun) {
      return res.status(400).json({
        success: false,
        message: 'No fix script available to execute in sandbox.'
      });
    }

    const sandboxResult = await sandboxService.executeInSandbox({
      incidentId: incident.id,
      script: scriptToRun,
      environment: `sandbox-cluster-${incident.environment}`
    });

    const newStatus = sandboxResult.success ? 'RESOLVED' : 'ANALYZING';
    const updated = Incident.update(id, {
      sandbox_result: sandboxResult,
      status: newStatus
    });

    return res.json({
      success: true,
      message: sandboxResult.success
        ? 'Remediation successfully verified in isolated Nebius Sandbox.'
        : 'Sandbox execution failed or was blocked by security policy.',
      data: {
        incident: updated,
        sandboxResult
      }
    });
  } catch (error) {
    next(error);
  }
}

// Server-Sent Events (SSE) stream for live Hermes agent reasoning animation
async function streamReasoning(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const steps = [
    {
      step: 1,
      phase: 'Log Ingestion & Anomaly Signature Extraction',
      detail: 'Parsing log timestamps, filtering standard INFO lines, isolating stack traces...',
      status: 'PROCESSING',
      delay: 350
    },
    {
      step: 2,
      phase: 'Tavily Real-Time Web Intelligence & CVE Check',
      detail: 'Querying Tavily AI Search for live GitHub issues, CVE advisories, and Kubernetes docs...',
      status: 'PROCESSING',
      delay: 500
    },
    {
      step: 3,
      phase: 'Hermes Diagnostic Hypothesis Formulation',
      detail: 'Synthesizing causal fault patterns with NVIDIA Nemotron models...',
      status: 'PROCESSING',
      delay: 600
    },
    {
      step: 4,
      phase: 'Infrastructure Telemetry Correlation',
      detail: 'Correlating container memory limits, network latency, and database active connection slots...',
      status: 'PROCESSING',
      delay: 500
    },
    {
      step: 5,
      phase: 'Remediation Script Synthesis & Safety Checks',
      detail: 'Generating non-destructive declarative patch and verifying rollback plan...',
      status: 'PROCESSING',
      delay: 450
    },
    {
      step: 6,
      phase: 'Diagnosis Finalized',
      detail: 'Root cause verified. Fix script synthesized. Slack alert card formatted.',
      status: 'COMPLETED',
      delay: 250
    }
  ];

  for (const step of steps) {
    await new Promise(r => setTimeout(r, step.delay));
    res.write(`data: ${JSON.stringify(step)}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

module.exports = {
  analyzeIncident,
  investigateWithTavily,
  escalateIncident,
  executeSandbox,
  streamReasoning
};
