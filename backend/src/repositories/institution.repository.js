import { db } from '../config/db.js';

export const institutionRepository = {
  async findById(id) {
    if (db.isPostgres()) {
      const { rows } = await db.query('SELECT * FROM institutions WHERE id = $1', [id]);
      return rows[0] || null;
    }
    return db.getStore().institutions.find(i => i.id === id) || null;
  },

  async findBySlug(slug) {
    if (db.isPostgres()) {
      const { rows } = await db.query('SELECT * FROM institutions WHERE slug = $1', [slug]);
      return rows[0] || null;
    }
    return db.getStore().institutions.find(i => i.slug === slug) || null;
  },

  async listAll() {
    if (db.isPostgres()) {
      const { rows } = await db.query('SELECT * FROM institutions ORDER BY name ASC');
      return rows;
    }
    return db.getStore().institutions;
  },

  async listDepartments(institutionId) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        'SELECT * FROM departments WHERE institution_id = $1 ORDER BY name ASC',
        [institutionId]
      );
      return rows;
    }
    return db.getStore().departments.filter(d => d.institution_id === institutionId);
  }
};

