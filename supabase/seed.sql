-- ====================================================================
-- CampusFlow: Seed Data
-- ====================================================================

-- 1. Demo Institution
INSERT INTO institutions (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'Apex Institute of Engineering & Technology', 'apex-tech')
ON CONFLICT (id) DO NOTHING;

-- 2. Departments
INSERT INTO departments (id, institution_id, name, code)
VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Electronics and Communication', 'ECE')
ON CONFLICT (id) DO NOTHING;

-- 3. Demo Profiles (Faculty, Student, Admin)
-- Admin
INSERT INTO profiles (id, institution_id, full_name, email, role, department_id, is_active)
VALUES ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Dr. Sarah Jenkins', 'admin@apex.edu', 'admin', '22222222-2222-2222-2222-222222222221', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Faculty
INSERT INTO profiles (id, institution_id, full_name, email, role, department_id, is_active)
VALUES ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Prof. Marcus Vance', 'faculty@apex.edu', 'faculty', '22222222-2222-2222-2222-222222222221', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Students
INSERT INTO profiles (id, institution_id, full_name, email, role, department_id, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Alex Rivera', 'student@apex.edu', 'student', '22222222-2222-2222-2222-222222222221', true),
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'Priya Sharma', 'priya@apex.edu', 'student', '22222222-2222-2222-2222-222222222221', true),
  ('33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111', 'Jordan Lee', 'jordan@apex.edu', 'student', '22222222-2222-2222-2222-222222222221', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 4. Classes
INSERT INTO classes (id, institution_id, department_id, name, academic_year, semester, section)
VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'B.Tech CSE Year 3', '2025-2026', 'Semester 6', 'Section A'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'B.Tech CSE Year 3', '2025-2026', 'Semester 6', 'Section B')
ON CONFLICT (id) DO NOTHING;

-- 5. Subjects
INSERT INTO subjects (id, institution_id, class_id, name, subject_code, faculty_id)
VALUES
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'Distributed Systems & Cloud Computing', 'CS601', '33333333-3333-3333-3333-333333333332'),
  ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'Database Systems Engineering', 'CS602', '33333333-3333-3333-3333-333333333332')
ON CONFLICT (id) DO NOTHING;

-- 6. Enrollments
INSERT INTO enrollments (institution_id, class_id, student_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333334'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333335')
ON CONFLICT (class_id, student_id) DO NOTHING;

-- 7. Sample Attendance Session
INSERT INTO attendance_sessions (id, institution_id, class_id, subject_id, faculty_id, session_date, starts_at, expires_at, status, token_hash)
VALUES
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', CURRENT_DATE, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'active', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
ON CONFLICT (id) DO NOTHING;

-- 8. Sample Attendance Record
INSERT INTO attendance_records (id, institution_id, session_id, student_id, attendance_status, recorded_at, source)
VALUES
  ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333334', 'present', NOW() - INTERVAL '20 minutes', 'campusflow_qr')
ON CONFLICT (session_id, student_id) DO NOTHING;

-- 9. Sample Verification Case (Recovery Request)
INSERT INTO verification_cases (id, institution_id, student_id, session_id, case_type, issue_category, description, reported_at, status, priority)
VALUES
  ('99999999-9999-9999-9999-999999999991', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777771', 'attendance_recovery', 'network_failure', 'Phone disconnected from campus Wi-Fi right when scanning the QR code in Room 402. Attempted scan at 10:14 AM.', NOW() - INTERVAL '15 minutes', 'pending_faculty_review', 'medium')
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Evidence Record
INSERT INTO evidence_records (institution_id, case_id, evidence_type, source_type, source_record_id, description, verification_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991', 'Session Timestamps', 'database_record', '77777777-7777-7777-7777-777777777771', 'Active session valid between ' || (NOW() - INTERVAL '30 minutes')::text || ' and ' || (NOW() + INTERVAL '30 minutes')::text, 'verified'),
  ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991', 'Student Report', 'student_statement', 'case_submission', 'Student reported campus Wi-Fi disruption in Room 402 at 10:14 AM.', 'unverified')
ON CONFLICT DO NOTHING;

