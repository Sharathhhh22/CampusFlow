import crypto from 'node:crypto';
import { db } from '../config/db.js';

export const sessionRepository = {
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  },

  async create({ institution_id, class_id, subject_id, faculty_id, duration_minutes = 15 }) {
    const id = crypto.randomUUID();
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + duration_minutes * 60 * 1000);
    const sessionDate = startsAt.toISOString().split('T')[0];

    if (db.isPostgres()) {
      const { rows } = await db.query(
        `INSERT INTO attendance_sessions (id, institution_id, class_id, subject_id, faculty_id, session_date, starts_at, expires_at, status, token_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9)
         RETURNING *`,
        [id, institution_id, class_id, subject_id, faculty_id, sessionDate, startsAt.toISOString(), expiresAt.toISOString(), tokenHash]
      );
      return {
        ...rows[0],
        token // Returned only upon creation to construct QR code!
      };
    }

    const newSession = {
      id,
      institution_id,
      class_id,
      subject_id,
      faculty_id,
      session_date: sessionDate,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      token_hash: tokenHash,
      token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.getStore().attendance_sessions.push(newSession);
    return newSession;
  },

  async findById(id) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT s.*, c.name as class_name, c.section, sub.name as subject_name, sub.subject_code, p.full_name as faculty_name,
           (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as attendance_count
         FROM attendance_sessions s
         JOIN classes c ON s.class_id = c.id
         JOIN subjects sub ON s.subject_id = sub.id
         JOIN profiles p ON s.faculty_id = p.id
         WHERE s.id = $1`,
        [id]
      );
      return rows[0] || null;
    }

    const store = db.getStore();
    const s = store.attendance_sessions.find(x => x.id === id);
    if (!s) return null;
    const c = store.classes.find(x => x.id === s.class_id);
    const sub = store.subjects.find(x => x.id === s.subject_id);
    const p = store.profiles.find(x => x.id === s.faculty_id);
    const count = store.attendance_records.filter(r => r.session_id === s.id).length;

    return {
      ...s,
      class_name: c?.name || '',
      section: c?.section || '',
      subject_name: sub?.name || '',
      subject_code: sub?.subject_code || '',
      faculty_name: p?.full_name || '',
      attendance_count: count
    };
  },

  async closeSession(id, facultyId = null) {
    if (db.isPostgres()) {
      let query = "UPDATE attendance_sessions SET status = 'closed', updated_at = NOW() WHERE id = $1";
      const params = [id];
      if (facultyId) {
        query += " AND (faculty_id = $2 OR (SELECT role FROM profiles WHERE id = $2) = 'admin')";
        params.push(facultyId);
      }
      query += " RETURNING *";
      const { rows } = await db.query(query, params);
      return rows[0] || null;
    }

    const s = db.getStore().attendance_sessions.find(x => x.id === id);
    if (s) {
      s.status = 'closed';
      s.updated_at = new Date().toISOString();
    }
    return s;
  },

  async list(institutionId, { facultyId, classId, status } = {}) {
    if (db.isPostgres()) {
      let query = `
        SELECT s.*, c.name as class_name, c.section, sub.name as subject_name, sub.subject_code, p.full_name as faculty_name,
          (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as attendance_count
        FROM attendance_sessions s
        JOIN classes c ON s.class_id = c.id
        JOIN subjects sub ON s.subject_id = sub.id
        JOIN profiles p ON s.faculty_id = p.id
        WHERE s.institution_id = $1
      `;
      const params = [institutionId];
      let pIdx = 2;

      if (facultyId) {
        query += ` AND s.faculty_id = $${pIdx++}`;
        params.push(facultyId);
      }
      if (classId) {
        query += ` AND s.class_id = $${pIdx++}`;
        params.push(classId);
      }
      if (status) {
        query += ` AND s.status = $${pIdx++}`;
        params.push(status);
      }

      query += ' ORDER BY s.starts_at DESC';
      const { rows } = await db.query(query, params);
      return rows;
    }

    const store = db.getStore();
    return store.attendance_sessions
      .filter(s => {
        if (s.institution_id !== institutionId) return false;
        if (facultyId && s.faculty_id !== facultyId) return false;
        if (classId && s.class_id !== classId) return false;
        if (status && s.status !== status) return false;
        return true;
      })
      .map(s => {
        const c = store.classes.find(x => x.id === s.class_id);
        const sub = store.subjects.find(x => x.id === s.subject_id);
        const p = store.profiles.find(x => x.id === s.faculty_id);
        const count = store.attendance_records.filter(r => r.session_id === s.id).length;
        return {
          ...s,
          class_name: c?.name || '',
          section: c?.section || '',
          subject_name: sub?.name || '',
          subject_code: sub?.subject_code || '',
          faculty_name: p?.full_name || '',
          attendance_count: count
        };
      })
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  }
};

