const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('./')
  ? path.join(__dirname, '../..', process.env.DATABASE_URL)
  : path.join(dbDir, 'opscopilot.db');

const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'sre_engineer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      service_name TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'HIGH',
      status TEXT NOT NULL DEFAULT 'ANALYZING',
      environment TEXT NOT NULL DEFAULT 'production',
      log_text TEXT NOT NULL,
      incident_description TEXT,
      root_cause TEXT,
      confidence_score REAL DEFAULT 0.0,
      suggested_fix TEXT,
      fix_script TEXT,
      rollback_script TEXT,
      agent_reasoning_steps TEXT,
      model_used TEXT DEFAULT 'nvidia/nemotron-3-ultra',
      alert_payload TEXT,
      sandbox_result TEXT,
      tavily_sources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
    CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service_name);
  `);

  // Safe schema migration for existing databases
  try {
    db.exec(`ALTER TABLE incidents ADD COLUMN tavily_sources TEXT;`);
  } catch (e) {
    // Column already exists, ignore
  }
}

initializeDatabase();

module.exports = db;
