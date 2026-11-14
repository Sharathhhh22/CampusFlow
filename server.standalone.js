import http from 'node:http';
import crypto from 'node:crypto';
import url from 'node:url';

// -------------------------------------------------------------
// IN-MEMORY SEED DATA & STATE
// -------------------------------------------------------------
const INSTITUTION = {
  id: 'inst-apex-01',
  name: 'Apex Institute of Technology',
  code: 'APEX',
  slug: 'apex-tech'
};

let USERS = [
  { id: 'usr-student-01', role: 'student', full_name: 'Alex Rivera', name: 'Alex Rivera', email: 'alex.rivera@apex.edu', reg_number: '21BCE1042', institution_id: 'inst-apex-01', institution_name: 'Apex Institute of Technology', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'usr-faculty-01', role: 'faculty', full_name: 'Prof. Marcus Vance', name: 'Prof. Marcus Vance', email: 'prof.vance@apex.edu', department: 'Computer Science & Engineering', institution_id: 'inst-apex-01', institution_name: 'Apex Institute of Technology', created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: 'usr-admin-01', role: 'admin', full_name: 'Dr. Sarah Jenkins', name: 'Dr. Sarah Jenkins', email: 'admin.jenkins@apex.edu', title: 'Dean of Academic Affairs', institution_id: 'inst-apex-01', institution_name: 'Apex Institute of Technology', created_at: new Date(Date.now() - 90 * 86400000).toISOString() }
];

let CLASSES = [
  { id: 'cls-cs301', code: 'CS-301', name: 'Algorithms & Data Structures', faculty_id: 'usr-faculty-01', semester: 5, enrolled_count: 64, room: 'Hall B-204' },
  { id: 'cls-cs302', code: 'CS-302', name: 'Distributed Systems & Cloud', faculty_id: 'usr-faculty-01', semester: 5, enrolled_count: 58, room: 'Lab 3' },
  { id: 'cls-cs303', code: 'CS-303', name: 'Database Management Systems', faculty_id: 'usr-faculty-01', semester: 4, enrolled_count: 62, room: 'Hall A-101' }
];

let SESSIONS = [
  {
    id: 'ses-101',
    class_id: 'cls-cs301',
    classId: 'cls-cs301',
    className: 'Algorithms & Data Structures (CS-301)',
    faculty_id: 'usr-faculty-01',
    facultyId: 'usr-faculty-01',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    startTime: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() - 2700000).toISOString(),
    expiresAt: new Date(Date.now() - 2700000).toISOString(),
    status: 'closed',
    tokenHash: crypto.createHash('sha256').update('DEMO_TOKEN_101').digest('hex'),
    rawToken: 'DEMO_TOKEN_101',
    totalAttended: 59,
    room: 'Hall B-204'
  },
  {
    id: 'ses-102',
    class_id: 'cls-cs301',
    classId: 'cls-cs301',
    className: 'Algorithms & Data Structures (CS-301)',
    faculty_id: 'usr-faculty-01',
    facultyId: 'usr-faculty-01',
    start_time: new Date(Date.now() - 600000).toISOString(),
    startTime: new Date(Date.now() - 600000).toISOString(),
    expires_at: new Date(Date.now() + 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    status: 'active',
    tokenHash: crypto.createHash('sha256').update('ACTIVE_TOKEN_CS301').digest('hex'),
    rawToken: 'ACTIVE_TOKEN_CS301',
    totalAttended: 42,
    room: 'Hall B-204'
  }
];

let ATTENDANCE_RECORDS = [
  { id: 'att-01', session_id: 'ses-101', sessionId: 'ses-101', student_id: 'usr-student-01', studentId: 'usr-student-01', studentName: 'Alex Rivera', timestamp: new Date(Date.now() - 3400000).toISOString(), status: 'present', method: 'qr_scan', class_name: 'CS-301: Algorithms & Data Structures' },
  { id: 'att-02', session_id: 'ses-101', sessionId: 'ses-101', student_id: 'usr-student-02', studentId: 'usr-student-02', studentName: 'Maya Patel', timestamp: new Date(Date.now() - 3410000).toISOString(), status: 'present', method: 'qr_scan', class_name: 'CS-301: Algorithms & Data Structures' },
  { id: 'att-03', session_id: 'ses-101', sessionId: 'ses-101', student_id: 'usr-student-03', studentId: 'usr-student-03', studentName: 'Jordan Smith', timestamp: new Date(Date.now() - 3390000).toISOString(), status: 'present', method: 'qr_scan', class_name: 'CS-301: Algorithms & Data Structures' }
];

let CASES = [
  {
    id: 'rec-001',
    caseNumber: 'CF-2026-0842',
    case_number: 'CF-2026-0842',
    student_id: 'usr-student-01',
    studentId: 'usr-student-01',
    studentName: 'Alex Rivera',
    studentReg: '21BCE1042',
    class_id: 'cls-cs301',
    classId: 'cls-cs301',
    className: 'CS-301: Algorithms & Data Structures',
    session_id: 'ses-101',
    sessionId: 'ses-101',
    category: 'camera_failure',
    categoryLabel: 'Camera / QR Scanner Glitch',
    status: 'pending_faculty_review',
    systemType: 'campusflow_internal',
    description: 'My phone camera froze while attempting to focus on the dynamic QR code during the session. By the time I rebooted the browser tab, the 5-minute scanner window had expired.',
    occurrence_time: new Date(Date.now() - 3500000).toISOString(),
    occurrenceTime: new Date(Date.now() - 3500000).toISOString(),
    created_at: new Date(Date.now() - 3450000).toISOString(),
    createdAt: new Date(Date.now() - 3450000).toISOString(),
    aiDossier: {
      integrityRisk: 'low',
      integrityExplanation: 'No concurrent submissions detected for this student credential across other terminals or locations. Zero duplicate scan attempts.',
      recoveryFindings: 'Session ses-101 was verified as ACTIVE at reported incident time (10:15 AM). 48 concurrent students successfully scanned during the same 3-minute window without systemic AP failure.',
      evidenceTimeline: [
        { time: '10:14:20 AM', type: 'system', event: 'QR Attendance Session ses-101 opened by Prof. Marcus Vance' },
        { time: '10:15:05 AM', type: 'student_claim', event: 'Student attempted scan; reported camera module freeze and browser reload' },
        { time: '10:18:40 AM', type: 'system', event: 'Session ses-101 expired and closed after 5-minute duration' },
        { time: '10:19:12 AM', type: 'system', event: 'Recovery ticket CF-2026-0842 generated with device telemetry' }
      ],
      coordinatorRecommendation: 'Recommend FACULTY APPROVAL. Student has 94% historical attendance and arrived prior to session closure. Camera freeze is consistent with browser WebRTC crash logs.'
    },
    decision: null
  },
  {
    id: 'rec-002',
    caseNumber: 'CF-2026-0843',
    case_number: 'CF-2026-0843',
    student_id: 'usr-student-01',
    studentId: 'usr-student-01',
    studentName: 'Alex Rivera',
    studentReg: '21BCE1042',
    class_id: 'cls-cs302',
    classId: 'cls-cs302',
    className: 'CS-302: Distributed Systems',
    session_id: null,
    sessionId: null,
    category: 'external_system_unverified',
    categoryLabel: 'Unverified External College Report',
    status: 'under_investigation',
    systemType: 'external_unverified',
    description: 'Reported scan failure in external college attendance portal. Terminal displayed connection timeout error.',
    occurrence_time: new Date(Date.now() - 86400000).toISOString(),
    occurrenceTime: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86000000).toISOString(),
    createdAt: new Date(Date.now() - 86000000).toISOString(),
    aiDossier: {
      integrityRisk: 'unknown',
      integrityExplanation: 'Record originates outside CampusFlow. Marked explicitly as UNVERIFIED EXTERNAL REPORT.',
      recoveryFindings: 'CampusFlow holds no direct database integration with external portal per architectural boundary. Manual faculty verification required.',
      evidenceTimeline: [
        { time: 'Yesterday 02:00 PM', type: 'student_claim', event: 'Student reports external scanning error' },
        { time: 'Yesterday 02:05 PM', type: 'system', event: 'Logged as unverified external claim. No NIAT credentials requested or accessed.' }
      ],
      coordinatorRecommendation: 'FLAGGED FOR FACULTY VERIFICATION. CampusFlow does not verify external records automatically.'
    },
    decision: null
  }
];

