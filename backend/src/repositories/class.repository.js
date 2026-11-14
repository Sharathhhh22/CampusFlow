import { db } from '../config/db.js';

export const classRepository = {
  async listByInstitution(institutionId, departmentId = null) {
    if (db.isPostgres()) {
      let query = `
        SELECT c.*, d.name as department_name, d.code as department_code,
          (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id) as enrolled_students_count
        FROM classes c
        JOIN departments d ON c.department_id = d.id
        WHERE c.institution_id = $1
      `;
      const params = [institutionId];
      if (departmentId) {
        query += ' AND c.department_id = $2';
        params.push(departmentId);
      }
      query += ' ORDER BY c.name ASC, c.section ASC';
      const { rows } = await db.query(query, params);
      return rows;
    }

    const store = db.getStore();
    return store.classes
      .filter(c => c.institution_id === institutionId && (!departmentId || c.department_id === departmentId))
      .map(c => {
        const dept = store.departments.find(d => d.id === c.department_id);
        const enrolledCount = store.enrollments.filter(e => e.class_id === c.id).length;
        return {
          ...c,
          department_name: dept?.name || '',
          department_code: dept?.code || '',
          enrolled_students_count: enrolledCount
        };
      });
  },

  async findById(id) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT c.*, d.name as department_name, d.code as department_code
         FROM classes c
         JOIN departments d ON c.department_id = d.id
         WHERE c.id = $1`,
        [id]
      );
      return rows[0] || null;
    }
    const store = db.getStore();
    const c = store.classes.find(x => x.id === id);
    if (!c) return null;
    const dept = store.departments.find(d => d.id === c.department_id);
    return { ...c, department_name: dept?.name, department_code: dept?.code };
  },

  async create({ institution_id, department_id, name, academic_year, semester, section }) {
    const id = crypto.randomUUID();
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `INSERT INTO classes (id, institution_id, department_id, name, academic_year, semester, section)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, institution_id, department_id, name, academic_year, semester, section]
      );
      return rows[0];
    }
    const newClass = {
      id,
      institution_id,
      department_id,
      name,
      academic_year,
      semester,
      section,
      created_at: new Date().toISOString()
    };
    db.getStore().classes.push(newClass);
    return newClass;
  },

  async listSubjectsByClass(classId) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT s.*, p.full_name as faculty_name
         FROM subjects s
         LEFT JOIN profiles p ON s.faculty_id = p.id
         WHERE s.class_id = $1
         ORDER BY s.name ASC`,
        [classId]
      );
      return rows;
    }
    const store = db.getStore();
    return store.subjects
      .filter(s => s.class_id === classId)
      .map(s => {
        const fac = store.profiles.find(p => p.id === s.faculty_id);
        return { ...s, faculty_name: fac?.full_name || 'Unassigned' };
      });
  },

  async listStudentClasses(studentId) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT c.*, d.name as department_name, d.code as department_code
         FROM enrollments e
         JOIN classes c ON e.class_id = c.id
         JOIN departments d ON c.department_id = d.id
         WHERE e.student_id = $1`,
        [studentId]
      );
      return rows;
    }
    const store = db.getStore();
    const enrolledClassIds = store.enrollments.filter(e => e.student_id === studentId).map(e => e.class_id);
    return store.classes.filter(c => enrolledClassIds.includes(c.id));
  }
};

