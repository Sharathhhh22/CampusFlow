import { db } from '../config/db.js';

export const profileRepository = {
  async findById(id) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT p.*, d.name as department_name, d.code as department_code, i.name as institution_name
         FROM profiles p
         LEFT JOIN departments d ON p.department_id = d.id
         LEFT JOIN institutions i ON p.institution_id = i.id
         WHERE p.id = $1`,
        [id]
      );
      return rows[0] || null;
    }
    const store = db.getStore();
    const p = store.profiles.find(x => x.id === id);
    if (!p) return null;
    const dept = store.departments.find(d => d.id === p.department_id);
    const inst = store.institutions.find(i => i.id === p.institution_id);
    return {
      ...p,
      department_name: dept?.name || null,
      department_code: dept?.code || null,
      institution_name: inst?.name || null
    };
  },

  async findByEmail(email) {
    if (db.isPostgres()) {
      const { rows } = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
      return rows[0] || null;
    }
    return db.getStore().profiles.find(p => p.email === email) || null;
  },

  async create({ id, institution_id, full_name, email, role = 'student', department_id = null }) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `INSERT INTO profiles (id, institution_id, full_name, email, role, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING *`,
        [id, institution_id, full_name, email, role, department_id]
      );
      return rows[0];
    }
    const newProfile = {
      id,
      institution_id,
      full_name,
      email,
      role,
      department_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.getStore().profiles.push(newProfile);
    return newProfile;
  },

  async updateRole(id, role) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [role, id]
      );
      return rows[0];
    }
    const p = db.getStore().profiles.find(x => x.id === id);
    if (p) {
      p.role = role;
      p.updated_at = new Date().toISOString();
    }
    return p;
  },

  async listByInstitution(institutionId, role = null) {
    if (db.isPostgres()) {
      let query = 'SELECT p.*, d.name as department_name FROM profiles p LEFT JOIN departments d ON p.department_id = d.id WHERE p.institution_id = $1';
      const params = [institutionId];
      if (role) {
        query += ' AND p.role = $2';
        params.push(role);
      }
      query += ' ORDER BY p.full_name ASC';
      const { rows } = await db.query(query, params);
      return rows;
    }
    let list = db.getStore().profiles.filter(p => p.institution_id === institutionId);
    if (role) list = list.filter(p => p.role === role);
    return list;
  }
};