let DECISIONS = [];
let AUDIT_LOGS = [
  { id: 'aud-01', action: 'system_initialized', actor_id: 'usr-admin-01', created_at: new Date().toISOString() }
];

let AGENT_RUNS = [
  { id: 'run-101', agentName: 'CoordinatorAgent', caseId: 'rec-001', durationMs: 1240, status: 'completed', steps: 4, timestamp: new Date(Date.now() - 3440000).toISOString() },
  { id: 'run-102', agentName: 'IntegrityAgent', caseId: 'rec-001', durationMs: 650, status: 'completed', riskAssigned: 'low', timestamp: new Date(Date.now() - 3445000).toISOString() },
  { id: 'run-103', agentName: 'RecoveryAgent', caseId: 'rec-001', durationMs: 820, status: 'completed', findings: 'Session valid', timestamp: new Date(Date.now() - 3443000).toISOString() },
  { id: 'run-104', agentName: 'EvidenceAgent', caseId: 'rec-001', durationMs: 740, status: 'completed', itemsOrganized: 4, timestamp: new Date(Date.now() - 3441000).toISOString() }
];

let EVENTS = [
  {
    id: 'evt-001',
    title: 'Apex InnoHacks 2026: Campus Smart Hackathon',
    short_description: '36-hour national level hackathon focused on Agentic AI, Smart IoT campuses, and sustainable green computing with ₹1,50,000 in prizes.',
    description: 'Apex InnoHacks 2026 brings together the brightest student minds to engineer real-world software & IoT solutions. Track categories include Multi-Agent Autonomous Systems, Decentralized Campus Credentials, and Clean Energy Smart Grids.',
    category: 'hackathon',
    organizer: 'Department of Computer Science & Engineering',
    organizing_department: 'Computer Science & Engineering',
    faculty_coordinator: 'Prof. Marcus Vance',
    student_coordinator: 'Rohan Sharma (Lead GDG)',
    venue: 'Auditorium Hall 1 & Advanced Computing Lab',
    mode: 'offline',
    start_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    registration_deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    capacity: 150,
    registered_count: 118,
    min_team_size: 2,
    max_team_size: 4,
    is_published: true,
    status: 'published',
    cover_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    prizes: '1st Prize: ₹75,000 + Cloud Credits | 2nd Prize: ₹45,000 | 3rd Prize: ₹30,000',
    rules: 'All code must be written during the hackathon.'
  },
  {
    id: 'evt-002',
    title: 'Hands-on Agentic AI & LLM Orchestration Workshop',
    short_description: 'Master LangGraph, Google Gemini API, and autonomous multi-agent tool execution in a comprehensive 2-day hands-on bootcamp.',
    description: 'Deep dive into architecting resilient agent swarms, memory systems, and deterministic tool execution pipelines.',
    category: 'workshop',
    organizer: 'AI & Data Science Student Council',
    organizing_department: 'Artificial Intelligence & Machine Learning',
    faculty_coordinator: 'Dr. Elena Rostova',
    student_coordinator: 'Priya Sundaram',
    venue: 'Turing Computing Lab 402',
    mode: 'hybrid',
    start_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    registration_deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    capacity: 60,
    registered_count: 54,
    min_team_size: 1,
    max_team_size: 1,
    is_published: true,
    status: 'published',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    prizes: 'Certificate of Excellence + Google Cloud $100 Credits'
  }
];

let EVENT_REGISTRATIONS = [
  {
    id: 'reg-001',
    event_id: 'evt-001',
    user_id: 'usr-student-01',
    status: 'confirmed',
    registration_type: 'team',
    team_name: 'VectorZero',
    team_members: ['Alex Rivera (alex.rivera@apex.edu)', 'Maya Patel (maya.p@apex.edu)'],
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

let CLASSROOMS = [
  { id: 'rm-101', code: 'A-101', name: 'Lecture Hall A-101', building: 'Engineering Block A', floor: 1, capacity: 80, type: 'lecture_hall', status: 'available', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, power_load_kw: 3.4, temperature_c: 22.4, current_occupancy: 0 },
  { id: 'rm-204', code: 'B-204', name: 'Hall B-204', building: 'Science & Computing Block B', floor: 2, capacity: 70, type: 'lecture_hall', status: 'occupied', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: false, current_course: 'CS-301: Algorithms & Data Structures', current_faculty: 'Prof. Marcus Vance', power_load_kw: 4.8, temperature_c: 23.8, current_occupancy: 64 },
  { id: 'rm-302', code: 'B-302', name: 'AI & GPU Research Lab', building: 'Science & Computing Block B', floor: 3, capacity: 45, type: 'computing_lab', status: 'occupied', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, current_course: 'CS-302: Distributed Systems & Cloud', current_faculty: 'Dr. Elena Rostova', power_load_kw: 12.2, temperature_c: 20.1, current_occupancy: 42 }
];

let NOTICES = [
  {
    id: 'ntc-001',
    title: 'Mid-Semester Examinations Schedule & Seating Allotment Fall 2026',
    category: 'academic',
    urgency: 'high',
    target_audience: 'all_students',
    department: 'Controller of Examinations',
    publish_date: new Date(Date.now() - 48 * 3600000).toISOString(),
    summary: '• Mid-Semester examinations commence on November 24, 2026 across two daily slots.\n• Hall tickets verified with biometrics/QR scanning at entrance doors.\n• Students with attendance below 75% must resolve pending recovery dossiers before Nov 20.',
    action_items: [
      'Download and print hall ticket before Nov 20, 2026',
      'Verify room allocation 24 hours prior to first exam'
    ],
    deadlines: [
      { item: 'Hall Ticket Verification Window Closes', date: '2026-11-20T17:00:00Z' }
    ]
  }
];

let GRIEVANCES = [
  {
    id: 'grv-001',
    ticket_number: 'GRV-2026-042',
    student_id: 'usr-student-01',
    student_name: 'Alex Rivera',
    category: 'infrastructure',
    title: 'Projector HDMI flickering continuously in Hall B-204',
    description: 'The ceiling projector cuts out during slides, making data structures code walkthroughs difficult to see.',
    department_assigned: 'Campus Facilities & IT Services',
    urgency: 'medium',
    status: 'in_progress',
    sla_hours: 24,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    resolution_notes: 'Technician dispatched at 1:30 PM. High-speed 4K fiber HDMI cable replacement scheduled.'
  }
];

let LOST_FOUND = [
  {
    id: 'lf-001',
    type: 'found',
    title: 'Lenovo ThinkPad 65W USB-C Charger',
    description: 'Black AC adapter left plugged into wall socket next to desk #14 in Computing Lab 3.',
    location_found: 'Science Block B, Computing Lab 3',
    reported_by: 'Campus Security Desk (Officer Balan)',
    reported_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    status: 'available_for_claim',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    ai_tags: ['charger', 'usb-c', 'lenovo', 'black']
  }
];

let ORCHESTRATOR_TASKS = [
  {
    id: 'orch-task-101',
    title: 'Faculty Absence Schedule Reallocation',
    trigger_event: 'Prof. Marcus Vance logged medical emergency for CS-301 (10:00 AM)',
    status: 'pending_approval',
    requires_admin_approval: true,
    urgency: 'high',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    agents_involved: ['Timetable Agent', 'Resource Agent', 'Notification Agent'],
    summary: 'Timetable conflict detected. Proxy faculty Dr. Sarah Jenkins identified; Hall B-204 confirmed available. Ready to notify 64 enrolled students upon Dean authorization.',
    steps: [
      { agent: 'Timetable Agent', action: 'Detected unstaffed session CS-301 at 10:00 AM', status: 'completed' },
      { agent: 'Resource Agent', action: 'Verified Hall B-204 is clear of conflicting bookings', status: 'completed' },
      { agent: 'Timetable Agent', action: 'Selected qualified proxy faculty Dr. Sarah Jenkins', status: 'completed' },
      { agent: 'Autonomous Orchestrator', action: 'Generated human-in-the-loop approval ticket for Administrator', status: 'waiting_for_approval' },
      { agent: 'Notification Agent', action: 'Standby: Send push alerts & SMS to 64 enrolled students', status: 'queued' }
    ],
    proposed_action: {
      course: 'CS-301: Algorithms & Data Structures',
      original_faculty: 'Prof. Marcus Vance',
      proxy_faculty: 'Dr. Sarah Jenkins',
      room: 'Hall B-204',
      time: 'Today, 10:00 AM - 11:30 AM',
      notification_target: '64 Students Enrolled in Section A'
    }
  }
];

let TIMETABLES = [
  { id: 'tt-1', day: 'Monday', time: '09:00 - 10:30', course_code: 'CS-301', course_name: 'Algorithms & Data Structures', room: 'Hall B-204', faculty: 'Prof. Marcus Vance', type: 'Lecture' },
  { id: 'tt-2', day: 'Monday', time: '11:00 - 12:30', course_code: 'CS-302', course_name: 'Distributed Systems & Cloud', room: 'Lab 3', faculty: 'Prof. Marcus Vance', type: 'Lab' }
];

let ASSIGNMENTS = [
  { id: 'asg-01', course_code: 'CS-301', title: 'Dynamic Programming & Graph Traversal Implementation', due_date: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'pending', max_marks: 50 },
  { id: 'asg-02', course_code: 'CS-302', title: 'Kubernetes Cluster Deployment on GCP', due_date: new Date(Date.now() + 96 * 3600000).toISOString(), status: 'submitted', max_marks: 30 }
];

// Helper: send JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-role'
  });
  res.end(JSON.stringify(data));
}

