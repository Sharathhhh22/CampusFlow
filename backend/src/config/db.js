import pg from 'pg';
import { env } from './env.js';

let pool = null;

if (env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected database error on idle client:', err.message);
  });
}

// In-Memory Fallback Store for standalone local demo / testing without PostgreSQL connection
const inMemoryStore = {
  institutions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Apex Institute of Engineering & Technology',
      slug: 'apex-tech',
      created_at: new Date().toISOString()
    }
  ],
  departments: [
    {
      id: '22222222-2222-2222-2222-222222222221',
      institution_id: '11111111-1111-1111-1111-111111111111',
      name: 'Computer Science and Engineering',
      code: 'CSE',
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      institution_id: '11111111-1111-1111-1111-111111111111',
      name: 'Electronics and Communication',
      code: 'ECE',
      created_at: new Date().toISOString()
    }
  ],
  profiles: [
    {
      id: '33333333-3333-3333-3333-333333333331',
      institution_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Dr. Sarah Jenkins',
      email: 'admin@apex.edu',
      role: 'admin',
      department_id: '22222222-2222-2222-2222-222222222221',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      institution_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Prof. Marcus Vance',
      email: 'faculty@apex.edu',
      role: 'faculty',
      department_id: '22222222-2222-2222-2222-222222222221',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      institution_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Alex Rivera',
      email: 'student@apex.edu',
      role: 'student',
      department_id: '22222222-2222-2222-2222-222222222221',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333334',
      institution_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Priya Sharma',
      email: 'priya@apex.edu',
      role: 'student',
      department_id: '22222222-2222-2222-2222-222222222221',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333335',
      institution_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Jordan Lee',
      email: 'jordan@apex.edu',
      role: 'student',
      department_id: '22222222-2222-2222-2222-222222222221',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  classes: [
    {
      id: '44444444-4444-4444-4444-444444444441',
      institution_id: '11111111-1111-1111-1111-111111111111',
      department_id: '22222222-2222-2222-2222-222222222221',
      name: 'B.Tech CSE Year 3',
      academic_year: '2025-2026',
      semester: 'Semester 6',
      section: 'Section A',
      created_at: new Date().toISOString()
    }
  ],
  subjects: [
    {
      id: '55555555-5555-5555-5555-555555555551',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      name: 'Distributed Systems & Cloud Computing',
      subject_code: 'CS601',
      faculty_id: '33333333-3333-3333-3333-333333333332',
      created_at: new Date().toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555552',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      name: 'Database Systems Engineering',
      subject_code: 'CS602',
      faculty_id: '33333333-3333-3333-3333-333333333332',
      created_at: new Date().toISOString()
    }
  ],
  enrollments: [
    {
      id: '66666666-6666-6666-6666-666666666661',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      student_id: '33333333-3333-3333-3333-333333333333',
      created_at: new Date().toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      student_id: '33333333-3333-3333-3333-333333333334',
      created_at: new Date().toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      student_id: '33333333-3333-3333-3333-333333333335',
      created_at: new Date().toISOString()
    }
  ],
  attendance_sessions: [
    {
      id: '77777777-7777-7777-7777-777777777771',
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      subject_id: '55555555-5555-5555-5555-555555555551',
      faculty_id: '33333333-3333-3333-3333-333333333332',
      session_date: new Date().toISOString().split('T')[0],
      starts_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'active',
      token_hash: 'demo_token_hash_cs601',
      token: 'DEMO-TOKEN-2026',
      created_at: new Date().toISOString()
    }
  ],
  attendance_events: [],
  attendance_records: [
    {
      id: '88888888-8888-8888-8888-888888888881',
      institution_id: '11111111-1111-1111-1111-111111111111',
      session_id: '77777777-7777-7777-7777-777777777771',
      student_id: '33333333-3333-3333-3333-333333333334',
      attendance_status: 'present',
      recorded_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      source: 'campusflow_qr',
      created_at: new Date().toISOString()
    }
  ],
  verification_cases: [
    {
      id: '99999999-9999-9999-9999-999999999991',
      institution_id: '11111111-1111-1111-1111-111111111111',
      student_id: '33333333-3333-3333-3333-333333333333',
      session_id: '77777777-7777-7777-7777-777777777771',
      case_type: 'attendance_recovery',
      issue_category: 'network_failure',
      description: 'Campus Wi-Fi disconnected abruptly while submitting the QR scan in Room 402 at 10:14 AM.',
      reported_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'pending_faculty_review',
      priority: 'medium',
      created_at: new Date().toISOString()
    }
  ],
  evidence_records: [
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      institution_id: '11111111-1111-1111-1111-111111111111',
      case_id: '99999999-9999-9999-9999-999999999991',
      evidence_type: 'Session Timestamps',
      source_type: 'database_record',
      source_record_id: '77777777-7777-7777-7777-777777777771',
      description: 'Session was active and accepting check-ins at student-reported timestamp.',
      verification_status: 'verified',
      created_at: new Date().toISOString()
    }
  ],
  agent_runs: [],
  faculty_decisions: [],
  audit_logs: []
};

export const db = {
  isPostgres: () => !!pool,
  
  async query(text, params = []) {
    if (pool) {
      return pool.query(text, params);
    }
    // Return empty or fallback results if pool is unavailable
    return { rows: [], rowCount: 0 };
  },

  getStore() {
    return inMemoryStore;
  }
};

