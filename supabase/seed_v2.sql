-- ====================================================================
-- CampusFlow: Seed Data v2 (Smart Campus & Multi-Agent Ecosystem)
-- ====================================================================

-- 1. Classrooms & Labs
INSERT INTO classrooms (id, institution_id, name, code, building, floor, capacity, room_type, has_projector, has_ac, has_workstations, is_available, status)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Main Auditorium', 'AUD-01', 'Kalam Block', 1, 350, 'auditorium', true, true, false, true, 'available'),
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Smart Lecture Hall B-204', 'LH-B204', 'Aryabhata Hall', 2, 75, 'smart_classroom', true, true, false, true, 'occupied'),
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Computer Science Lab 3 (AI & Cloud)', 'LAB-CS3', 'Turing Center', 3, 60, 'lab', true, true, true, true, 'available'),
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Seminar Hall Alpha', 'SEM-A1', 'Admin Block', 2, 120, 'seminar_room', true, true, false, true, 'reserved'),
  ('a1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'IoT & Embedded Systems Lab', 'LAB-IOT1', 'Turing Center', 2, 45, 'lab', true, true, true, false, 'maintenance')
ON CONFLICT (id) DO NOTHING;

-- 2. Timetables (Monday=1, Tuesday=2, Wednesday=3)
INSERT INTO timetables (id, institution_id, class_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, academic_year, semester)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 'a1111111-1111-1111-1111-111111111112', 1, '09:00:00', '10:30:00', '2025-2026', 'Semester 6'),
  ('b1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333332', 'a1111111-1111-1111-1111-111111111113', 1, '11:00:00', '12:30:00', '2025-2026', 'Semester 6'),
  ('b1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 'a1111111-1111-1111-1111-111111111112', 2, '10:00:00', '11:30:00', '2025-2026', 'Semester 6')
ON CONFLICT (id) DO NOTHING;

-- 3. Events & Hackathons Hub
INSERT INTO events (
  id, institution_id, department_id, title, slug, category, short_description, description,
  banner_url, event_date, end_date, registration_deadline, venue, mode, is_free, price,
  max_capacity, registered_count, team_size_min, team_size_max, organizer_name,
  faculty_coordinator, student_coordinator, rules, prizes, eligibility, status
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Apex HackNova 2026: 36-Hour National AI & Cloud Hackathon',
    'apex-hacknova-2026',
    'hackathon',
    'Build production-ready agentic AI architectures and cloud solutions with mentors from top industry leaders.',
    'Apex HackNova is the flagship annual collegiate hackathon hosted by the Computer Science Department. Participants will compete in tracks covering Agentic AI, Cloud Resilience, Decentralized Web, and Green Campus IoT. Food, cloud credits, and overnight accommodations provided on campus.',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    NOW() + INTERVAL '10 days',
    'Turing Center & Main Auditorium',
    'hybrid',
    true,
    0.00,
    150,
    84,
    2,
    4,
    'Apex CSE Innovation Club',
    'Prof. Marcus Vance',
    'Jordan Lee (CSE-3)',
    '1. Original code written during hackathon window only. 2. Maximum team size of 4. 3. All code submitted via public GitHub repository with video demo.',
    '🥇 1st Place: ₹75,000 + Cloud Credits\n🥈 2nd Place: ₹45,000\n🥉 3rd Place: ₹25,000 + Internship Interviews',
    'Open to all undergraduate and postgraduate engineering students.',
    'published'
  ),
  (
    'c1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Hands-on Masterclass: Autonomous Multi-Agent AI with Gemini 2.0',
    'multi-agent-gemini-masterclass',
    'workshop',
    'Deep-dive into building autonomous multi-agent swarms, tool calling, memory management, and human-in-the-loop workflows.',
    'Join our senior faculty and guest AI researchers for an intensive 4-hour technical workshop. You will build and deploy a functioning multi-agent pipeline using modern SDKs and structured JSON output.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days 4 hours',
    NOW() + INTERVAL '3 days',
    'Computer Science Lab 3 (Turing Center)',
    'offline',
    true,
    0.00,
    60,
    48,
    1,
    1,
    'Department of Computer Science',
    'Dr. Sarah Jenkins',
    'Maya Patel',
    'Bring your laptop with Node.js 18+ or Python 3.10+ installed.',
    'Digital Verified Skill Certificate awarded upon project completion.',
    'Prerequisite: Basic programming knowledge in Python or JavaScript.',
    'published'
  ),
  (
    'c1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'ByteCode Speed Arena: Spring Algorithmic Challenge',
    'bytecode-speed-arena-2026',
    'coding_competition',
    'Fast-paced 2-hour competitive programming sprint on graph algorithms, dynamic programming, and complexity optimization.',
    'Put your algorithmic speed and accuracy to the test against peers across campus. 5 algorithmic problems in 120 minutes with automated judge testing.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '8 days 2 hours',
    NOW() + INTERVAL '6 days',
    'Virtual / Hackerrank Arena',
    'online',
    true,
    0.00,
    200,
    112,
    1,
    1,
    'Competitive Coding Society',
    'Prof. Marcus Vance',
    'Alex Rivera',
    'Standard competitive programming anti-plagiarism guidelines apply.',
    'Cash prizes of ₹15,000 for top 3 rankers + Certificate of Merit.',
    'All departments and batches eligible.',
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Assignments
INSERT INTO assignments (id, institution_id, class_id, subject_id, faculty_id, title, description, due_date, max_marks)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    '55555555-5555-5555-5555-555555555551',
    '33333333-3333-3333-3333-333333333332',
    'Raft Consensus State Machine Implementation',
    'Implement a leader election and log replication simulation using asynchronous messaging in Go or Node.js. Provide unit test proof for network partition handling.',
    NOW() + INTERVAL '3 days',
    50
  ),
  (
    'd1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333332',
    'Query Plan Optimization & Index Benchmarking',
    'Profile B-Tree vs Hash vs GIN index performance on a 1-million row synthetic dataset using EXPLAIN ANALYZE in PostgreSQL.',
    NOW() + INTERVAL '6 days',
    50
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Campus Notices
INSERT INTO campus_notices (id, institution_id, title, original_content, ai_summary, category, important_dates, action_required)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Spring 2026 Mid-Semester Examination Schedule & Guidelines',
    'All B.Tech students are hereby informed that Mid-Semester Examinations for the Spring 2026 semester will commence from March 2nd, 2026. Hall tickets will be issued through the student portal starting February 25th. Students having attendance below 75% must resolve discrepancies with their respective department coordinators before February 22nd. No candidate will be admitted without biometric or QR hall verification.',
    'Mid-Semester exams begin March 2nd. Hall tickets available from Feb 25th. Attendance threshold is strictly 75%; resolve any attendance issues with department coordinators before Feb 22nd.',
    'examination',
    ARRAY['Feb 22: Attendance dispute deadline', 'Feb 25: Hall ticket issuance', 'Mar 2: Exams commence'],
    'Verify your attendance status on CampusFlow and download your hall ticket on Feb 25th.'
  ),
  (
    'e1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'National AI Hackathon & Tech Workshop Registration Open',
    'Registrations are officially open for Apex HackNova 2026 and accompanying Generative AI Masterclasses. Cash prizes of ₹1,50,000 and direct interview opportunities with cloud partners. Register via CampusFlow Events Hub before the March 10th deadline.',
    'HackNova 2026 and AI Masterclasses are now open for student registration on CampusFlow Events Hub. ₹1.5L prize pool; deadline March 10th.',
    'event',
    ARRAY['Mar 10: Registration deadline', 'Mar 14: Hackathon kickoff'],
    'Form a team of 2-4 and register in the Events Hub.'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Grievances
INSERT INTO grievances (id, institution_id, student_id, department_id, category, title, description, status, priority, resolution_notes)
VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222221',
    'facilities',
    'Lab 3 Air Conditioning unit malfunctioning during afternoon sessions',
    'The temperature inside Computer Lab 3 during our 2:00 PM Distributed Systems lab has been uncomfortably high due to an AC unit failure on the west wall.',
    'under_review',
    'medium',
    'Assigned to Facilities & Campus Maintenance. Service technician scheduled for inspection today.'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Lost & Found Items
INSERT INTO lost_found_items (id, institution_id, reporter_id, item_type, category, title, description, location, ai_detected_tags, status)
VALUES
  (
    '10111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'found',
    'electronics',
    'Casio Scientific Calculator FX-991EX',
    'Found left on row 4 desk after CS-301 lecture. Has a blue protective cover and white sticker on the back.',
    'Smart Lecture Hall B-204',
    ARRAY['calculator', 'casio', 'blue', 'scientific', 'electronics'],
    'open'
  ),
  (
    '10111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'lost',
    'documents',
    'Brown Leather ID Card Holder with Lanyard',
    'Misplaced between Turing Center cafe and the library staircase around 12:45 PM.',
    'Turing Center Pathway',
    ARRAY['id_card', 'leather', 'brown', 'lanyard', 'documents'],
    'open'
  )
ON CONFLICT (id) DO NOTHING;