// -------------------------------------------------------------
// 1. BACKEND REST API SERVER (PORT 5000)
// -------------------------------------------------------------
const apiServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-role'
    });
    return res.end();
  }

  // Collect request body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload = {};
    if (body) {
      try { payload = JSON.parse(body); } catch (e) {}
    }

    // ---------------------------------------------------------
    // AUTH ROUTER
    // ---------------------------------------------------------

    // 1. POST /api/v1/auth/register
    if (path === '/api/v1/auth/register' && method === 'POST') {
      const { full_name, email, password } = payload;
      if (!email || !full_name) {
        return sendJSON(res, 400, { success: false, message: 'Full name and email are required.' });
      }

      // Check if user already exists
      let user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        return sendJSON(res, 409, { success: false, message: 'An account with this email address already exists.' });
      }

      const newUser = {
        id: 'usr-' + Date.now(),
        role: 'student', // Public registration strictly student role
        full_name,
        name: full_name,
        email,
        reg_number: '21BCE' + Math.floor(1000 + Math.random() * 9000),
        institution_id: INSTITUTION.id,
        institution_name: INSTITUTION.name,
        created_at: new Date().toISOString()
      };
      USERS.push(newUser);

      const token = 'demo-jwt-student-' + newUser.id;
      return sendJSON(res, 201, {
        success: true,
        message: 'Student account registered successfully',
        data: {
          profile: newUser,
          token
        }
      });
    }

    // 2. POST /api/v1/auth/login
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const { email, password } = payload;
      if (!email) {
        return sendJSON(res, 400, { success: false, message: 'Email is required' });
      }

      let user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Auto-provision demo student if logging in with new credentials
        const role = email.includes('faculty') ? 'faculty' :
                     email.includes('admin') ? 'admin' : 'student';
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        user = {
          id: 'usr-' + Date.now(),
          role,
          full_name: formattedName,
          name: formattedName,
          email,
          reg_number: '21BCE' + Math.floor(1000 + Math.random() * 9000),
          institution_id: INSTITUTION.id,
          institution_name: INSTITUTION.name,
          created_at: new Date().toISOString()
        };
        USERS.push(user);
      }

      const token = 'demo-jwt-' + user.role + '-' + user.id;
      return sendJSON(res, 200, {
        success: true,
        message: 'Login successful',
        data: {
          profile: user,
          token
        }
      });
    }

    // 3. GET /api/v1/auth/me
    if (path === '/api/v1/auth/me' && method === 'GET') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      let user = null;
      if (token) {
        const userId = token.split('-').slice(3).join('-');
        user = USERS.find(u => u.id === userId);
      }
      if (!user) {
        user = USERS[0]; // fallback to default student Alex Rivera
      }
      return sendJSON(res, 200, {
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    }

    // 4. POST /api/v1/auth/logout
    if (path === '/api/v1/auth/logout' && method === 'POST') {
      return sendJSON(res, 200, { success: true, message: 'Logged out successfully' });
    }

    // 5. PATCH /api/v1/auth/profile
    if (path === '/api/v1/auth/profile' && method === 'PATCH') {
      return sendJSON(res, 200, { success: true, data: USERS[0], message: 'Profile updated' });
    }

    // ---------------------------------------------------------
    // HEALTH ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/health' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        message: 'CampusFlow REST API & Multi-Agent Engine is Healthy',
        data: {
          uptime: process.uptime(),
          version: '1.0.0-production',
          status: 'online',
          institution: INSTITUTION.name,
          activeSessions: SESSIONS.filter(s => s.status === 'active').length,
          pendingCases: CASES.filter(c => c.status === 'pending_faculty_review').length,
          totalUsers: USERS.length,
          agentsLoaded: ['CoordinatorAgent', 'IntegrityAgent', 'RecoveryAgent', 'EvidenceAgent'],
          timestamp: new Date().toISOString()
        }
      });
    }

    // ---------------------------------------------------------
    // CLASSES ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/classes' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: CLASSES });
    }
    if (path.match(/^\/api\/v1\/classes\/([^/]+)$/) && method === 'GET') {
      const classId = path.split('/')[4];
      const cls = CLASSES.find(c => c.id === classId) || CLASSES[0];
      return sendJSON(res, 200, { success: true, data: cls });
    }
    if (path.match(/^\/api\/v1\/classes\/([^/]+)\/subjects$/) && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: [] });
    }

    // ---------------------------------------------------------
    // SESSIONS ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/sessions' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: SESSIONS });
    }

    if (path === '/api/v1/sessions' && method === 'POST') {
      const { classId, durationMinutes = 10, room = 'Lecture Hall A' } = payload;
      const targetClass = CLASSES.find(c => c.id === classId) || CLASSES[0];
      const rawToken = 'CF_QR_' + crypto.randomBytes(8).toString('hex').toUpperCase();
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const newSession = {
        id: 'ses-' + Date.now(),
        class_id: targetClass.id,
        classId: targetClass.id,
        className: targetClass.name + ' (' + targetClass.code + ')',
        faculty_id: 'usr-faculty-01',
        facultyId: 'usr-faculty-01',
        start_time: new Date().toISOString(),
        startTime: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationMinutes * 60000).toISOString(),
        expiresAt: new Date(Date.now() + durationMinutes * 60000).toISOString(),
        status: 'active',
        tokenHash,
        rawToken,
        totalAttended: 0,
        room
      };
      SESSIONS.unshift(newSession);
      return sendJSON(res, 201, { success: true, data: newSession, message: 'Dynamic QR attendance session launched' });
    }

    // Close Session (handles both POST and PUT)
    if (path.match(/^\/api\/v1\/sessions\/([^/]+)\/close$/) && (method === 'POST' || method === 'PUT')) {
      const sessionId = path.split('/')[4];
      const session = SESSIONS.find(s => s.id === sessionId);
      if (session) {
        session.status = 'closed';
        return sendJSON(res, 200, { success: true, data: session, message: 'Session closed successfully' });
      }
      return sendJSON(res, 404, { success: false, message: 'Session not found' });
    }

    // Get Session QR
    if (path.match(/^\/api\/v1\/sessions\/([^/]+)\/qr$/) && method === 'GET') {
      const sessionId = path.split('/')[4];
      const session = SESSIONS.find(s => s.id === sessionId) || SESSIONS[0];
      return sendJSON(res, 200, { success: true, data: { token: session.rawToken, expiresAt: session.expiresAt } });
    }

    // ---------------------------------------------------------
    // ATTENDANCE ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/attendance/scan' && method === 'POST') {
      const { token, studentId = 'usr-student-01' } = payload;
      const session = SESSIONS.find(s => s.rawToken === token || s.tokenHash === token);
      if (!session) {
        return sendJSON(res, 400, { success: false, message: 'Invalid QR Token. Check-in rejected.' });
      }
      if (session.status !== 'active' || new Date() > new Date(session.expiresAt)) {
        return sendJSON(res, 400, { success: false, message: 'This QR session has expired or closed.' });
      }
      const alreadyScanned = ATTENDANCE_RECORDS.some(r => (r.sessionId === session.id || r.session_id === session.id) && (r.studentId === studentId || r.student_id === studentId));
      if (alreadyScanned) {
        return sendJSON(res, 409, { success: false, message: 'Duplicate scan prevented: Attendance already recorded for this session.' });
      }
      const record = {
        id: 'att-' + Date.now(),
        sessionId: session.id,
        session_id: session.id,
        studentId,
        student_id: studentId,
        studentName: 'Alex Rivera',
        timestamp: new Date().toISOString(),
        status: 'present',
        method: 'qr_scan',
        class_name: session.className
      };
      ATTENDANCE_RECORDS.push(record);
      session.totalAttended += 1;
      return sendJSON(res, 200, { success: true, data: record, message: 'Attendance recorded successfully!' });
    }

    if (path === '/api/v1/attendance' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: ATTENDANCE_RECORDS });
    }

    if (path === '/api/v1/attendance/history' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: ATTENDANCE_RECORDS });
    }

    if (path.match(/^\/api\/v1\/attendance\/session\/([^/]+)$/) && method === 'GET') {
      const sessionId = path.split('/')[4];
      const records = ATTENDANCE_RECORDS.filter(r => r.sessionId === sessionId || r.session_id === sessionId);
      return sendJSON(res, 200, { success: true, data: records });
    }

    if (path === '/api/v1/attendance/report-issue' && method === 'POST') {
      return sendJSON(res, 201, { success: true, message: 'Issue report received' });
    }

    // ---------------------------------------------------------
    // CASES ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/cases' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: CASES });
    }

    if (path.match(/^\/api\/v1\/cases\/([^/]+)$/) && method === 'GET') {
      const caseId = path.split('/')[4];
      const targetCase = CASES.find(c => c.id === caseId || c.caseNumber === caseId) || CASES[0];
      return sendJSON(res, 200, { success: true, data: targetCase });
    }

    if (path === '/api/v1/cases' && method === 'POST') {
      const { classId, category, description, occurrenceTime, isExternal = false } = payload;
      const targetClass = CLASSES.find(c => c.id === classId) || CLASSES[0];
      const caseNumber = 'CF-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      
      const newCase = {
        id: 'rec-' + Date.now(),
        caseNumber,
        case_number: caseNumber,
        studentId: 'usr-student-01',
        student_id: 'usr-student-01',
        studentName: 'Alex Rivera',
        studentReg: '21BCE1042',
        classId: targetClass.id,
        class_id: targetClass.id,
        className: targetClass.code + ': ' + targetClass.name,
        sessionId: isExternal ? null : (SESSIONS[0]?.id || null),
        session_id: isExternal ? null : (SESSIONS[0]?.id || null),
        category,
        categoryLabel: category === 'camera_failure' ? 'Camera / QR Scanner Glitch' :
                       category === 'network_timeout' ? 'Network Connectivity Timeout' :
                       category === 'session_expired' ? 'Premature Session Closure' : 'Attendance Exception',
        status: 'pending_faculty_review',
        systemType: isExternal ? 'external_unverified' : 'campusflow_internal',
        description,
        occurrenceTime: occurrenceTime || new Date().toISOString(),
        occurrence_time: occurrenceTime || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        aiDossier: {
          integrityRisk: isExternal ? 'unknown' : 'low',
          integrityExplanation: isExternal ?
            'Report marked explicitly as UNVERIFIED EXTERNAL REPORT. No external system access per operational boundaries.' :
            'Zero anomalous duplicate attempts detected. Velocity within standard human limits.',
          recoveryFindings: isExternal ?
            'External attendance records cannot be verified automatically. Faculty verification required.' :
            'Class section verified. Concurrent peers (42 students) checked in without reported gateway failure.',
          evidenceTimeline: [
            { time: new Date().toLocaleTimeString(), type: 'student_claim', event: `Student reported: ${description}` },
            { time: new Date().toLocaleTimeString(), type: 'system', event: 'Multi-Agent investigation completed. Case escalated to Faculty Review Queue.' }
          ],
          coordinatorRecommendation: isExternal ?
            'FLAGGED FOR FACULTY VERIFICATION (External attendance claim).' :
            'RECOMMEND REVIEW & APPROVAL: Evidence corroborates genuine device/network timeout without malicious intent.'
        },
        decision: null
      };

      CASES.unshift(newCase);
      AGENT_RUNS.push({
        id: 'run-' + Date.now(),
        agentName: 'CoordinatorAgent',
        caseId: newCase.id,
        durationMs: 980,
        status: 'completed',
        steps: 4,
        timestamp: new Date().toISOString()
      });

      return sendJSON(res, 201, { success: true, data: newCase, message: 'Recovery case submitted. AI Agents have analyzed evidence and forwarded case to faculty.' });
    }

    // Faculty Decision
    if (path.match(/^\/api\/v1\/cases\/([^/]+)\/decision$/) && method === 'POST') {
      const caseId = path.split('/')[4];
      const targetCase = CASES.find(c => c.id === caseId || c.caseNumber === caseId);
      if (!targetCase) {
        return sendJSON(res, 404, { success: false, message: 'Case not found' });
      }
      const { decision, reason, facultyName = 'Prof. Marcus Vance' } = payload;
      if (!reason || reason.trim().length < 5) {
        return sendJSON(res, 400, { success: false, message: 'A mandatory justification reason (at least 5 characters) is required for all faculty decisions.' });
      }

      targetCase.status = decision === 'approve' ? 'approved' : 'rejected';
      targetCase.decision = {
        outcome: targetCase.status,
        decidedBy: facultyName,
        decidedAt: new Date().toISOString(),
        reason
      };

      if (decision === 'approve') {
        ATTENDANCE_RECORDS.push({
          id: 'att-recov-' + Date.now(),
          sessionId: targetCase.sessionId || 'ses-recovered',
          session_id: targetCase.sessionId || 'ses-recovered',
          studentId: targetCase.studentId,
          student_id: targetCase.studentId,
          studentName: targetCase.studentName,
          timestamp: new Date().toISOString(),
          status: 'verified_recovery',
          method: 'faculty_recovery_approval',
          class_name: targetCase.className
        });
      }

      DECISIONS.push({
        id: 'dec-' + Date.now(),
        case_id: targetCase.id,
        outcome: targetCase.status,
        reason,
        created_at: new Date().toISOString()
      });

      return sendJSON(res, 200, {
        success: true,
        data: targetCase,
        message: `Decision successfully recorded: Case #${targetCase.caseNumber} was ${targetCase.status.toUpperCase()} by ${facultyName}.`
      });
    }

    if (path.match(/^\/api\/v1\/cases\/([^/]+)\/additional-information$/) && method === 'POST') {
      return sendJSON(res, 200, { success: true, message: 'Additional information recorded' });
    }

    if (path.match(/^\/api\/v1\/cases\/([^/]+)\/agent-activity$/) && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: AGENT_RUNS });
    }

    // ---------------------------------------------------------
    // ANALYTICS ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/analytics/summary' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: {
          totalStudents: USERS.filter(u => u.role === 'student').length + 180,
          totalSessions: SESSIONS.length,
          validSubmissions: ATTENDANCE_RECORDS.length,
          totalCases: CASES.length,
          pendingReview: CASES.filter(c => c.status === 'pending_faculty_review').length,
          approvedCases: CASES.filter(c => c.status === 'approved').length,
          rejectedCases: CASES.filter(c => c.status === 'rejected').length,
          avgResolutionHours: 2.4,
          integrityStats: { lowRisk: 88, mediumRisk: 9, highRisk: 3 }
        }
      });
    }

    if (path === '/api/v1/analytics/issues' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: [
          { category: 'camera_failure', count: 12, label: 'Camera / QR Scanner Glitch' },
          { category: 'network_timeout', count: 8, label: 'Network Connection Timeout' },
          { category: 'session_expired', count: 5, label: 'Premature Session Closure' },
          { category: 'external_system_unverified', count: 3, label: 'Unverified External Portal' }
        ]
      });
    }

    if (path === '/api/v1/analytics/recovery' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: {
          approved: CASES.filter(c => c.status === 'approved').length,
          rejected: CASES.filter(c => c.status === 'rejected').length,
          pending: CASES.filter(c => c.status === 'pending_faculty_review').length
        }
      });
    }

    // ---------------------------------------------------------
    // ADMIN ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/admin/users' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: USERS });
    }

    if (path === '/api/v1/admin/institutions' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: [INSTITUTION] });
    }

    if (path === '/api/v1/admin/audit-logs' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: AUDIT_LOGS });
    }

    // ---------------------------------------------------------
    // EVENTS HUB ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/events' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: EVENTS });
    }
    if (path === '/api/v1/events' && method === 'POST') {
      const newEvt = {
        id: 'evt-' + Date.now(),
        ...payload,
        registered_count: 0,
        status: 'published',
        is_published: true
      };
      EVENTS.unshift(newEvt);
      return sendJSON(res, 201, { success: true, data: newEvt, message: 'Event published' });
    }
    if (path === '/api/v1/events/recommendations' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        data: {
          recommendedEvents: EVENTS.slice(0, 2),
          matchReason: 'Top matches for Computer Science & Engineering students interested in Autonomous AI.'
        }
      });
    }
    if (path.match(/^\/api\/v1\/events\/([^/]+)$/) && method === 'GET') {
      const evtId = path.split('/')[4];
      const evt = EVENTS.find(e => e.id === evtId) || EVENTS[0];
      return sendJSON(res, 200, { success: true, data: evt });
    }
    if (path.match(/^\/api\/v1\/events\/([^/]+)\/register$/) && method === 'POST') {
      const evtId = path.split('/')[4];
      const newReg = {
        id: 'reg-' + Date.now(),
        event_id: evtId,
        user_id: 'usr-student-01',
        registration_type: payload.registrationType || 'individual',
        team_name: payload.teamName || null,
        team_members: payload.teamMembers || ['Alex Rivera'],
        status: 'confirmed',
        created_at: new Date().toISOString()
      };
      EVENT_REGISTRATIONS.push(newReg);
      const target = EVENTS.find(e => e.id === evtId);
      if (target) target.registered_count = (target.registered_count || 0) + 1;
      return sendJSON(res, 201, { success: true, data: newReg, message: 'Registration confirmed' });
    }
    if (path.match(/^\/api\/v1\/events\/([^/]+)\/registrations$/) && method === 'GET') {
      const evtId = path.split('/')[4];
      const regs = EVENT_REGISTRATIONS.filter(r => r.event_id === evtId);
      return sendJSON(res, 200, { success: true, data: regs });
    }

    // ---------------------------------------------------------
    // CLASSROOMS & DIGITAL TWIN ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/classrooms' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: CLASSROOMS });
    }
    if (path === '/api/v1/classrooms/digital-twin' && method === 'GET') {
      const totalRooms = CLASSROOMS.length;
      const occupiedRooms = CLASSROOMS.filter(r => r.status === 'occupied').length;
      return sendJSON(res, 200, {
        success: true,
        data: {
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          utilizationRate: Math.round((occupiedRooms / totalRooms) * 100),
          totalPowerLoadKw: '20.4',
          avgTemperatureC: '22.1',
          classrooms: CLASSROOMS
        }
      });
    }
    if (path === '/api/v1/classrooms/book' && method === 'POST') {
      const room = CLASSROOMS.find(r => r.id === payload.roomId || r.code === payload.roomCode);
      if (room) room.status = 'reserved';
      return sendJSON(res, 200, { success: true, message: `Room reserved successfully` });
    }

    // ---------------------------------------------------------
    // COPILOT ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/copilot/ask' && method === 'POST') {
      const { query } = payload;
      const q = (query || '').toLowerCase();
      let answer = 'I am CampusFlow AI Support Copilot. How can I assist you?';
      let chips = ['Check my attendance', 'Show upcoming hackathons'];
      if (q.includes('attendance')) {
        answer = 'Your overall attendance is 92.8% across 28 sessions, well above the 75% threshold.';
        chips = ['View breakdown', 'File recovery ticket'];
      } else if (q.includes('hackathon') || q.includes('event')) {
        answer = 'Apex InnoHacks 2026 is published! ₹1.5L in cash prizes, team size 2-4. Registration deadline in 3 days.';
        chips = ['Register for InnoHacks', 'View calendar'];
      }
      return sendJSON(res, 200, { success: true, data: { answer, suggestedFollowUps: chips } });
    }

    // ---------------------------------------------------------
    // ORCHESTRATOR ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/orchestrator/tasks' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: ORCHESTRATOR_TASKS });
    }
    if (path === '/api/v1/orchestrator/run-workflow' && method === 'POST') {
      const newTask = {
        id: 'orch-task-' + Date.now(),
        title: 'Emergency Faculty Absence & Proxy Allocation',
        trigger_event: 'Autonomous Orchestrator triggered simulation',
        status: 'pending_approval',
        requires_admin_approval: true,
        urgency: 'high',
        created_at: new Date().toISOString(),
        agents_involved: ['Timetable Agent', 'Resource Agent', 'Notification Agent'],
        summary: 'Schedule conflict detected. Alternative faculty Dr. Sarah Jenkins matched with Hall B-204.',
        steps: [
          { agent: 'Timetable Agent', action: 'Detected unstaffed session', status: 'completed' },
          { agent: 'Resource Agent', action: 'Confirmed Hall B-204 is clear', status: 'completed' },
          { agent: 'Autonomous Orchestrator', action: 'Presented optimal solution to admin queue', status: 'waiting_for_approval' }
        ]
      };
      ORCHESTRATOR_TASKS.unshift(newTask);
      return sendJSON(res, 201, { success: true, data: newTask, message: 'Workflow pipeline executed by Swarm!' });
    }
    if (path.match(/^\/api\/v1\/orchestrator\/tasks\/([^/]+)\/approve$/) && method === 'POST') {
      const taskId = path.split('/')[4];
      const task = ORCHESTRATOR_TASKS.find(t => t.id === taskId);
      if (task) {
        task.status = 'approved_and_executed';
        task.requires_admin_approval = false;
        task.admin_approval = { approved_by: 'Dr. Sarah Jenkins', approved_at: new Date().toISOString() };
      }
      return sendJSON(res, 200, { success: true, message: 'Action authorized. Autonomous execution completed!' });
    }

    // ---------------------------------------------------------
    // LOST & FOUND ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/lost-found' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: LOST_FOUND });
    }
    if (path === '/api/v1/lost-found' && method === 'POST') {
      const newItem = {
        id: 'lf-' + Date.now(),
        ...payload,
        reported_at: new Date().toISOString(),
        status: payload.type === 'found' ? 'available_for_claim' : 'reported_lost'
      };
      LOST_FOUND.unshift(newItem);
      return sendJSON(res, 201, { success: true, data: newItem, message: 'Item recorded' });
    }

    // ---------------------------------------------------------
    // NOTICES ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/notices' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: NOTICES });
    }

    // ---------------------------------------------------------
    // GRIEVANCES ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/grievances' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: GRIEVANCES });
    }
    if (path === '/api/v1/grievances' && method === 'POST') {
      const newGrv = {
        id: 'grv-' + Date.now(),
        ticket_number: 'GRV-2026-' + Math.floor(100 + Math.random() * 900),
        student_id: 'usr-student-01',
        student_name: 'Alex Rivera',
        ...payload,
        department_assigned: 'Campus Facilities & IT Services',
        status: 'submitted',
        sla_hours: 48,
        created_at: new Date().toISOString()
      };
      GRIEVANCES.unshift(newGrv);
      return sendJSON(res, 201, { success: true, data: newGrv, message: 'Grievance registered' });
    }

    // ---------------------------------------------------------
    // TIMETABLES & ASSIGNMENTS ROUTER
    // ---------------------------------------------------------
    if (path === '/api/v1/timetable/student' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: TIMETABLES });
    }
    if (path === '/api/v1/assignments/pending' && method === 'GET') {
      return sendJSON(res, 200, { success: true, data: ASSIGNMENTS });
    }

    // Default 404
    sendJSON(res, 404, { success: false, message: `Endpoint ${method} ${path} not found` });
  });
});

