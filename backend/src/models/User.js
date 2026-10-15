const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class User {
  static create({ name, email, password_hash, role = 'sre_engineer' }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, email.toLowerCase().trim(), password_hash, role);
    return this.findById(id);
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase().trim());
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static count() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    return stmt.get().count;
  }
}

module.exports = User;
