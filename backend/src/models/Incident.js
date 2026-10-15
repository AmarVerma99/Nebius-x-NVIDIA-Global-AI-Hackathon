const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Incident {
  static create({
    user_id = null,
    title,
    service_name,
    severity = 'HIGH',
    status = 'ANALYZING',
    environment = 'production',
    log_text,
    incident_description = '',
    root_cause = null,
    confidence_score = 0.0,
    suggested_fix = null,
    fix_script = null,
    rollback_script = null,
    agent_reasoning_steps = null,
    model_used = 'nvidia/nemotron-3-ultra',
    alert_payload = null,
    sandbox_result = null,
    tavily_sources = null
  }) {
    const id = `INC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const stmt = db.prepare(`
      INSERT INTO incidents (
        id, user_id, title, service_name, severity, status, environment,
        log_text, incident_description, root_cause, confidence_score,
        suggested_fix, fix_script, rollback_script, agent_reasoning_steps,
        model_used, alert_payload, sandbox_result, tavily_sources, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      id,
      user_id,
      title,
      service_name,
      severity,
      status,
      environment,
      log_text,
      incident_description,
      typeof root_cause === 'object' && root_cause !== null ? JSON.stringify(root_cause) : root_cause,
      confidence_score,
      typeof suggested_fix === 'object' && suggested_fix !== null ? JSON.stringify(suggested_fix) : suggested_fix,
      fix_script,
      rollback_script,
      typeof agent_reasoning_steps === 'object' && agent_reasoning_steps !== null ? JSON.stringify(agent_reasoning_steps) : agent_reasoning_steps,
      model_used,
      typeof alert_payload === 'object' && alert_payload !== null ? JSON.stringify(alert_payload) : alert_payload,
      typeof sandbox_result === 'object' && sandbox_result !== null ? JSON.stringify(sandbox_result) : sandbox_result,
      typeof tavily_sources === 'object' && tavily_sources !== null ? JSON.stringify(tavily_sources) : tavily_sources
    );

    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM incidents WHERE id = ?');
    const incident = stmt.get(id);
    if (!incident) return null;
    return this.parseJSONFields(incident);
  }

  static findAll({ limit = 50, offset = 0, status, severity, service_name, search } = {}) {
    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (service_name) {
      query += ' AND service_name = ?';
      params.push(service_name);
    }
    if (search) {
      query += ' AND (title LIKE ? OR service_name LIKE ? OR log_text LIKE ? OR id LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(r => this.parseJSONFields(r));
  }

  static update(id, fields) {
    const validFields = [
      'title', 'service_name', 'severity', 'status', 'environment',
      'root_cause', 'confidence_score', 'suggested_fix', 'fix_script',
      'rollback_script', 'agent_reasoning_steps', 'model_used',
      'alert_payload', 'sandbox_result', 'tavily_sources'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (validFields.includes(key)) {
        updates.push(`${key} = ?`);
        if (typeof value === 'object' && value !== null) {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
      }
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = db.prepare(`UPDATE incidents SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM incidents WHERE id = ?');
    const res = stmt.run(id);
    return res.changes > 0;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM incidents');
    const total = totalStmt.get().count;

    const statusStmt = db.prepare('SELECT status, COUNT(*) as count FROM incidents GROUP BY status');
    const statusCounts = statusStmt.all();

    const severityStmt = db.prepare('SELECT severity, COUNT(*) as count FROM incidents GROUP BY severity');
    const severityCounts = severityStmt.all();

    const serviceStmt = db.prepare('SELECT service_name, COUNT(*) as count FROM incidents GROUP BY service_name ORDER BY count DESC LIMIT 5');
    const topServices = serviceStmt.all();

    const recentStmt = db.prepare('SELECT id, title, service_name, severity, status, created_at FROM incidents ORDER BY created_at DESC LIMIT 5');
    const recent = recentStmt.all();

    return {
      total,
      statusCounts: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr.count }), {}),
      severityCounts: severityCounts.reduce((acc, curr) => ({ ...acc, [curr.severity]: curr.count }), {}),
      topServices,
      recent
    };
  }

  static parseJSONFields(incident) {
    if (!incident) return null;
    const parsed = { ...incident };
    const jsonFields = ['root_cause', 'suggested_fix', 'agent_reasoning_steps', 'alert_payload', 'sandbox_result', 'tavily_sources'];
    for (const field of jsonFields) {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (e) {
          // keep as string if not valid JSON
        }
      }
    }
    return parsed;
  }
}

module.exports = Incident;
