import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Detect if running in cloud (e.g. Vercel) with no reachable localhost backend
const isCloudWithoutBackend = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) && 
  API_BASE_URL.includes('localhost');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // Quick timeout so fallback kicks in immediately if backend is unreachable
});

// Request interceptor: Attach JWT authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ----------------------------------------------------------------------
// RESILIENT CLIENT-SIDE FALLBACK STORE (FOR CLOUD DEPLOYMENTS LIKE VERCEL)
// ----------------------------------------------------------------------
const STORAGE_KEY = 'campusflow_client_store_v2';

function getStore() {
  let store = null;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      store = JSON.parse(existing);
    } catch (e) {}
  }

  const initialStore = {
    users: [
      { id: 'usr-student-01', role: 'student', full_name: 'Alex Rivera', name: 'Alex Rivera', email: 'alex.rivera@apex.edu', reg_number: '21BCE1042', department: 'Computer Science & Engineering', institution_name: 'Apex Institute of Technology' },
      { id: 'usr-faculty-01', role: 'faculty', full_name: 'Prof. Marcus Vance', name: 'Prof. Marcus Vance', email: 'prof.vance@apex.edu', department: 'Computer Science & Engineering', institution_name: 'Apex Institute of Technology' },
      { id: 'usr-admin-01', role: 'admin', full_name: 'Dr. Sarah Jenkins', name: 'Dr. Sarah Jenkins', email: 'admin.jenkins@apex.edu', title: 'Dean of Academic Affairs', department: 'Academic Affairs', institution_name: 'Apex Institute of Technology' }
    ],
    classes: [
      {
        id: 'cls-cs301',
        code: 'CS-301',
        name: 'Algorithms & Data Structures',
        semester: 5,
        enrolled_count: 64,
        room: 'Hall B-204',
        faculty_id: 'usr-faculty-01',
        faculty_name: 'Prof. Marcus Vance',
        subjects: [
          { id: 'sub-01', code: 'CS-301', name: 'Algorithms & Data Structures' },
          { id: 'sub-02', code: 'CS-302', name: 'Distributed Systems & Cloud Computing' }
        ]
      },
      {
        id: 'cls-cs302',
        code: 'CS-302',
        name: 'Distributed Systems & Cloud',
        semester: 5,
        enrolled_count: 58,
        room: 'Lab 3',
        faculty_id: 'usr-faculty-01',
        faculty_name: 'Prof. Marcus Vance',
        subjects: [
          { id: 'sub-02', code: 'CS-302', name: 'Distributed Systems & Cloud Computing' }
        ]
      },
      {
        id: 'cls-cs303',
        code: 'CS-303',
        name: 'Database Management Systems',
        semester: 4,
        enrolled_count: 62,
        room: 'Hall A-101',
        faculty_id: 'usr-faculty-01',
        faculty_name: 'Prof. Marcus Vance',
        subjects: [
          { id: 'sub-03', code: 'CS-303', name: 'Database Management Systems' }
        ]
      }
    ],
    sessions: [
      {
        id: 'ses-102',
        class_id: 'cls-cs301',
        classId: 'cls-cs301',
        className: 'Algorithms & Data Structures (CS-301)',
        subject_id: 'sub-01',
        subject_name: 'Algorithms & Data Structures',
        subject_code: 'CS-301',
        faculty_id: 'usr-faculty-01',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
        status: 'active',
        rawToken: 'ACTIVE_TOKEN_CS301',
        token: 'ACTIVE_TOKEN_CS301',
        token_hash: 'ACTIVE_TOKEN_CS301',
        totalAttended: 42,
        room: 'Hall B-204'
      },
      {
        id: 'ses-101',
        class_id: 'cls-cs301',
        classId: 'cls-cs301',
        className: 'Algorithms & Data Structures (CS-301)',
        subject_id: 'sub-01',
        subject_name: 'Algorithms & Data Structures',
        subject_code: 'CS-301',
        faculty_id: 'usr-faculty-01',
        starts_at: new Date(Date.now() - 3600000).toISOString(),
        expires_at: new Date(Date.now() - 2700000).toISOString(),
        status: 'closed',
        rawToken: 'DEMO_TOKEN_101',
        token: 'DEMO_TOKEN_101',
        totalAttended: 59,
        room: 'Hall B-204'
      }
    ],
    attendance: [
      { id: 'att-01', sessionId: 'ses-101', studentId: 'usr-student-01', studentName: 'Alex Rivera', timestamp: new Date(Date.now() - 3400000).toISOString(), status: 'present', method: 'qr_scan', class_name: 'CS-301: Algorithms & Data Structures' },
      { id: 'att-02', sessionId: 'ses-101', studentId: 'usr-student-02', studentName: 'Maya Patel', timestamp: new Date(Date.now() - 3410000).toISOString(), status: 'present', method: 'qr_scan', class_name: 'CS-301: Algorithms & Data Structures' }
    ],
    cases: [
      {
        id: 'rec-001',
        caseNumber: 'CF-2026-0842',
        case_number: 'CF-2026-0842',
        studentId: 'usr-student-01',
        student_id: 'usr-student-01',
        studentName: 'Alex Rivera',
        studentReg: '21BCE1042',
        classId: 'cls-cs301',
        class_id: 'cls-cs301',
        className: 'CS-301: Algorithms & Data Structures',
        sessionId: 'ses-101',
        category: 'camera_failure',
        categoryLabel: 'Camera / QR Scanner Glitch',
        status: 'pending_faculty_review',
        systemType: 'campusflow_internal',
        description: 'My phone camera froze while attempting to focus on the dynamic QR code during the session. By the time I rebooted the browser tab, the 5-minute scanner window had expired.',
        occurrenceTime: new Date(Date.now() - 3500000).toISOString(),
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
      }
    ],
    events: [
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
        rules: 'All code must be written during the hackathon. Pre-existing templates must be declared during registration. Open-source models allowed.'
      },
      {
        id: 'evt-002',
        title: 'Hands-on Agentic AI & LLM Orchestration Workshop',
        short_description: 'Master LangGraph, Google Gemini API, and autonomous multi-agent tool execution in a comprehensive 2-day hands-on bootcamp.',
        description: 'Deep dive into architecting resilient agent swarms, memory systems, and deterministic tool execution pipelines. Every participant gets dedicated GPU cluster access and Google Cloud certification voucher.',
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
        prizes: 'Official Certificate of Excellence + Google Cloud $100 Credits',
        rules: 'Prerequisites: Basic Python proficiency. Bring your own laptop with Node/Python 3.10+ installed.'
      },
      {
        id: 'evt-003',
        title: 'Guest Lecture: Scalable Microservices & Kubernetes in Fintech',
        short_description: 'Executive talk by Principal Architect from Stripe on high-throughput distributed transaction processing.',
        description: 'Discover how modern financial infrastructure handles millions of idempotent transactions per second without data drift.',
        category: 'guest_lecture',
        organizer: 'Apex Tech Society',
        organizing_department: 'Information Technology',
        faculty_coordinator: 'Dr. Rajesh Nair',
        student_coordinator: 'Karan Mehra',
        venue: 'Newton Lecture Theatre 101 & Zoom',
        mode: 'online',
        start_date: new Date(Date.now() + 8 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 8 * 86400000 + 7200000).toISOString(),
        registration_deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
        capacity: 300,
        registered_count: 240,
        min_team_size: 1,
        max_team_size: 1,
        is_published: true,
        status: 'published',
        cover_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
        prizes: 'Q&A Fast-Track Interview Referral for Summer 2026 Internships',
        rules: 'Open to all departments and all academic years.'
      },
      {
        id: 'evt-004',
        title: 'CyberShield 2026: Campus CTF (Capture The Flag)',
        short_description: 'Competitive ethical hacking competition covering web exploitation, reverse engineering, cryptography, and network forensics.',
        description: 'Test your penetration testing and defense skills in simulated red-team vs blue-team scenarios designed by top security researchers.',
        category: 'coding_competition',
        organizer: 'Cyber Security Research Wing',
        organizing_department: 'Computer Science & Engineering',
        faculty_coordinator: 'Prof. Arvind Swamy',
        student_coordinator: 'Siddharth Roy',
        venue: 'Cyber Range Lab (Block B 3rd Floor)',
        mode: 'offline',
        start_date: new Date(Date.now() + 12 * 86400000).toISOString(),
        end_date: new Date(Date.now() + 13 * 86400000).toISOString(),
        registration_deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
        capacity: 80,
        registered_count: 65,
        min_team_size: 1,
        max_team_size: 3,
        is_published: true,
        status: 'published',
        cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
        prizes: '1st: ₹40,000 | 2nd: ₹20,000 | Bug Bounty Hardware Kits',
        rules: 'Attacking scoring servers or teammates infrastructure will lead to instant disqualification.'
      }
    ],
    eventRegistrations: [
      {
        id: 'reg-001',
        event_id: 'evt-001',
        user_id: 'usr-student-01',
        status: 'confirmed',
        registration_type: 'team',
        team_name: 'VectorZero',
        team_members: ['Alex Rivera (alex.rivera@apex.edu)', 'Maya Patel (maya.p@apex.edu)', 'Arjun Nair (arjun.n@apex.edu)'],
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    classrooms: [
      { id: 'rm-101', code: 'A-101', name: 'Lecture Hall A-101', building: 'Engineering Block A', floor: 1, capacity: 80, type: 'lecture_hall', status: 'available', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, power_load_kw: 3.4, temperature_c: 22.4, current_occupancy: 0 },
      { id: 'rm-204', code: 'B-204', name: 'Hall B-204', building: 'Science & Computing Block B', floor: 2, capacity: 70, type: 'lecture_hall', status: 'occupied', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: false, current_course: 'CS-301: Algorithms & Data Structures', current_faculty: 'Prof. Marcus Vance', power_load_kw: 4.8, temperature_c: 23.8, current_occupancy: 64 },
      { id: 'rm-302', code: 'B-302', name: 'AI & GPU Research Lab', building: 'Science & Computing Block B', floor: 3, capacity: 45, type: 'computing_lab', status: 'occupied', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, current_course: 'CS-302: Distributed Systems & Cloud', current_faculty: 'Dr. Elena Rostova', power_load_kw: 12.2, temperature_c: 20.1, current_occupancy: 42 },
      { id: 'rm-401', code: 'C-401', name: 'Robotics & Embedded Systems Lab', building: 'Technology Tower C', floor: 4, capacity: 40, type: 'computing_lab', status: 'available', has_projector: true, has_ac: true, has_smartboard: false, has_video_conferencing: false, power_load_kw: 1.8, temperature_c: 21.9, current_occupancy: 0 },
      { id: 'rm-501', code: 'AUD-1', name: 'Central Auditorium Hall 1', building: 'Central Campus Complex', floor: 1, capacity: 450, type: 'auditorium', status: 'reserved', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, current_course: 'Apex InnoHacks Rehearsal', current_faculty: 'Student Affairs', power_load_kw: 28.6, temperature_c: 22.0, current_occupancy: 25 },
      { id: 'rm-202', code: 'LIB-202', name: 'Collaborative Study Seminar Room', building: 'Central Library', floor: 2, capacity: 30, type: 'seminar_hall', status: 'available', has_projector: true, has_ac: true, has_smartboard: true, has_video_conferencing: true, power_load_kw: 2.1, temperature_c: 22.5, current_occupancy: 0 }
    ],
    notices: [
      {
        id: 'ntc-001',
        title: 'Mid-Semester Examinations Schedule & Seating Allotment Fall 2026',
        category: 'academic',
        urgency: 'high',
        target_audience: 'all_students',
        department: 'Controller of Examinations',
        publish_date: new Date(Date.now() - 48 * 3600000).toISOString(),
        summary: '• Mid-Semester examinations commence on November 24, 2026 across two daily slots (9:30 AM and 2:00 PM).\n• Hall tickets will be verified with biometrics/QR scanning at entrance doors.\n• Students with attendance below 75% must resolve pending recovery dossiers before November 20.',
        action_items: [
          'Download and print hall ticket before Nov 20, 2026',
          'Verify room allocation 24 hours prior to first exam',
          'Carry physical College Identity Card'
        ],
        deadlines: [
          { item: 'Hall Ticket Verification Window Closes', date: '2026-11-20T17:00:00Z' },
          { item: 'First Exam Session (CS-301 / EC-302)', date: '2026-11-24T09:30:00Z' }
        ]
      },
      {
        id: 'ntc-002',
        title: 'Google Cloud & AI Innovation Grant Opportunity for Final & 3rd Year Students',
        category: 'research_grant',
        urgency: 'medium',
        target_audience: 'computer_science',
        department: 'Center for Industry Collaboration',
        publish_date: new Date(Date.now() - 12 * 3600000).toISOString(),
        summary: '• Apex Institute has partnered with Google Cloud to sponsor 20 student-led generative AI and multi-agent projects with $5,000 micro-grants.\n• Open to individual teams of up to 3 students.\n• Shortlisted proposals get direct mentorship from DeepMind researchers.',
        action_items: [
          'Submit 2-page project proposal in PDF format',
          'Include faculty mentor endorsement signature',
          'Register team through CampusFlow Events portal'
        ],
        deadlines: [
          { item: 'Project Proposal Submission Deadline', date: '2026-11-30T23:59:59Z' }
        ]
      }
    ],
    grievances: [
      {
        id: 'grv-001',
        ticket_number: 'GRV-2026-042',
        student_id: 'usr-student-01',
        student_name: 'Alex Rivera',
        category: 'infrastructure',
        title: 'Projector HDMI flickering continuously in Hall B-204',
        description: 'The ceiling projector keeps cutting out during slides, making data structures code walkthroughs difficult to see from the middle rows.',
        department_assigned: 'Campus Facilities & IT Services',
        urgency: 'medium',
        status: 'in_progress',
        sla_hours: 24,
        created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
        resolution_notes: 'Technician dispatched at 1:30 PM. High-speed 4K fiber HDMI cable replacement scheduled.'
      }
    ],
    lostFound: [
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
        ai_tags: ['charger', 'usb-c', 'lenovo', 'black', 'electronics']
      },
      {
        id: 'lf-002',
        type: 'lost',
        title: 'Casio fx-991CW ClassWiz Scientific Calculator',
        description: 'White scientific calculator with blue protective slide case and serial sticker ending in -882.',
        location_found: 'Engineering Block A, Room A-101',
        reported_by: 'Maya Patel (21BCE1098)',
        reported_at: new Date(Date.now() - 22 * 3600000).toISOString(),
        status: 'reported_lost',
        image_url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=400&q=80',
        ai_tags: ['calculator', 'casio', 'white', 'academics']
      }
    ],
    orchestratorTasks: [
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
          { agent: 'Timetable Agent', action: 'Selected qualified proxy faculty Dr. Sarah Jenkins (Algorithms subject specialist)', status: 'completed' },
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
      },
      {
        id: 'orch-task-102',
        title: 'Automated 75% Attendance Risk Warning Dispatch',
        trigger_event: 'Bi-weekly scheduled attendance compliance sweep',
        status: 'completed',
        requires_admin_approval: false,
        urgency: 'medium',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        agents_involved: ['Attendance Intelligence Agent', 'Academic Recovery Agent', 'Notification Agent'],
        summary: 'Analyzed 1,420 students. 18 students flagged under 75% threshold. Generated 18 personalized recovery revision schedules and notified students safely.',
        steps: [
          { agent: 'Attendance Intelligence Agent', action: 'Calculated attendance rates across all 24 departments', status: 'completed' },
          { agent: 'Academic Recovery Agent', action: 'Compiled personalized recovery trajectories for 18 at-risk students', status: 'completed' },
          { agent: 'Notification Agent', action: 'Delivered tailored low-stress recovery notices without duplicates', status: 'completed' }
        ]
      }
    ],
    timetables: [
      { id: 'tt-1', day: 'Monday', time: '09:00 - 10:30', course_code: 'CS-301', course_name: 'Algorithms & Data Structures', room: 'Hall B-204', faculty: 'Prof. Marcus Vance', type: 'Lecture' },
      { id: 'tt-2', day: 'Monday', time: '11:00 - 12:30', course_code: 'CS-302', course_name: 'Distributed Systems & Cloud', room: 'Lab 3', faculty: 'Prof. Marcus Vance', type: 'Lab' },
      { id: 'tt-3', day: 'Tuesday', time: '10:00 - 11:30', course_code: 'CS-303', course_name: 'Database Management Systems', room: 'Hall A-101', faculty: 'Dr. Elena Rostova', type: 'Lecture' },
      { id: 'tt-4', day: 'Wednesday', time: '09:00 - 11:00', course_code: 'CS-301', course_name: 'Algorithms Problem Solving Lab', room: 'Computing Lab 402', faculty: 'Prof. Marcus Vance', type: 'Lab' },
      { id: 'tt-5', day: 'Thursday', time: '14:00 - 15:30', course_code: 'CS-304', course_name: 'Agentic AI & Swarm Architecture', room: 'Hall B-204', faculty: 'Dr. Sarah Jenkins', type: 'Seminar' }
    ],
    assignments: [
      { id: 'asg-01', course_code: 'CS-301', title: 'Dynamic Programming & Graph Traversal Implementation', due_date: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'pending', max_marks: 50, submission_type: 'code_repo' },
      { id: 'asg-02', course_code: 'CS-302', title: 'Kubernetes Cluster Deployment on GCP', due_date: new Date(Date.now() + 96 * 3600000).toISOString(), status: 'submitted', max_marks: 30, submission_type: 'pdf' },
      { id: 'asg-03', course_code: 'CS-303', title: 'Relational Normalization & BCNF Proofs', due_date: new Date(Date.now() - 24 * 3600000).toISOString(), status: 'late_pending', max_marks: 40, submission_type: 'pdf' }
    ]
  };

  // If store is null or invalid, use initialStore
  if (!store || typeof store !== 'object') {
    store = { ...initialStore };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }

  // Ensure all collections from initialStore exist
  let changed = false;
  for (const key of Object.keys(initialStore)) {
    if (!store[key] || !Array.isArray(store[key]) || store[key].length === 0) {
      store[key] = initialStore[key];
      changed = true;
    }
  }

  // Ensure active sessions have valid future expiry date
  if (Array.isArray(store.sessions)) {
    const active = store.sessions.find(s => s.status === 'active');
    if (active) {
      const exp = new Date(active.expires_at || active.expiresAt).getTime();
      if (isNaN(exp) || exp < Date.now()) {
        active.expires_at = new Date(Date.now() + 30 * 60000).toISOString();
        active.expiresAt = active.expires_at;
        changed = true;
      }
    } else {
      const newActive = {
        id: 'ses-' + Date.now(),
        class_id: 'cls-cs301',
        classId: 'cls-cs301',
        className: 'Algorithms & Data Structures (CS-301)',
        subject_id: 'sub-01',
        subject_name: 'Algorithms & Data Structures',
        subject_code: 'CS-301',
        faculty_id: 'usr-faculty-01',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
        status: 'active',
        rawToken: 'ACTIVE_TOKEN_CS301',
        token: 'ACTIVE_TOKEN_CS301',
        token_hash: 'ACTIVE_TOKEN_CS301',
        totalAttended: 12,
        room: 'Hall B-204'
      };
      store.sessions.unshift(newActive);
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  return store;
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// Helper to safely execute API call with transparent client fallback if offline or backend is unreachable
async function withFallback(apiCall, fallbackFn) {
  // If running in cloud (Vercel) without a live backend, skip direct network timeout immediately
  if (isCloudWithoutBackend) {
    return await fallbackFn();
  }
  try {
    const res = await apiCall();
    return res;
  } catch (err) {
    console.info('ℹ️ Running in resilient client mode (Cloud/Offline Adapter):', err.message);
    try {
      return await fallbackFn();
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
}

// ----------------------------------------------------------------------
// EXPORTED API WRAPPERS
// ----------------------------------------------------------------------

export const authApi = {
  register: (data) => withFallback(
    () => api.post('/auth/register', data).then(r => r.data),
    () => {
      const store = getStore();
      const existing = store.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        const token = 'demo-jwt-student-' + existing.id;
        return {
          success: true,
          message: 'Account signed in successfully',
          data: { profile: existing, token }
        };
      }
      const newUser = {
        id: 'usr-' + Date.now(),
        role: 'student',
        full_name: data.full_name || 'Student',
        name: data.full_name || 'Student',
        email: data.email,
        reg_number: '21BCE' + Math.floor(1000 + Math.random() * 9000),
        department: 'Computer Science & Engineering',
        institution_name: 'Apex Institute of Technology'
      };
      store.users.push(newUser);
      saveStore(store);
      const token = 'demo-jwt-student-' + newUser.id;
      return {
        success: true,
        message: 'Account registered successfully',
        data: { profile: newUser, token }
      };
    }
  ),

  login: (data) => withFallback(
    () => api.post('/auth/login', data).then(r => r.data),
    () => {
      const store = getStore();
      let user = store.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (!user) {
        const role = data.email.includes('faculty') ? 'faculty' :
                     data.email.includes('admin') ? 'admin' : 'student';
        const namePart = (data.email.split('@')[0] || 'User').replace(/[._]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        user = {
          id: 'usr-' + Date.now(),
          role,
          full_name: formattedName,
          name: formattedName,
          email: data.email,
          reg_number: '21BCE' + Math.floor(1000 + Math.random() * 9000),
          department: 'Computer Science & Engineering',
          institution_name: 'Apex Institute of Technology'
        };
        store.users.push(user);
        saveStore(store);
      }
      const token = 'demo-jwt-' + user.role + '-' + user.id;
      return {
        success: true,
        message: 'Login successful',
        data: { profile: user, token }
      };
    }
  ),

  getMe: () => withFallback(
    () => api.get('/auth/me').then(r => r.data),
    () => {
      const store = getStore();
      const savedUserStr = localStorage.getItem('campusflow_user');
      if (savedUserStr) {
        try {
          return { success: true, data: JSON.parse(savedUserStr) };
        } catch (e) {}
      }
      const currentRole = localStorage.getItem('campusflow_role') || 'student';
      const user = store.users.find(u => u.role === currentRole) || store.users[0];
      return { success: true, data: user };
    }
  ),

  logout: () => withFallback(
    () => api.post('/auth/logout').then(r => r.data),
    () => ({ success: true, message: 'Logged out successfully' })
  ),

  updateProfile: (data) => withFallback(
    () => api.patch('/auth/profile', data).then(r => r.data),
    () => {
      const store = getStore();
      if (store.users[0]) Object.assign(store.users[0], data);
      saveStore(store);
      return { success: true, data: store.users[0], message: 'Profile updated' };
    }
  ),

  switchRole: (role) => withFallback(
    () => api.post('/auth/switch-role', { role }).then(r => r.data),
    () => {
      const store = getStore();
      const user = store.users.find(u => u.role === role) || {
        id: 'usr-' + role + '-01',
        role,
        full_name: role.toUpperCase() + ' Demo User',
        name: role.toUpperCase() + ' Demo User',
        email: `${role}@apex.edu`,
        department: 'Computer Science & Engineering',
        institution_name: 'Apex Institute of Technology'
      };
      return { success: true, data: user };
    }
  )
};

export const classApi = {
  list: () => withFallback(
    () => api.get('/classes').then(r => r.data),
    () => ({ success: true, data: getStore().classes })
  ),
  getById: (id) => withFallback(
    () => api.get(`/classes/${id}`).then(r => r.data),
    () => {
      const cls = getStore().classes.find(c => c.id === id) || getStore().classes[0];
      return { success: true, data: cls };
    }
  ),
  getSubjects: (classId) => withFallback(
    () => api.get(`/classes/${classId}/subjects`).then(r => r.data),
    () => {
      const store = getStore();
      const cls = store.classes.find(c => c.id === classId) || store.classes[0];
      return {
        success: true,
        data: cls?.subjects || [
          { id: 'sub-01', code: 'CS-301', name: 'Algorithms & Data Structures' },
          { id: 'sub-02', code: 'CS-302', name: 'Distributed Systems & Cloud Computing' }
        ]
      };
    }
  ),
  getAttendanceSummary: (classId) => withFallback(
    () => api.get(`/classes/${classId}/attendance-summary`).then(r => r.data),
    () => ({
      success: true,
      data: {
        totalEnrolled: 64,
        averageAttendance: '92.4%',
        studentsAtRisk: 2,
        sessionsCount: 14
      }
    })
  )
};

export const sessionApi = {
  list: (params) => withFallback(
    () => api.get('/sessions', { params }).then(r => r.data),
    () => {
      const store = getStore();
      let sessions = store.sessions || [];
      if (params?.status) {
        sessions = sessions.filter(s => s.status === params.status);
      }
      return { success: true, data: sessions };
    }
  ),
  create: (data) => withFallback(
    () => api.post('/sessions', data).then(r => {
      const created = r.data?.session || r.data?.data?.session || r.data?.data || r.data;
      if (created && created.id) {
        const store = getStore();
        store.sessions = store.sessions || [];
        store.sessions = [created, ...store.sessions.filter(s => s.id !== created.id)];
        saveStore(store);
      }
      return r.data;
    }),
    () => {
      const store = getStore();
      const rawToken = 'CF_QR_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const duration = parseInt(data.duration_minutes || data.durationMinutes || 15, 10);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + duration * 60000);

      const targetClass = (store.classes && store.classes.find(c => c.id === (data.class_id || data.classId)))
        || (store.classes && store.classes[0])
        || { id: 'cls-cs301', name: 'Algorithms & Data Structures', code: 'CS-301' };

      const newSession = {
        id: 'ses-' + Date.now(),
        classId: targetClass.id,
        class_id: targetClass.id,
        className: (targetClass.name || 'Class') + ' (' + (targetClass.code || 'CS-301') + ')',
        subject_id: data.subject_id || data.subjectId || 'sub-01',
        subject_name: targetClass.name || 'Algorithms & Data Structures',
        subject_code: targetClass.code || 'CS-301',
        faculty_id: 'usr-faculty-01',
        facultyId: 'usr-faculty-01',
        start_time: now.toISOString(),
        startTime: now.toISOString(),
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'active',
        rawToken,
        token: rawToken,
        token_hash: rawToken,
        tokenHash: rawToken,
        totalAttended: 0,
        room: data.room || 'Hall B-204'
      };
      store.sessions = store.sessions || [];
      store.sessions.unshift(newSession);
      saveStore(store);
      return {
        success: true,
        data: newSession,
        session: newSession,
        message: 'Dynamic QR attendance session launched'
      };
    }
  ),
  getActive: () => withFallback(
    () => api.get('/sessions/active').then(r => r.data),
    () => {
      const active = getStore().sessions.find(s => s.status === 'active');
      return { success: true, data: active || null };
    }
  ),
  getById: (id) => withFallback(
    () => api.get(`/sessions/${id}`).then(r => {
      const serverData = r.data?.data || r.data?.session || r.data;
      if (serverData) {
        const store = getStore();
        const local = (store.sessions || []).find(s => s.id === id);
        if (local && (local.rawToken || local.token) && !serverData.rawToken && !serverData.token) {
          serverData.token = local.token || local.rawToken;
          serverData.rawToken = local.rawToken || local.token;
        }
      }
      return r.data;
    }),
    () => {
      const store = getStore();
      const sessions = store.sessions || [];
      const s = sessions.find(x => x.id === id) || sessions.find(x => x.status === 'active') || sessions[0] || {
        id: id || 'ses-102',
        className: 'Algorithms & Data Structures (CS-301)',
        subject_name: 'Algorithms & Data Structures',
        subject_code: 'CS-301',
        section: 'Section A',
        room: 'Hall B-204',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
        rawToken: 'ACTIVE_TOKEN_CS301',
        token: 'ACTIVE_TOKEN_CS301',
        totalAttended: 0
      };
      const token = s.rawToken || s.token || 'ACTIVE_TOKEN_CS301';
      const completeSession = {
        ...s,
        token,
        rawToken: token,
        token_hash: s.token_hash || token,
        tokenHash: s.tokenHash || token,
        status: s.status || 'active',
        starts_at: s.starts_at || s.start_time || s.startTime || new Date().toISOString(),
        expires_at: s.expires_at || s.expiresAt || new Date(Date.now() + 15 * 60000).toISOString()
      };
      return { success: true, data: completeSession, session: completeSession };
    }
  ),
  close: (id) => withFallback(
    () => api.post(`/sessions/${id}/close`).then(r => r.data),
    () => {
      const store = getStore();
      const target = store.sessions.find(s => s.id === id);
      if (target) {
        target.status = 'closed';
        saveStore(store);
      }
      return { success: true, message: 'Session closed', data: target };
    }
  ),
  verifyToken: (sessionId, token) => withFallback(
    () => api.post(`/sessions/${sessionId}/verify-token`, { token }).then(r => r.data),
    () => ({ success: true, message: 'Token verified' })
  )
};

export const attendanceApi = {
  getSessionAttendees: (sessionId) => withFallback(
    () => api.get(`/attendance/session/${sessionId}`).then(r => r.data),
    () => ({
      success: true,
      data: getStore().attendance.filter(a => a.sessionId === sessionId || a.session_id === sessionId)
    })
  ),
  getSessionRecords: (sessionId) => withFallback(
    () => api.get(`/attendance/session/${sessionId}`).then(r => r.data),
    () => ({
      success: true,
      data: getStore().attendance.filter(a => a.sessionId === sessionId || a.session_id === sessionId)
    })
  ),
  scan: (payload) => withFallback(
    () => api.post('/attendance/scan', payload).then(r => r.data),
    () => {
      const store = getStore();
      if (!Array.isArray(store.attendance)) {
        store.attendance = [];
      }
      if (!Array.isArray(store.sessions)) {
        store.sessions = [];
      }
      const sessionId = payload.session_id || payload.sessionId || 'ses-102';
      const currentUser = JSON.parse(localStorage.getItem('campusflow_user') || '{}');
      const studentId = currentUser.id || 'usr-student-01';
      const studentName = currentUser.full_name || currentUser.name || 'Alex Rivera';
      const session = store.sessions.find(s => s.id === sessionId || s.status === 'active') || store.sessions[0];

      let existing = store.attendance.find(a =>
        (a.sessionId === sessionId || a.session_id === sessionId) &&
        (a.studentId === studentId || a.student_id === studentId)
      );

      if (existing) {
        return {
          success: true,
          data: existing,
          message: 'Attendance already recorded and verified for this session.'
        };
      }

      const newRecord = {
        id: 'att-' + Date.now(),
        sessionId: session ? session.id : sessionId,
        session_id: session ? session.id : sessionId,
        studentId,
        student_id: studentId,
        studentName,
        timestamp: new Date().toISOString(),
        recorded_at: new Date().toISOString(),
        status: 'present',
        attendance_status: 'present',
        method: 'qr_scan',
        class_name: session?.className || 'CS-301: Algorithms & Data Structures'
      };

      store.attendance.unshift(newRecord);
      if (session) {
        session.totalAttended = (session.totalAttended || 0) + 1;
      }
      saveStore(store);

      return {
        success: true,
        data: newRecord,
        message: 'Attendance recorded successfully! Check-in confirmed.'
      };
    }
  ),
  checkIn: (payload) => withFallback(
    () => api.post('/attendance/check-in', payload).then(r => r.data),
    () => {
      const store = getStore();
      const sessionId = payload.session_id || payload.sessionId || 'ses-102';
      const currentUser = JSON.parse(localStorage.getItem('campusflow_user') || '{}');
      const studentId = currentUser.id || 'usr-student-01';
      const studentName = currentUser.full_name || currentUser.name || 'Alex Rivera';
      const session = store.sessions.find(s => s.id === sessionId || s.status === 'active') || store.sessions[0];

      let existing = store.attendance.find(a =>
        (a.sessionId === sessionId || a.session_id === sessionId) &&
        (a.studentId === studentId || a.student_id === studentId)
      );

      if (existing) {
        return {
          success: true,
          data: existing,
          message: 'Attendance already recorded and verified for this session.'
        };
      }

      const newRecord = {
        id: 'att-' + Date.now(),
        sessionId: session ? session.id : sessionId,
        session_id: session ? session.id : sessionId,
        studentId,
        student_id: studentId,
        studentName,
        timestamp: new Date().toISOString(),
        recorded_at: new Date().toISOString(),
        status: 'present',
        attendance_status: 'present',
        method: 'qr_scan',
        class_name: session?.className || 'CS-301: Algorithms & Data Structures'
      };
      store.attendance.unshift(newRecord);
      if (session) {
        session.totalAttended = (session.totalAttended || 0) + 1;
      }
      saveStore(store);
      return { success: true, data: newRecord, message: 'Attendance recorded successfully!' };
    }
  ),
  getMyHistory: () => withFallback(
    () => api.get('/attendance/my-history').then(r => r.data),
    () => ({ success: true, data: getStore().attendance })
  ),
  getSessionRecords: (sessionId) => withFallback(
    () => api.get(`/attendance/session/${sessionId}`).then(r => r.data),
    () => ({ success: true, data: getStore().attendance.filter(a => a.sessionId === sessionId) })
  ),
  getStats: () => withFallback(
    () => api.get('/attendance/stats').then(r => r.data),
    () => ({
      success: true,
      data: {
        totalSessions: 28,
        attendedSessions: 26,
        attendancePercentage: '92.8%',
        threshold: 75,
        riskLevel: 'safe'
      }
    })
  )
};

export const caseApi = {
  submit: (data) => withFallback(
    () => api.post('/cases', data).then(r => r.data),
    () => {
      const store = getStore();
      const newCase = {
        id: 'rec-' + Date.now(),
        caseNumber: 'CF-2026-' + Math.floor(1000 + Math.random() * 9000),
        case_number: 'CF-2026-' + Math.floor(1000 + Math.random() * 9000),
        studentId: 'usr-student-01',
        student_id: 'usr-student-01',
        studentName: 'Alex Rivera',
        studentReg: '21BCE1042',
        classId: data.classId || 'cls-cs301',
        className: 'CS-301: Algorithms & Data Structures',
        sessionId: data.sessionId || 'ses-101',
        category: data.category || 'camera_failure',
        categoryLabel: data.categoryLabel || 'Camera / QR Scanner Glitch',
        status: 'pending_faculty_review',
        description: data.description,
        occurrenceTime: data.occurrenceTime || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        aiDossier: {
          integrityRisk: 'low',
          integrityExplanation: 'Device telemetry consistent with active session window. No duplicate scans detected.',
          recoveryFindings: 'Session active at claimed time. High historical compliance.',
          evidenceTimeline: [
            { time: new Date().toLocaleTimeString(), type: 'system', event: 'Issue report submitted by student' }
          ],
          coordinatorRecommendation: 'Recommend FACULTY APPROVAL.'
        },
        decision: null
      };
      store.cases.unshift(newCase);
      saveStore(store);
      return { success: true, data: newCase, message: 'Recovery ticket submitted successfully!' };
    }
  ),
  getMyCases: () => withFallback(
    () => api.get('/cases/my-cases').then(r => r.data),
    () => ({ success: true, data: getStore().cases })
  ),
  getFacultyQueue: () => withFallback(
    () => api.get('/cases/faculty-queue').then(r => r.data),
    () => ({ success: true, data: getStore().cases })
  ),
  getById: (id) => withFallback(
    () => api.get(`/cases/${id}`).then(r => r.data),
    () => {
      const item = getStore().cases.find(c => c.id === id) || getStore().cases[0];
      return { success: true, data: item };
    }
  ),
  updateDecision: (id, payload) => withFallback(
    () => api.post(`/cases/${id}/decision`, payload).then(r => r.data),
    () => {
      const store = getStore();
      const targetCase = store.cases.find(c => c.id === id);
      if (targetCase) {
        targetCase.status = payload.decision === 'approved' ? 'approved' : 'rejected';
        targetCase.decision = {
          decision: targetCase.status,
          reason: payload.reason,
          decidedAt: new Date().toISOString(),
          facultyName: payload.facultyName || 'Prof. Marcus Vance'
        };
        saveStore(store);
      }
      return {
        success: true,
        data: targetCase,
        message: `Decision successfully recorded: Case was ${targetCase?.status?.toUpperCase()}`
      };
    }
  ),
  list: (caseId) => withFallback(
    () => api.get(`/cases/${caseId}/decisions`).then(r => r.data),
    () => ({ success: true, data: [] })
  )
};

// ----------------------------------------------------------------------
// NEW HACKATHONS & WORKSHOPS HUB API (EVENTS)
// ----------------------------------------------------------------------
export const eventApi = {
  list: (params) => withFallback(
    () => api.get('/events', { params }).then(r => r.data),
    () => {
      const store = getStore();
      let list = store.events || [];
      if (params?.category && params.category !== 'all') {
        list = list.filter(e => e.category === params.category);
      }
      if (params?.mode && params.mode !== 'all') {
        list = list.filter(e => e.mode === params.mode);
      }
      return { success: true, data: list };
    }
  ),

  getById: (id) => withFallback(
    () => api.get(`/events/${id}`).then(r => r.data),
    () => {
      const store = getStore();
      const evt = store.events.find(e => e.id === id) || store.events[0];
      const isRegistered = store.eventRegistrations.some(r => r.event_id === id);
      return { success: true, data: { ...evt, is_registered: isRegistered } };
    }
  ),

  getRecommendations: () => withFallback(
    () => api.get('/events/recommendations').then(r => r.data),
    () => {
      const store = getStore();
      return {
        success: true,
        data: {
          recommendedEvents: store.events.slice(0, 2),
          matchReason: 'Top matches for Computer Science & Engineering students interested in Autonomous Multi-Agent AI and Hackathons.'
        }
      };
    }
  ),

  register: (id, payload) => withFallback(
    () => api.post(`/events/${id}/register`, payload).then(r => r.data),
    () => {
      const store = getStore();
      const evt = store.events.find(e => e.id === id);
      const isFull = evt && evt.registered_count >= evt.capacity;
      const newReg = {
        id: 'reg-' + Date.now(),
        event_id: id,
        user_id: 'usr-student-01',
        registration_type: payload.registrationType || 'individual',
        team_name: payload.teamName || null,
        team_members: payload.teamMembers || ['Alex Rivera (alex.rivera@apex.edu)'],
        status: isFull ? 'waitlisted' : 'confirmed',
        created_at: new Date().toISOString()
      };
      store.eventRegistrations.push(newReg);
      if (evt && !isFull) {
        evt.registered_count = (evt.registered_count || 0) + 1;
      }
      saveStore(store);
      return {
        success: true,
        data: newReg,
        message: isFull
          ? 'Event capacity reached! You have been placed on the verified waitlist.'
          : 'Registration confirmed! Event added to your interactive calendar.'
      };
    }
  ),

  create: (data) => withFallback(
    () => api.post('/events', data).then(r => r.data),
    () => {
      const store = getStore();
      const newEvt = {
        id: 'evt-' + Date.now(),
        title: data.title,
        short_description: data.short_description || data.description?.substring(0, 100),
        description: data.description,
        category: data.category || 'hackathon',
        organizer: data.organizer || 'College Administration',
        organizing_department: data.organizing_department || 'Computer Science & Engineering',
        venue: data.venue || 'Campus Auditorium',
        mode: data.mode || 'offline',
        start_date: data.start_date || new Date(Date.now() + 7 * 86400000).toISOString(),
        end_date: data.end_date || new Date(Date.now() + 8 * 86400000).toISOString(),
        registration_deadline: data.registration_deadline || new Date(Date.now() + 5 * 86400000).toISOString(),
        capacity: parseInt(data.capacity) || 100,
        registered_count: 0,
        min_team_size: parseInt(data.min_team_size) || 1,
        max_team_size: parseInt(data.max_team_size) || 4,
        is_published: true,
        status: 'published',
        cover_image: data.cover_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        prizes: data.prizes || 'Certificates & Merch',
        rules: data.rules || 'Standard institutional code of conduct applies.'
      };
      store.events.unshift(newEvt);
      saveStore(store);
      return { success: true, data: newEvt, message: 'Event successfully published to student catalog!' };
    }
  ),

  update: (id, data) => withFallback(
    () => api.put(`/events/${id}`, data).then(r => r.data),
    () => {
      const store = getStore();
      const idx = store.events.findIndex(e => e.id === id);
      if (idx !== -1) {
        store.events[idx] = { ...store.events[idx], ...data };
        saveStore(store);
      }
      return { success: true, message: 'Event updated successfully' };
    }
  ),

  delete: (id) => withFallback(
    () => api.delete(`/events/${id}`).then(r => r.data),
    () => {
      const store = getStore();
      store.events = store.events.filter(e => e.id !== id);
      saveStore(store);
      return { success: true, message: 'Event deleted' };
    }
  ),

  getRegistrations: (eventId) => withFallback(
    () => api.get(`/events/${eventId}/registrations`).then(r => r.data),
    () => {
      const store = getStore();
      const regs = store.eventRegistrations.filter(r => r.event_id === eventId);
      return { success: true, data: regs };
    }
  )
};

// ----------------------------------------------------------------------
// CAMPUS DIGITAL TWIN & SMART CLASSROOMS API
// ----------------------------------------------------------------------
export const classroomApi = {
  list: (params) => withFallback(
    () => api.get('/classrooms', { params }).then(r => r.data),
    () => {
      const store = getStore();
      let rooms = store.classrooms;
      if (params?.building && params.building !== 'all') {
        rooms = rooms.filter(r => r.building === params.building);
      }
      if (params?.type && params.type !== 'all') {
        rooms = rooms.filter(r => r.type === params.type);
      }
      if (params?.status && params.status !== 'all') {
        rooms = rooms.filter(r => r.status === params.status);
      }
      return { success: true, data: rooms };
    }
  ),

  getDigitalTwinState: () => withFallback(
    () => api.get('/classrooms/digital-twin').then(r => r.data),
    () => {
      const store = getStore();
      const totalRooms = store.classrooms.length;
      const occupiedRooms = store.classrooms.filter(r => r.status === 'occupied').length;
      const availableRooms = store.classrooms.filter(r => r.status === 'available').length;
      const totalPowerLoad = store.classrooms.reduce((acc, r) => acc + (r.power_load_kw || 0), 0).toFixed(1);
      const avgTemp = (store.classrooms.reduce((acc, r) => acc + (r.temperature_c || 22), 0) / totalRooms).toFixed(1);

      return {
        success: true,
        data: {
          totalRooms,
          occupiedRooms,
          availableRooms,
          utilizationRate: Math.round((occupiedRooms / totalRooms) * 100),
          totalPowerLoadKw: totalPowerLoad,
          avgTemperatureC: avgTemp,
          buildings: [
            { name: 'Engineering Block A', occupied: 1, total: 2, energyStatus: 'normal' },
            { name: 'Science & Computing Block B', occupied: 2, total: 2, energyStatus: 'high_load' },
            { name: 'Technology Tower C', occupied: 0, total: 1, energyStatus: 'eco' },
            { name: 'Central Campus Complex', occupied: 1, total: 1, energyStatus: 'event_mode' }
          ],
          classrooms: store.classrooms
        }
      };
    }
  ),

  book: (payload) => withFallback(
    () => api.post('/classrooms/book', payload).then(r => r.data),
    () => {
      const store = getStore();
      const room = store.classrooms.find(r => r.id === payload.roomId || r.code === payload.roomCode);
      if (room) {
        room.status = 'reserved';
        room.current_course = payload.purpose || 'Special Workshop';
        saveStore(store);
      }
      return { success: true, message: `Room ${room?.name || 'Classroom'} reserved successfully!` };
    }
  )
};

// ----------------------------------------------------------------------
// AI STUDENT SUPPORT COPILOT API
// ----------------------------------------------------------------------
// CAMPUSFLOW AI COPILOT API
// ----------------------------------------------------------------------
export const copilotApi = {
  chat: ({ query, conversationId, role = 'student' }) => withFallback(
    () => api.post('/copilot/chat', { query, conversationId }).then(r => r.data),
    () => {
      const store = getStore();
      if (!store.ai_conversations) store.ai_conversations = [];
      if (!store.ai_messages) store.ai_messages = [];

      let convId = conversationId;
      let conv = store.ai_conversations.find(c => c.id === convId);
      if (!conv) {
        convId = 'conv-' + Date.now();
        conv = {
          id: convId,
          title: query.slice(0, 32) + (query.length > 32 ? '...' : ''),
          topic: 'general',
          is_pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        store.ai_conversations.unshift(conv);
      } else {
        conv.updated_at = new Date().toISOString();
      }

      // Record User Message
      const userMsg = {
        id: 'msg-u-' + Date.now(),
        conversation_id: convId,
        sender: 'user',
        role: 'user',
        content: query.trim(),
        chips: [],
        tool_calls: [],
        agent_trace: [],
        created_at: new Date().toISOString()
      };
      store.ai_messages.push(userMsg);

      // Analyze intent locally
      const lower = query.toLowerCase();
      let answer = '';
      let topic = 'general';
      let chips = ['Check my attendance', 'Show upcoming hackathons', 'What classes do I have today?'];
      let richCard = null;
      let toolExecuted = null;
      const agentTrace = [
        { agent: 'CampusFlow Orchestrator', action: 'Analyzing intent & authorized context', status: 'completed' }
      ];

      if (lower.includes('attendance') || lower.includes('percentage') || lower.includes('threshold') || lower.includes('shortage')) {
        topic = 'attendance';
        agentTrace.push({ agent: 'Attendance Intelligence Agent', action: 'Audited attendance ledger and verified 75% threshold', status: 'completed' });
        answer = "Your verified attendance across all enrolled subjects is **92.8%** (26/28 sessions attended), safely above the mandatory institutional **75.0% threshold**.\n\n• **CS-301 Algorithms & Data Structures**: 93.3% (14/15 sessions)\n• **CS-302 Distributed Systems**: 92.3% (12/13 sessions)\n\nYou can miss up to 3 more consecutive sessions without falling below 75%. Keep up the strong consistency!";
        chips = ['View attendance ledger', 'Scan QR Code Now', 'Exam Regulations'];
        richCard = {
          type: 'attendance_summary',
          overallPercentage: '92.8%',
          threshold: 75.0,
          totalSessions: 28,
          attendedSessions: 26,
          status: 'safe',
          courses: [
            { code: 'CS-301', name: 'Algorithms & Data Structures', attended: 14, total: 15, pct: '93.3%' },
            { code: 'CS-302', name: 'Distributed Systems', attended: 12, total: 13, pct: '92.3%' }
          ]
        };
      } else if (lower.includes('register me') || lower.includes('sign me up') || (lower.includes('register') && lower.includes('inno'))) {
        topic = 'events';
        agentTrace.push({ agent: 'Notification & Registration Agent', action: 'Verified student eligibility and booked team slot', status: 'completed' });
        toolExecuted = {
          toolName: 'register_for_event',
          status: 'completed',
          details: { eventTitle: 'Apex InnoHacks 2026', registrationId: 'reg-' + Date.now(), status: 'Confirmed' }
        };
        answer = "🎉 **Registration Confirmed!** You have been registered for **Apex InnoHacks 2026**.\n\n• **Event:** Apex InnoHacks 2026: Campus Smart Hackathon\n• **Dates:** November 20–22, 2026 (36-Hour National Hackathon)\n• **Venue:** Auditorium Hall 1 & Advanced Computing Lab\n• **Prize Pool:** ₹1,50,000 Cash Pool\n• **Pass Status:** Confirmed (Team Lead)\n\nYour pass is pinned to your profile and added to your Event Calendar.";
        chips = ['View Event Calendar', 'Add Team Members', 'Hackathon Guidelines'];
        richCard = {
          type: 'event_registration_success',
          eventTitle: 'Apex InnoHacks 2026',
          category: 'Hackathon',
          venue: 'Auditorium Hall 1',
          eventDate: 'Nov 20-22, 2026',
          status: 'Confirmed'
        };
      } else if (lower.includes('hackathon') || lower.includes('event') || lower.includes('workshop')) {
        topic = 'events';
        agentTrace.push({ agent: 'Event Discovery Agent', action: 'Matched upcoming campus competitions & hackathons', status: 'completed' });
        answer = "Here are the top upcoming events and competitions organized on campus:\n\n1. 🏆 **Apex InnoHacks 2026: Campus Smart Hackathon**\n   • **Category:** National 36h Hackathon | **Prizes:** ₹1,50,000 Cash Pool\n   • **Focus Tracks:** Multi-Agent AI, Smart Campus IoT, Green Computing\n   • **Registration Deadline:** In 3 days (Nov 17)\n\n2. 🤖 **Hands-on Agentic AI & LLM Systems Workshop**\n   • **Category:** Technical Workshop | **Venue:** Turing Lab 402\n   • **Focus:** Gemini 2.0 & Autonomous Swarms\n\nWould you like me to register you for **Apex InnoHacks 2026** right now?";
        chips = ['Register me for InnoHacks', 'Open Events Hub', 'Show Workshops Only'];
        richCard = {
          type: 'event_card',
          events: [
            { id: 'evt-001', title: 'Apex InnoHacks 2026', category: 'Hackathon', date: 'Nov 20-22, 2026', venue: 'Auditorium Hall 1', deadline: 'In 3 days', prizes: '₹1.5 Lakhs' },
            { id: 'evt-002', title: 'Autonomous Multi-Agent AI Workshop', category: 'Workshop', date: 'Nov 25, 2026', venue: 'Turing Lab 402', deadline: 'In 7 days', prizes: 'Hardware Kits' }
          ]
        };
      } else if (lower.includes('timetable') || lower.includes('class') || lower.includes('schedule') || lower.includes('today')) {
        topic = 'timetable';
        agentTrace.push({ agent: 'Smart Timetable & Resource Agent', action: 'Retrieved classroom digital twin and schedule', status: 'completed' });
        answer = "Here is your academic schedule for today (**Semester 6 - CSE**):\n\n• **09:00 AM – 10:30 AM**: **CS-301 Algorithms & Data Structures** in **Hall B-204** with Prof. Marcus Vance *(Completed)*\n• **11:00 AM – 12:30 PM**: **CS-302 Distributed Systems Lab** in **Computing Lab 3** with Dr. Sarah Jenkins\n• **02:00 PM – 03:30 PM**: **CS-303 Web Architecture** in **Seminar Hall 1**\n\n📍 Hall B-204 is on Floor 2 of the Academic Block, equipped with smart projection and AC.";
        chips = ['Find available study rooms', 'Check assignment deadlines', 'View Campus Digital Twin'];
        richCard = {
          type: 'timetable_card',
          schedule: [
            { time: '09:00 - 10:30 AM', subject: 'Algorithms & Data Structures (CS-301)', room: 'Hall B-204', faculty: 'Prof. Marcus Vance', status: 'completed' },
            { time: '11:00 - 12:30 PM', subject: 'Distributed Systems Lab (CS-302)', room: 'Computing Lab 3', faculty: 'Dr. Sarah Jenkins', status: 'upcoming' }
          ]
        };
      } else if (lower.includes('assignment') || lower.includes('homework') || lower.includes('deadline') || lower.includes('due') || lower.includes('study plan')) {
        topic = 'assignments';
        agentTrace.push({ agent: 'Academic Recovery & Study Agent', action: 'Generated personalized revision priorities', status: 'completed' });
        answer = "You have **1 urgent assignment due**:\n\n1. ⚠️ **Dynamic Programming & Graph Optimizations (CS-301)**\n   • **Deadline:** **Due in 48 hours** (Nov 16, 11:59 PM)\n   • **Weightage:** 50 Marks (Continuous Internal Assessment)\n\n2. ⏳ **Distributed Key-Value Store with Raft (CS-302)**\n   • **Deadline:** Due in 5 days (Nov 19, 11:59 PM)\n\n📅 **Recommended Action:** Allocate 2 hours tonight for the Bellman-Ford module to guarantee on-time submission.";
        chips = ['Create my study timetable', 'Open assignment portal', 'Check exam dates'];
        richCard = {
          type: 'assignments_card',
          assignments: [
            { title: 'Dynamic Programming & Graph Optimizations', subject: 'CS-301 Algorithms', dueDate: 'In 2 days', urgency: 'urgent' },
            { title: 'Distributed Key-Value Store with Raft', subject: 'CS-302 Distributed Systems', dueDate: 'In 5 days', urgency: 'medium' }
          ]
        };
      } else {
        answer = `Hello! I am **CampusFlow AI** — your intelligent campus companion.\n\nI have real-time access to your student profile (Alex Rivera, 21BCE1042), attendance records, today's timetable, pending assignments, and campus events. How can I assist your campus life today?`;
        chips = ['What is my attendance percentage?', 'Find upcoming college hackathons', 'What assignments are due this week?', 'What classes do I have today?'];
      }

      // Record Assistant Message
      const botMsg = {
        id: 'msg-b-' + Date.now(),
        conversation_id: convId,
        sender: 'assistant',
        role: 'assistant',
        content: answer,
        chips,
        tool_calls: toolExecuted ? [toolExecuted] : [],
        agent_trace: agentTrace,
        rich_card: richCard,
        created_at: new Date().toISOString()
      };
      store.ai_messages.push(botMsg);
      saveStore(store);

      return {
        success: true,
        data: {
          conversationId: convId,
          message: botMsg,
          answer,
          chips,
          agentTrace,
          richCard,
          toolExecuted
        }
      };
    }
  ),

  ask: (query, context = {}) => withFallback(
    () => api.post('/copilot/ask', { query, context }).then(r => r.data),
    () => copilotApi.chat({ query, role: context?.role || 'student' })
  ),

  getConversations: () => withFallback(
    () => api.get('/copilot/conversations').then(r => r.data),
    () => {
      const store = getStore();
      if (!store.ai_conversations || store.ai_conversations.length === 0) {
        store.ai_conversations = [
          {
            id: 'conv-default-01',
            title: 'Academic & Hackathon Planning',
            topic: 'academics',
            is_pinned: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        saveStore(store);
      }
      return { success: true, data: store.ai_conversations };
    }
  ),

  createConversation: (title = 'New Conversation') => withFallback(
    () => api.post('/copilot/conversations', { title }).then(r => r.data),
    () => {
      const store = getStore();
      if (!store.ai_conversations) store.ai_conversations = [];
      if (!store.ai_messages) store.ai_messages = [];

      const newConv = {
        id: 'conv-' + Date.now(),
        title,
        topic: 'general',
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.ai_conversations.unshift(newConv);

      const greeting = {
        id: 'msg-g-' + Date.now(),
        conversation_id: newConv.id,
        sender: 'assistant',
        role: 'assistant',
        content: "Hello! I'm CampusFlow AI, your intelligent campus companion. What would you like help with today?",
        chips: [
          "What's my attendance percentage?",
          "What assignments are due this week?",
          "Find upcoming college hackathons",
          "What classes do I have today?"
        ],
        tool_calls: [],
        agent_trace: [],
        created_at: new Date().toISOString()
      };
      store.ai_messages.push(greeting);
      saveStore(store);

      return {
        success: true,
        data: {
          conversation: newConv,
          initialMessages: [greeting]
        }
      };
    }
  ),

  getMessages: (conversationId) => withFallback(
    () => api.get(`/copilot/conversations/${conversationId}/messages`).then(r => r.data),
    () => {
      const store = getStore();
      if (!store.ai_messages) store.ai_messages = [];
      const msgs = store.ai_messages.filter(m => m.conversation_id === conversationId);
      if (msgs.length === 0) {
        const defaultMsg = {
          id: 'msg-def-' + Date.now(),
          conversation_id: conversationId,
          sender: 'assistant',
          role: 'assistant',
          content: "Hello! I am CampusFlow AI — your intelligent campus companion. How can I assist you today?",
          chips: [
            "What's my attendance percentage?",
            "What assignments are due this week?",
            "Find upcoming college hackathons",
            "What classes do I have today?"
          ],
          tool_calls: [],
          agent_trace: [],
          created_at: new Date().toISOString()
        };
        store.ai_messages.push(defaultMsg);
        saveStore(store);
        return { success: true, data: [defaultMsg] };
      }
      return { success: true, data: msgs };
    }
  ),

  deleteConversation: (conversationId) => withFallback(
    () => api.delete(`/copilot/conversations/${conversationId}`).then(r => r.data),
    () => {
      const store = getStore();
      if (store.ai_conversations) {
        store.ai_conversations = store.ai_conversations.filter(c => c.id !== conversationId);
      }
      if (store.ai_messages) {
        store.ai_messages = store.ai_messages.filter(m => m.conversation_id !== conversationId);
      }
      saveStore(store);
      return { success: true, message: 'Conversation deleted' };
    }
  ),

  clearMessages: (conversationId) => withFallback(
    () => api.post(`/copilot/conversations/${conversationId}/clear`).then(r => r.data),
    () => {
      const store = getStore();
      if (store.ai_messages) {
        store.ai_messages = store.ai_messages.filter(m => m.conversation_id !== conversationId);
      }
      saveStore(store);
      return { success: true, message: 'Messages cleared' };
    }
  ),

  executeTool: (toolName, parameters) => withFallback(
    () => api.post('/copilot/tool-execute', { toolName, parameters }).then(r => r.data),
    () => {
      if (toolName === 'register_for_event') {
        return {
          success: true,
          data: {
            registrationId: 'reg-' + Date.now(),
            eventTitle: parameters?.eventTitle || 'Apex InnoHacks 2026',
            status: 'confirmed',
            message: 'You have been registered successfully!'
          }
        };
      }
      return { success: true, data: { status: 'completed', parameters } };
    }
  )
};

// ----------------------------------------------------------------------
// AUTONOMOUS AI ORCHESTRATOR API
// ----------------------------------------------------------------------
export const orchestratorApi = {
  listTasks: () => withFallback(
    () => api.get('/orchestrator/tasks').then(r => r.data),
    () => ({ success: true, data: getStore().orchestratorTasks })
  ),

  runWorkflow: (scenarioKey) => withFallback(
    () => api.post('/orchestrator/run-workflow', { scenarioKey }).then(r => r.data),
    () => {
      const store = getStore();
      const newTask = {
        id: 'orch-task-' + Date.now(),
        title: scenarioKey === 'faculty_absence' ? 'Emergency Faculty Absence & Proxy Allocation' : 'Attendance Risk & Recovery Pipeline',
        trigger_event: 'Autonomous Orchestrator triggered simulation: ' + scenarioKey,
        status: 'pending_approval',
        requires_admin_approval: true,
        urgency: 'high',
        created_at: new Date().toISOString(),
        agents_involved: ['Timetable Agent', 'Resource Agent', 'Academic Recovery Agent', 'Notification Agent'],
        summary: 'Detected schedule variance. Alternative faculty Dr. Sarah Jenkins matched with Hall B-204. Pending human authorization.',
        steps: [
          { agent: 'Timetable Agent', action: 'Scanned schedule dependencies and detected conflict', status: 'completed' },
          { agent: 'Resource Agent', action: 'Confirmed Hall B-204 is clear and AC/Projector functioning', status: 'completed' },
          { agent: 'Autonomous Orchestrator', action: 'Presented optimal solution to administrator queue', status: 'waiting_for_approval' },
          { agent: 'Notification Agent', action: 'Standby to broadcast SMS/Push notification to enrolled students', status: 'queued' }
        ],
        proposed_action: {
          course: 'CS-301: Algorithms & Data Structures',
          original_faculty: 'Prof. Marcus Vance',
          proxy_faculty: 'Dr. Sarah Jenkins',
          room: 'Hall B-204',
          time: 'Today, 10:00 AM - 11:30 AM',
          notification_target: '64 Students Enrolled in Section A'
        }
      };
      store.orchestratorTasks.unshift(newTask);
      saveStore(store);
      return { success: true, data: newTask, message: 'Workflow pipeline successfully executed by Multi-Agent Swarm!' };
    }
  ),

  approveTask: (taskId, comments) => withFallback(
    () => api.post(`/orchestrator/tasks/${taskId}/approve`, { comments }).then(r => r.data),
    () => {
      const store = getStore();
      const task = store.orchestratorTasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'approved_and_executed';
        task.requires_admin_approval = false;
        task.steps.forEach(s => s.status = 'completed');
        task.admin_approval = {
          approved_by: 'Dr. Sarah Jenkins (Dean of Academic Affairs)',
          approved_at: new Date().toISOString(),
          comments: comments || 'Approved. Notification Agent dispatched messages to all students.'
        };
        saveStore(store);
      }
      return { success: true, message: 'Action authorized. Autonomous execution completed and students notified!' };
    }
  ),

  rejectTask: (taskId, reason) => withFallback(
    () => api.post(`/orchestrator/tasks/${taskId}/reject`, { reason }).then(r => r.data),
    () => {
      const store = getStore();
      const task = store.orchestratorTasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'rejected_by_admin';
        task.requires_admin_approval = false;
        task.admin_approval = {
          rejected_by: 'Dr. Sarah Jenkins (Dean of Academic Affairs)',
          rejected_at: new Date().toISOString(),
          reason: reason || 'Class cancelled instead of proxy reallocation.'
        };
        saveStore(store);
      }
      return { success: true, message: 'Workflow rejected. Rollback complete.' };
    }
  )
};

// ----------------------------------------------------------------------
// CAMPUS LOST & FOUND API
// ----------------------------------------------------------------------
export const lostFoundApi = {
  list: (params) => withFallback(
    () => api.get('/lost-found', { params }).then(r => r.data),
    () => {
      const store = getStore();
      let items = store.lostFound || [];
      if (params?.type && params.type !== 'all') {
        items = items.filter(i => i.type === params.type);
      }
      return { success: true, data: items };
    }
  ),

  report: (data) => withFallback(
    () => api.post('/lost-found', data).then(r => r.data),
    () => {
      const store = getStore();
      const newItem = {
        id: 'lf-' + Date.now(),
        type: data.type || 'lost',
        title: data.title,
        description: data.description,
        location_found: data.location || 'Campus Grounds',
        reported_by: data.reported_by || 'Alex Rivera (Student)',
        reported_at: new Date().toISOString(),
        status: data.type === 'found' ? 'available_for_claim' : 'reported_lost',
        image_url: data.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        ai_tags: (data.title + ' ' + (data.description || '')).toLowerCase().split(' ').slice(0, 5)
      };
      store.lostFound.unshift(newItem);
      saveStore(store);
      return { success: true, data: newItem, message: 'Item recorded! Campus AI will scan for matches.' };
    }
  ),

  claim: (id, proof) => withFallback(
    () => api.post(`/lost-found/${id}/claim`, { proof }).then(r => r.data),
    () => {
      const store = getStore();
      const item = store.lostFound.find(i => i.id === id);
      if (item) {
        item.status = 'claim_pending_verification';
        saveStore(store);
      }
      return { success: true, message: 'Claim submitted. Visit Campus Security Desk with your ID to retrieve.' };
    }
  )
};

// ----------------------------------------------------------------------
// CAMPUS NOTICES & CIRCULARS API
// ----------------------------------------------------------------------
export const noticeApi = {
  list: (params) => withFallback(
    () => api.get('/notices', { params }).then(r => r.data),
    () => ({ success: true, data: getStore().notices || [] })
  ),
  summarize: (id) => withFallback(
    () => api.get(`/notices/${id}/summary`).then(r => r.data),
    () => {
      const notice = getStore().notices.find(n => n.id === id) || getStore().notices[0];
      return {
        success: true,
        data: {
          summary: notice.summary,
          action_items: notice.action_items,
          deadlines: notice.deadlines
        }
      };
    }
  )
};

// ----------------------------------------------------------------------
// CAMPUS GRIEVANCES API
// ----------------------------------------------------------------------
export const grievanceApi = {
  list: () => withFallback(
    () => api.get('/grievances').then(r => r.data),
    () => ({ success: true, data: getStore().grievances || [] })
  ),
  submit: (data) => withFallback(
    () => api.post('/grievances', data).then(r => r.data),
    () => {
      const store = getStore();
      const newGrv = {
        id: 'grv-' + Date.now(),
        ticket_number: 'GRV-2026-' + Math.floor(100 + Math.random() * 900),
        student_id: 'usr-student-01',
        student_name: 'Alex Rivera',
        category: data.category || 'infrastructure',
        title: data.title,
        description: data.description,
        department_assigned: data.category === 'academic' ? 'Academic Dean Office' : 'Campus Facilities & IT Services',
        urgency: data.urgency || 'medium',
        status: 'submitted',
        sla_hours: 48,
        created_at: new Date().toISOString(),
        resolution_notes: 'AI Grievance Agent auto-assigned to department coordinator.'
      };
      store.grievances.unshift(newGrv);
      saveStore(store);
      return { success: true, data: newGrv, message: 'Grievance registered. AI assigned ticket SLA of 48h.' };
    }
  ),
  updateStatus: (id, status, notes) => withFallback(
    () => api.patch(`/grievances/${id}/status`, { status, notes }).then(r => r.data),
    () => {
      const store = getStore();
      const item = store.grievances.find(g => g.id === id);
      if (item) {
        item.status = status;
        if (notes) item.resolution_notes = notes;
        saveStore(store);
      }
      return { success: true, message: 'Grievance status updated' };
    }
  )
};

// ----------------------------------------------------------------------
// TIMETABLES & ACADEMIC RECOVERY API
// ----------------------------------------------------------------------
export const timetableApi = {
  getForStudent: () => withFallback(
    () => api.get('/timetable/student').then(r => r.data),
    () => ({ success: true, data: getStore().timetables || [] })
  ),
  getForFaculty: () => withFallback(
    () => api.get('/timetable/faculty').then(r => r.data),
    () => ({ success: true, data: getStore().timetables || [] })
  )
};

export const assignmentApi = {
  listPending: () => withFallback(
    () => api.get('/assignments/pending').then(r => r.data),
    () => ({ success: true, data: getStore().assignments || [] })
  ),
  getRecoveryPlan: () => withFallback(
    () => api.get('/assignments/recovery-plan').then(r => r.data),
    () => ({
      success: true,
      data: {
        totalPending: 2,
        recommendedSchedule: [
          { day: 'Today (Evening)', task: 'Finish Dynamic Programming Implementation (CS-301)', duration: '2 Hours' },
          { day: 'Tomorrow (Afternoon)', task: 'BCNF Proofs Revision & Catch-up', duration: '1.5 Hours' }
        ],
        targetImprovement: '+8.5% projected grade boost'
      }
    })
  )
};

export const analyticsApi = {
  getSummary: () => withFallback(
    () => api.get('/analytics/summary').then(r => r.data),
    () => {
      const store = getStore();
      return {
        success: true,
        data: {
          totalStudents: store.users.filter(u => u.role === 'student').length + 180,
          totalSessions: store.sessions.length,
          validSubmissions: store.attendance.length,
          totalCases: store.cases.length,
          pendingReview: store.cases.filter(c => c.status === 'pending_faculty_review').length,
          approvedCases: store.cases.filter(c => c.status === 'approved').length,
          rejectedCases: store.cases.filter(c => c.status === 'rejected').length,
          avgResolutionHours: 2.4,
          integrityStats: { lowRisk: 88, mediumRisk: 9, highRisk: 3 }
        }
      };
    }
  ),
  getIssues: () => withFallback(
    () => api.get('/analytics/issues').then(r => r.data),
    () => ({
      success: true,
      data: [
        { category: 'camera_failure', count: 12, label: 'Camera / QR Scanner Glitch' },
        { category: 'network_timeout', count: 8, label: 'Network Connection Timeout' },
        { category: 'session_expired', count: 5, label: 'Premature Session Closure' },
        { category: 'external_system_unverified', count: 3, label: 'Unverified External Portal' }
      ]
    })
  ),
  getRecovery: () => withFallback(
    () => api.get('/analytics/recovery').then(r => r.data),
    () => {
      const store = getStore();
      return {
        success: true,
        data: {
          approved: store.cases.filter(c => c.status === 'approved').length,
          rejected: store.cases.filter(c => c.status === 'rejected').length,
          pending: store.cases.filter(c => c.status === 'pending_faculty_review').length
        }
      };
    }
  )
};

export const adminApi = {
  listUsers: (params) => withFallback(
    () => api.get('/admin/users', { params }).then(r => r.data),
    () => ({ success: true, data: getStore().users })
  ),
  updateRole: (userId, data) => withFallback(
    () => api.patch(`/admin/users/${userId}/role`, data).then(r => r.data),
    () => ({ success: true, message: 'Role updated' })
  ),
  listInstitutions: () => withFallback(
    () => api.get('/admin/institutions').then(r => r.data),
    () => ({ success: true, data: [{ id: 'inst-apex-01', name: 'Apex Institute of Technology', slug: 'apex-tech' }] })
  ),
  listAuditLogs: () => withFallback(
    () => api.get('/admin/audit-logs').then(r => r.data),
    () => ({ success: true, data: [] })
  )
};

export default api;