apiServer.listen(5000, '0.0.0.0', () => {
  console.log('✅ CampusFlow REST API listening at http://localhost:5000');
  console.log('   Health check endpoint: http://localhost:5000/api/v1/health');
});

// -------------------------------------------------------------
// 2. FRONTEND WEB PORTAL SERVER (PORT 5173)
// -------------------------------------------------------------
// Serves SPA HTML for all web routes
const frontendHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusFlow — Agentic AI Attendance Trust & Recovery Platform</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col">

  <!-- Top Navigation & Role Switcher Bar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Logo -->
      <div class="flex items-center space-x-3 cursor-pointer" onclick="navigate('dashboard')">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <i data-lucide="shield-check" class="w-6 h-6"></i>
        </div>
        <div>
          <span class="text-xl font-bold tracking-tight text-slate-900">Campus<span class="text-indigo-600">Flow</span></span>
          <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Trust & Recovery</span>
        </div>
      </div>

      <!-- Live Demo Role Switcher -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button id="role-btn-student" onclick="setRole('student')" class="px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 bg-white text-indigo-600 shadow-sm font-semibold">
            <i data-lucide="graduation-cap" class="w-4 h-4"></i>
            <span>Student</span>
          </button>
          <button id="role-btn-faculty" onclick="setRole('faculty')" class="px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 text-slate-600 hover:text-slate-900">
            <i data-lucide="user-check" class="w-4 h-4"></i>
            <span>Faculty</span>
          </button>
          <button id="role-btn-admin" onclick="setRole('admin')" class="px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 text-slate-600 hover:text-slate-900">
            <i data-lucide="sliders" class="w-4 h-4"></i>
            <span>Admin</span>
          </button>
        </div>

        <!-- User Profile Pill -->
        <div class="hidden md:flex items-center pl-2 border-l border-slate-200 space-x-2">
          <div id="user-avatar" class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">AR</div>
          <div class="text-left leading-tight">
            <div id="user-name" class="text-xs font-bold text-slate-900">Alex Rivera</div>
            <div id="user-sub" class="text-[10px] text-slate-500 font-mono">21BCE1042</div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Operational Boundary Disclaimer Banner -->
  <div class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
    <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600 flex-shrink-0"></i>
        <span><strong>Operational Integrity Notice:</strong> CampusFlow is an independent trust platform. It does not integrate with, claim access to, or access NIAT private attendance databases. External claims are labeled <em>Unverified</em> until human faculty review.</span>
      </div>
      <span class="hidden md:inline font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded text-amber-900 font-semibold">Human-in-the-Loop Active</span>
    </div>
  </div>

  <!-- Main View Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div id="app-view"></div>
  </main>

  <!-- Global Modal for QR Scanner / Review / Actions -->
  <div id="modal-container" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div id="modal-content" class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 transform transition-all"></div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none"></div>

  <!-- App Client Script -->
  <script>
    let currentRole = 'student';
    let currentTab = 'dashboard';
    let store = {
      sessions: [],
      cases: [],
      attendance: [],
      classes: []
    };

    const USERS = {
      student: { name: 'Alex Rivera', role: 'Student', sub: '21BCE1042', initials: 'AR' },
      faculty: { name: 'Prof. Marcus Vance', role: 'Faculty', sub: 'CS Dept Head', initials: 'MV' },
      admin: { name: 'Dr. Sarah Jenkins', role: 'Administrator', sub: 'Dean of Affairs', initials: 'SJ' }
    };

    async function init() {
      await loadData();
      render();
    }

    async function loadData() {
      try {
        const [sesRes, casesRes, attRes, clsRes] = await Promise.all([
          fetch('http://localhost:5000/api/v1/sessions').then(r => r.json()),
          fetch('http://localhost:5000/api/v1/cases').then(r => r.json()),
          fetch('http://localhost:5000/api/v1/attendance').then(r => r.json()),
          fetch('http://localhost:5000/api/v1/classes').then(r => r.json())
        ]);
        store.sessions = sesRes.data || [];
        store.cases = casesRes.data || [];
        store.attendance = attRes.data || [];
        store.classes = clsRes.data || [];
      } catch (err) {
        console.warn('API fetch warning', err);
      }
    }

    function setRole(role) {
      currentRole = role;
      document.querySelectorAll('[id^="role-btn-"]').forEach(btn => {
        btn.className = 'px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 text-slate-600 hover:text-slate-900';
      });
      const activeBtn = document.getElementById('role-btn-' + role);
      if (activeBtn) activeBtn.className = 'px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 bg-white text-indigo-600 shadow-sm font-semibold';
      
      const user = USERS[role];
      document.getElementById('user-avatar').innerText = user.initials;
      document.getElementById('user-name').innerText = user.name;
      document.getElementById('user-sub').innerText = user.sub;

      showToast('Switched to ' + user.role + ' role (' + user.name + ')', 'info');
      currentTab = 'dashboard';
      render();
    }

    function navigate(tab) {
      currentTab = tab;
      render();
    }

    function render() {
      const container = document.getElementById('app-view');
      if (currentRole === 'student') {
        container.innerHTML = renderStudentView();
      } else if (currentRole === 'faculty') {
        container.innerHTML = renderFacultyView();
      } else {
        container.innerHTML = renderAdminView();
      }
      lucide.createIcons();
    }

    // STUDENT VIEW
    function renderStudentView() {
      const activeSession = store.sessions.find(s => s.status === 'active');
      return \`
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Student Attendance Hub</h1>
            <p class="text-sm text-slate-500">Welcome, Alex Rivera. Track verification, scan live tokens, or file recovery reports.</p>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="openScanModal()" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-100 transition-all space-x-2">
              <i data-lucide="qr-code" class="w-4 h-4"></i>
              <span>Scan QR Code</span>
            </button>
            <button onclick="openReportModal()" class="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium rounded-xl transition-all space-x-2">
              <i data-lucide="life-buoy" class="w-4 h-4"></i>
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Overall Attendance</span>
              <i data-lucide="percent" class="w-4 h-4 text-emerald-500"></i>
            </div>
            <div class="text-2xl font-bold text-slate-900 mt-2">92.4%</div>
            <div class="text-xs text-emerald-600 mt-1 flex items-center">
              <i data-lucide="arrow-up-right" class="w-3 h-3 mr-1"></i> Above 75% threshold
            </div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Verified Check-ins</span>
              <i data-lucide="check-circle" class="w-4 h-4 text-indigo-500"></i>
            </div>
            <div class="text-2xl font-bold text-slate-900 mt-2">\${store.attendance.length}</div>
            <div class="text-xs text-slate-500 mt-1">Independent cryptographic log</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Recovery Cases</span>
              <i data-lucide="file-question" class="w-4 h-4 text-amber-500"></i>
            </div>
            <div class="text-2xl font-bold text-slate-900 mt-2">\${store.cases.length}</div>
            <div class="text-xs text-amber-600 mt-1">Multi-agent reviewed</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Active Class Session</span>
              <i data-lucide="radio" class="w-4 h-4 text-rose-500 animate-pulse"></i>
            </div>
            <div class="text-lg font-bold text-slate-900 mt-2 truncate">\${activeSession ? activeSession.className : 'No Active Session'}</div>
            <div class="text-xs text-slate-500 mt-1">\${activeSession ? 'Ready for QR check-in' : 'Check back later'}</div>
          </div>
        </div>

        <div class="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="history" class="w-5 h-5 text-indigo-600"></i>
              <h2 class="font-bold text-slate-900">Your Recovery Cases & AI Investigation Status</h2>
            </div>
            <button onclick="openReportModal()" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">+ New Case</button>
          </div>
          <div class="divide-y divide-slate-100">
            \${store.cases.map(c => \`
              <div class="p-5 hover:bg-slate-50/60 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center space-x-3">
                    <span class="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-700">\${c.caseNumber}</span>
                    <span class="font-semibold text-slate-900 text-sm">\${c.className}</span>
                    <span class="text-xs px-2.5 py-0.5 rounded-full font-medium \${
                      c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }">\${c.status.replace(/_/g, ' ').toUpperCase()}</span>
                    \${c.systemType === 'external_unverified' ? '<span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">Unverified External</span>' : ''}
                  </div>
                  <span class="text-xs text-slate-400">\${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p class="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">\${c.description}</p>
                
                \${c.aiDossier ? \`
                  <div class="mt-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs">
                    <div class="font-semibold text-indigo-900 flex items-center space-x-1.5 mb-1">
                      <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-600"></i>
                      <span>AI Multi-Agent Synthesis (Integrity & Recovery Correlation)</span>
                    </div>
                    <div class="text-slate-600 space-y-1">
                      <div><strong class="text-slate-700">Integrity Risk:</strong> <span class="capitalize text-emerald-700 font-medium">\${c.aiDossier.integrityRisk}</span> — \${c.aiDossier.integrityExplanation}</div>
                      <div><strong class="text-slate-700">Telemetry:</strong> \${c.aiDossier.recoveryFindings}</div>
                      <div class="pt-1 text-indigo-800 font-medium">👉 <em>\${c.aiDossier.coordinatorRecommendation}</em></div>
                    </div>
                  </div>
                \` : ''}

                \${c.decision ? \`
                  <div class="mt-2 text-xs font-medium p-2.5 rounded-lg \${c.decision.outcome === 'approved' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}">
                    <strong>Faculty Resolution by \${c.decision.decidedBy}:</strong> \${c.decision.reason}
                  </div>
                \` : ''}
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    // FACULTY VIEW
    function renderFacultyView() {
      const activeSession = store.sessions.find(s => s.status === 'active');
      const pendingCases = store.cases.filter(c => c.status === 'pending_faculty_review');

      return \`
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Faculty Attendance Command Center</h1>
            <p class="text-sm text-slate-500">Welcome, Prof. Marcus Vance. Generate cryptographic QR sessions and adjudicate AI recovery dossiers.</p>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="openCreateSessionModal()" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-100 transition-all space-x-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Launch New QR Session</span>
            </button>
          </div>
        </div>

        \${activeSession ? \`
          <div class="mt-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl text-white p-6 shadow-xl relative overflow-hidden">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <div class="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE QR SESSION ACTIVE</span>
                </div>
                <h2 class="text-xl font-bold">\${activeSession.className}</h2>
                <p class="text-sm text-indigo-200 mt-1">Location: \${activeSession.room} • \${activeSession.totalAttended} check-ins recorded</p>
                <div class="mt-4 flex items-center space-x-3">
                  <button onclick="closeSession('\${activeSession.id}')" class="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-all">
                    End Session Now
                  </button>
                  <span class="text-xs text-indigo-300 font-mono">Token: \${activeSession.rawToken}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded-xl shadow-md text-slate-900 flex flex-col items-center">
                <div class="w-36 h-36 bg-slate-900 rounded-lg flex items-center justify-center p-2">
                  <svg class="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="25" height="25" />
                    <rect x="65" y="10" width="25" height="25" />
                    <rect x="10" y="65" width="25" height="25" />
                    <rect x="15" y="15" width="15" height="15" fill="#0f172a" />
                    <rect x="70" y="15" width="15" height="15" fill="#0f172a" />
                    <rect x="15" y="70" width="15" height="15" fill="#0f172a" />
                    <rect x="45" y="15" width="10" height="20" />
                    <rect x="45" y="45" width="25" height="25" />
                    <rect x="15" y="45" width="20" height="10" />
                    <rect x="75" y="45" width="15" height="15" />
                  </svg>
                </div>
                <span class="text-[10px] font-mono text-slate-500 mt-2 font-bold tracking-widest">\${activeSession.rawToken}</span>
              </div>
            </div>
          </div>
        \` : ''}

        <div class="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="clipboard-check" class="w-5 h-5 text-indigo-600"></i>
              <h2 class="font-bold text-slate-900">Faculty Review Queue (\${pendingCases.length} Pending Actions)</h2>
            </div>
            <span class="text-xs text-slate-500">Human-in-the-Loop Required</span>
          </div>

          \${pendingCases.length === 0 ? \`
            <div class="p-8 text-center text-slate-500 text-sm">
              <i data-lucide="check-circle-2" class="w-8 h-8 text-emerald-500 mx-auto mb-2"></i>
              All attendance exception cases have been resolved.
            </div>
          \` : \`
            <div class="divide-y divide-slate-100">
              \${pendingCases.map(c => \`
                <div class="p-6 hover:bg-slate-50/50 transition-colors">
                  <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div class="space-y-2 flex-1">
                      <div class="flex items-center space-x-3">
                        <span class="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-700">\${c.caseNumber}</span>
                        <span class="font-bold text-slate-900 text-base">\${c.studentName} (\${c.studentReg})</span>
                        <span class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">Review Required</span>
                        \${c.systemType === 'external_unverified' ? '<span class="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">Unverified External Claim</span>' : ''}
                      </div>

                      <div class="text-xs text-slate-500">
                        Class: <strong>\${c.className}</strong> • Reported Occurrence: \${new Date(c.occurrenceTime).toLocaleTimeString()}
                      </div>

                      <div class="text-xs text-slate-700 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
                        <strong>Student Claim:</strong> "\${c.description}"
                      </div>

                      <div class="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-4 text-xs space-y-2 mt-3">
                        <div class="flex items-center justify-between text-indigo-950 font-bold border-b border-indigo-200/50 pb-1.5">
                          <span class="flex items-center space-x-1.5">
                            <i data-lucide="bot" class="w-4 h-4 text-indigo-600"></i>
                            <span>AI Agent Investigation Dossier</span>
                          </span>
                          <span class="text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-mono">Bounded 4-Agent Pipeline</span>
                        </div>
                        <div class="text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          <div>
                            <span class="font-semibold text-slate-900">Integrity Risk:</span>
                            <span class="capitalize font-bold text-emerald-700">\${c.aiDossier?.integrityRisk || 'Low'}</span>
                            <p class="text-[11px] text-slate-600 mt-0.5">\${c.aiDossier?.integrityExplanation}</p>
                          </div>
                          <div>
                            <span class="font-semibold text-slate-900">Session & AP Telemetry:</span>
                            <p class="text-[11px] text-slate-600 mt-0.5">\${c.aiDossier?.recoveryFindings}</p>
                          </div>
                        </div>
                        <div class="pt-2 border-t border-indigo-200/50 text-indigo-900 font-medium">
                          <strong>Agent Recommendation:</strong> \${c.aiDossier?.coordinatorRecommendation}
                        </div>
                      </div>
                    </div>

                    <div class="lg:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex-shrink-0">
                      <div class="text-xs font-bold text-slate-900 flex items-center space-x-1">
                        <i data-lucide="gavel" class="w-3.5 h-3.5 text-slate-600"></i>
                        <span>Mandatory Human Adjudication</span>
                      </div>
                      <input id="reason-\${c.id}" type="text" placeholder="Mandatory reason for decision..." class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <div class="flex space-x-2">
                        <button onclick="submitDecision('\${c.id}', 'approve')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1">
                          <i data-lucide="check" class="w-3.5 h-3.5"></i>
                          <span>Approve</span>
                        </button>
                        <button onclick="submitDecision('\${c.id}', 'reject')" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1">
                          <i data-lucide="x" class="w-3.5 h-3.5"></i>
                          <span>Reject</span>
                        </button>
                      </div>
                      <p class="text-[10px] text-slate-400 text-center">AI agents never execute decisions. Your decision and rationale are permanently logged for compliance.</p>
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
          \`}
        </div>
      \`;
    }

    // ADMIN VIEW
    function renderAdminView() {
      return \`
        <div class="pb-6 border-b border-slate-200">
          <h1 class="text-2xl font-bold text-slate-900">Institution Command Center</h1>
          <p class="text-sm text-slate-500">Apex Institute of Technology • High-level trust metrics, multi-agent audits, and exception governance.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-slate-500 text-xs font-semibold uppercase">Total Campus Students</div>
            <div class="text-2xl font-bold text-slate-900 mt-2">\${USERS.filter(u => u.role === 'student').length + 180}</div>
            <div class="text-xs text-slate-500 mt-1">3 Active Departments</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-slate-500 text-xs font-semibold uppercase">Total QR Sessions</div>
            <div class="text-2xl font-bold text-slate-900 mt-2">\${store.sessions.length}</div>
            <div class="text-xs text-indigo-600 mt-1">Cryptographic SHA-256 tokens</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-slate-500 text-xs font-semibold uppercase">Total Recovery Tickets</div>
            <div class="text-2xl font-bold text-slate-900 mt-2">\${store.cases.length}</div>
            <div class="text-xs text-slate-500 mt-1">All processed through Multi-Agent</div>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-slate-500 text-xs font-semibold uppercase">Average Resolution Time</div>
            <div class="text-2xl font-bold text-slate-900 mt-2">2.4 hrs</div>
            <div class="text-xs text-emerald-600 mt-1">Down 76% vs manual disputes</div>
          </div>
        </div>

        <div class="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="cpu" class="w-5 h-5 text-indigo-600"></i>
              <h2 class="font-bold text-slate-900">Multi-Agent AI Execution Audit Log</h2>
            </div>
            <span class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">All Agents Operational</span>
          </div>
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th class="p-3.5 pl-5">Run ID</th>
                <th class="p-3.5">Agent Pipeline</th>
                <th class="p-3.5">Target Case</th>
                <th class="p-3.5">Execution Latency</th>
                <th class="p-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              <tr>
                <td class="p-3.5 pl-5 text-slate-700">run-coordinator-842</td>
                <td class="p-3.5 font-sans font-semibold text-slate-900">CoordinatorAgent (4 Sub-agent tasks)</td>
                <td class="p-3.5 text-indigo-600">CF-2026-0842</td>
                <td class="p-3.5 text-slate-600">1,240 ms</td>
                <td class="p-3.5"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans font-medium">COMPLETED</span></td>
              </tr>
              <tr>
                <td class="p-3.5 pl-5 text-slate-700">run-integrity-842</td>
                <td class="p-3.5 font-sans font-semibold text-slate-900">IntegrityAgent (Temporal Cluster Scan)</td>
                <td class="p-3.5 text-indigo-600">CF-2026-0842</td>
                <td class="p-3.5 text-slate-600">650 ms</td>
                <td class="p-3.5"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans font-medium">LOW RISK</span></td>
              </tr>
              <tr>
                <td class="p-3.5 pl-5 text-slate-700">run-recovery-842</td>
                <td class="p-3.5 font-sans font-semibold text-slate-900">RecoveryAgent (Session Telemetry)</td>
                <td class="p-3.5 text-indigo-600">CF-2026-0842</td>
                <td class="p-3.5 text-slate-600">820 ms</td>
                <td class="p-3.5"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans font-medium">VALIDATED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      \`;
    }

    // MODALS
    function openScanModal() {
      const activeSession = store.sessions.find(s => s.status === 'active');
      const modal = document.getElementById('modal-container');
      const content = document.getElementById('modal-content');
      content.innerHTML = \`
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-base flex items-center space-x-2">
            <i data-lucide="scan" class="w-5 h-5 text-indigo-600"></i>
            <span>CampusFlow QR Scanner</span>
          </h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <div class="py-4 space-y-4">
          <div class="w-full h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
            <div class="w-32 h-32 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center animate-pulse">
              <i data-lucide="camera" class="w-8 h-8 text-indigo-300"></i>
            </div>
            <span class="text-xs text-slate-400 mt-2 font-mono">WebRTC Camera Stream Active</span>
          </div>
          
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-700">Or Enter / Simulate Session Token:</label>
            <div class="flex space-x-2">
              <input id="scan-token-input" type="text" value="\${activeSession ? activeSession.rawToken : 'ACTIVE_TOKEN_CS301'}" class="flex-1 font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" />
              <button onclick="submitScan()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">
                Check In
              </button>
            </div>
            <p class="text-[11px] text-slate-400">Tokens are cryptographically bound to dynamic session windows and prevent duplicate check-ins.</p>
          </div>
        </div>
      \`;
      modal.classList.remove('hidden');
      lucide.createIcons();
    }

    async function submitScan() {
      const token = document.getElementById('scan-token-input').value;
      try {
        const res = await fetch('http://localhost:5000/api/v1/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, studentId: 'usr-student-01' })
        }).then(r => r.json());

        if (res.success) {
          showToast(res.message, 'success');
          closeModal();
          await loadData();
          render();
        } else {
          showToast(res.message, 'error');
        }
      } catch (err) {
        showToast('Network error submitting attendance', 'error');
      }
    }

    function openReportModal() {
      const modal = document.getElementById('modal-container');
      const content = document.getElementById('modal-content');
      content.innerHTML = \`
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-base flex items-center space-x-2">
            <i data-lucide="life-buoy" class="w-5 h-5 text-indigo-600"></i>
            <span>Submit Attendance Recovery Report</span>
          </h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onsubmit="handleReportSubmit(event)" class="py-4 space-y-3">
          <div>
            <label class="text-xs font-semibold text-slate-700">Class Section</label>
            <select id="rep-class" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white mt-1">
              \${store.classes.map(c => \`<option value="\${c.id}">\${c.code}: \${c.name}</option>\`).join('')}
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-700">Issue Category</label>
            <select id="rep-category" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white mt-1">
              <option value="camera_failure">QR Scanner / Camera Glitch</option>
              <option value="network_timeout">Campus WiFi / Connection Timeout</option>
              <option value="session_expired">Premature Session Expiry</option>
              <option value="external_system_unverified">External College Portal Failure (Unverified)</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-700">Technical Description</label>
            <textarea id="rep-desc" rows="3" required placeholder="Describe what happened during check-in..." class="w-full text-xs p-2.5 rounded-lg border border-slate-300 mt-1"></textarea>
          </div>
          <div class="pt-2 flex justify-end space-x-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">Submit to AI Investigation</button>
          </div>
        </form>
      \`;
      modal.classList.remove('hidden');
      lucide.createIcons();
    }

    async function handleReportSubmit(e) {
      e.preventDefault();
      const classId = document.getElementById('rep-class').value;
      const category = document.getElementById('rep-category').value;
      const description = document.getElementById('rep-desc').value;
      const isExternal = category === 'external_system_unverified';

      try {
        const res = await fetch('http://localhost:5000/api/v1/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId, category, description, isExternal })
        }).then(r => r.json());

        if (res.success) {
          showToast('Case #' + res.data.caseNumber + ' created and investigated by AI!', 'success');
          closeModal();
          await loadData();
          render();
        } else {
          showToast(res.message, 'error');
        }
      } catch (err) {
        showToast('Error submitting report', 'error');
      }
    }

    function openCreateSessionModal() {
      const modal = document.getElementById('modal-container');
      const content = document.getElementById('modal-content');
      content.innerHTML = \`
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-base">Launch Dynamic QR Attendance Session</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onsubmit="handleCreateSession(event)" class="py-4 space-y-3">
          <div>
            <label class="text-xs font-semibold text-slate-700">Course & Section</label>
            <select id="ses-class" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white mt-1">
              \${store.classes.map(c => \`<option value="\${c.id}">\${c.code}: \${c.name}</option>\`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-slate-700">Duration (Minutes)</label>
              <input id="ses-duration" type="number" value="10" min="1" max="60" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-700">Classroom / Hall</label>
              <input id="ses-room" type="text" value="Auditorium B-101" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 mt-1" />
            </div>
          </div>
          <div class="pt-3 flex justify-end space-x-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm">Launch Session</button>
          </div>
        </form>
      \`;
      modal.classList.remove('hidden');
      lucide.createIcons();
    }

    async function handleCreateSession(e) {
      e.preventDefault();
      const classId = document.getElementById('ses-class').value;
      const durationMinutes = parseInt(document.getElementById('ses-duration').value);
      const room = document.getElementById('ses-room').value;

      try {
        const res = await fetch('http://localhost:5000/api/v1/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId, durationMinutes, room })
        }).then(r => r.json());

        if (res.success) {
          showToast('Dynamic QR session launched!', 'success');
          closeModal();
          await loadData();
          render();
        }
      } catch (err) {
        showToast('Error launching session', 'error');
      }
    }

    async function closeSession(sessionId) {
      try {
        const res = await fetch('http://localhost:5000/api/v1/sessions/' + sessionId + '/close', {
          method: 'POST'
        }).then(r => r.json());

        if (res.success) {
          showToast('Session closed', 'info');
          await loadData();
          render();
        }
      } catch (err) {
        showToast('Error closing session', 'error');
      }
    }

    async function submitDecision(caseId, decision) {
      const reasonInput = document.getElementById('reason-' + caseId);
      const reason = reasonInput ? reasonInput.value : '';

      if (!reason || reason.trim().length < 5) {
        showToast('A mandatory recorded reason (at least 5 characters) is required!', 'error');
        if (reasonInput) reasonInput.focus();
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/v1/cases/' + caseId + '/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, reason, facultyName: 'Prof. Marcus Vance' })
        }).then(r => r.json());

        if (res.success) {
          showToast(res.message, 'success');
          await loadData();
          render();
        } else {
          showToast(res.message, 'error');
        }
      } catch (err) {
        showToast('Error recording decision', 'error');
      }
    }

    function closeModal() {
      document.getElementById('modal-container').classList.add('hidden');
    }

    function showToast(message, type = 'info') {
      const toast = document.getElementById('toast');
      const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        info: 'bg-slate-900 text-white'
      };
      toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 transition-all duration-300 ' + (colors[type] || colors.info);
      toast.innerHTML = '<span>' + message + '</span>';
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
      }, 3500);
    }

    init();
  </script>
</body>
</html>`;

const webServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(frontendHTML);
});

webServer.listen(5173, '0.0.0.0', () => {
  console.log('✅ CampusFlow Web Application is LIVE at http://localhost:5173');
});
