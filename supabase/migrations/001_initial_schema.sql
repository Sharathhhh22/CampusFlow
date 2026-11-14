-- ====================================================================
-- CampusFlow: Initial PostgreSQL Schema Migration
-- Migration: 001_initial_schema.sql
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration Tracking Table
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. institutions
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    section TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    faculty_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_enrollment_student_class UNIQUE (class_id, student_id)
);

-- 7. attendance_sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'closed', 'expired')) DEFAULT 'active',
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_session_times CHECK (expires_at > starts_at)
);

-- 8. attendance_events (immutable audit log of all scan / recovery attempts)
CREATE TABLE IF NOT EXISTS attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('scan_submitted', 'scan_rejected', 'duplicate_submission', 'issue_reported', 'recovery_requested')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'campusflow_web',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. attendance_records (verified attendance ledger)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'excused', 'recovered')) DEFAULT 'present',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'campusflow_qr',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_session_student UNIQUE (session_id, student_id)
);

-- 10. verification_cases
CREATE TABLE IF NOT EXISTS verification_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE SET NULL,
    case_type TEXT NOT NULL DEFAULT 'attendance_recovery',
    issue_category TEXT NOT NULL CHECK (issue_category IN ('qr_scan_failure', 'network_failure', 'app_error', 'session_expiry', 'attendance_not_appearing', 'other')),
    description TEXT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('submitted', 'under_investigation', 'awaiting_student_info', 'pending_faculty_review', 'approved', 'rejected', 'closed')) DEFAULT 'submitted',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. evidence_records
CREATE TABLE IF NOT EXISTS evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES verification_cases(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('database_record', 'student_statement', 'system_log', 'agent_inference')),
    source_record_id TEXT,
    description TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'unverified', 'disputed')) DEFAULT 'unverified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. agent_runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES verification_cases(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL CHECK (agent_name IN ('integrity', 'recovery', 'evidence', 'coordinator')),
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    input_summary JSONB DEFAULT '{}'::jsonb,
    output_json JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. faculty_decisions
CREATE TABLE IF NOT EXISTS faculty_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES verification_cases(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'more_info_requested')),
    reason TEXT NOT NULL,
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Indexes for High Performance Queries
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_classes_institution ON classes(institution_id);
CREATE INDEX IF NOT EXISTS idx_classes_dept ON classes(department_id);

CREATE INDEX IF NOT EXISTS idx_subjects_class ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_faculty ON subjects(faculty_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_status ON attendance_sessions(status);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires ON attendance_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_attendance_events_session ON attendance_events(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_events_student ON attendance_events(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_events_type ON attendance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_attendance_events_occurred ON attendance_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(attendance_status);

CREATE INDEX IF NOT EXISTS idx_verification_cases_student ON verification_cases(student_id);
CREATE INDEX IF NOT EXISTS idx_verification_cases_session ON verification_cases(session_id);
CREATE INDEX IF NOT EXISTS idx_verification_cases_status ON verification_cases(status);
CREATE INDEX IF NOT EXISTS idx_verification_cases_institution ON verification_cases(institution_id);
CREATE INDEX IF NOT EXISTS idx_verification_cases_created ON verification_cases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_records_case ON evidence_records(case_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_case ON agent_runs(case_id);
CREATE INDEX IF NOT EXISTS idx_faculty_decisions_case ON faculty_decisions(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_inst ON audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ====================================================================
-- Triggers for Updated At
-- ====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_institutions_updated ON institutions;
CREATE TRIGGER trg_institutions_updated BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_sessions_updated ON attendance_sessions;
CREATE TRIGGER trg_attendance_sessions_updated BEFORE UPDATE ON attendance_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_verification_cases_updated ON verification_cases;
CREATE TRIGGER trg_verification_cases_updated BEFORE UPDATE ON verification_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ====================================================================
-- Enable Row Level Security (RLS) on all application tables
-- ====================================================================
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for current user context in RLS
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_institution()
RETURNS UUID AS $$
  SELECT institution_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS Policies: profiles
CREATE POLICY "Users can view their own profile or profiles in same institution"
ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR institution_id = auth_user_institution()
);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their institution"
ON profiles FOR ALL
TO authenticated
USING (auth_user_role() = 'admin' AND institution_id = auth_user_institution());

-- RLS Policies: institutions & departments
CREATE POLICY "Users can view their own institution"
ON institutions FOR SELECT
TO authenticated
USING (id = auth_user_institution());

CREATE POLICY "Users can view departments of their institution"
ON departments FOR SELECT
TO authenticated
USING (institution_id = auth_user_institution());

-- RLS Policies: classes & subjects
CREATE POLICY "Users can view classes in their institution"
ON classes FOR SELECT
TO authenticated
USING (institution_id = auth_user_institution());

CREATE POLICY "Users can view subjects in their institution"
ON subjects FOR SELECT
TO authenticated
USING (institution_id = auth_user_institution());

-- RLS Policies: enrollments
CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR auth_user_role() IN ('faculty', 'admin')
);

-- RLS Policies: attendance_sessions
CREATE POLICY "Users can view active sessions in their institution"
ON attendance_sessions FOR SELECT
TO authenticated
USING (institution_id = auth_user_institution());

CREATE POLICY "Faculty and admin can manage attendance sessions"
ON attendance_sessions FOR ALL
TO authenticated
USING (
    (auth_user_role() = 'faculty' AND faculty_id = auth.uid())
    OR auth_user_role() = 'admin'
);

-- RLS Policies: attendance_records
CREATE POLICY "Students can view their own attendance records"
ON attendance_records FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR auth_user_role() IN ('faculty', 'admin')
);

-- RLS Policies: attendance_events
CREATE POLICY "Students can view their own attendance events"
ON attendance_events FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR auth_user_role() IN ('faculty', 'admin')
);

CREATE POLICY "Authenticated users can insert attendance events"
ON attendance_events FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth.uid()
    OR auth_user_role() IN ('faculty', 'admin')
);

-- RLS Policies: verification_cases
CREATE POLICY "Students view their own cases; Faculty and Admin view their institution cases"
ON verification_cases FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR auth_user_role() IN ('faculty', 'admin')
);

CREATE POLICY "Students can create verification cases"
ON verification_cases FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty and Admins can update verification cases"
ON verification_cases FOR UPDATE
TO authenticated
USING (auth_user_role() IN ('faculty', 'admin'));

-- RLS Policies: evidence_records
CREATE POLICY "View evidence records for visible cases"
ON evidence_records FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM verification_cases vc
        WHERE vc.id = evidence_records.case_id
        AND (vc.student_id = auth.uid() OR auth_user_role() IN ('faculty', 'admin'))
    )
);

-- RLS Policies: agent_runs
CREATE POLICY "Faculty and Admins can view agent runs"
ON agent_runs FOR SELECT
TO authenticated
USING (auth_user_role() IN ('faculty', 'admin'));

-- RLS Policies: faculty_decisions
CREATE POLICY "Students view decisions for own case; Faculty & Admin view all"
ON faculty_decisions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM verification_cases vc
        WHERE vc.id = faculty_decisions.case_id
        AND (vc.student_id = auth.uid() OR auth_user_role() IN ('faculty', 'admin'))
    )
);

CREATE POLICY "Faculty can insert decisions"
ON faculty_decisions FOR INSERT
TO authenticated
WITH CHECK (
    auth_user_role() IN ('faculty', 'admin')
    AND faculty_id = auth.uid()
);

-- RLS Policies: audit_logs
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (auth_user_role() = 'admin' AND institution_id = auth_user_institution());

