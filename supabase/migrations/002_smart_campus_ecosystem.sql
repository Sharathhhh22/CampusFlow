-- ====================================================================
-- CampusFlow: Smart Campus Management & Multi-Agent Ecosystem Schema
-- Migration: 002_smart_campus_ecosystem.sql
-- ====================================================================

-- 1. classrooms & laboratories (Campus Resource Agent & Smart Classroom Finder)
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    building TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    capacity INTEGER NOT NULL DEFAULT 40,
    room_type TEXT NOT NULL CHECK (room_type IN ('lecture_hall', 'lab', 'seminar_room', 'auditorium', 'smart_classroom')),
    has_projector BOOLEAN NOT NULL DEFAULT TRUE,
    has_ac BOOLEAN NOT NULL DEFAULT TRUE,
    has_workstations BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. timetables (Smart Timetable Agent)
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    semester TEXT NOT NULL DEFAULT 'Semester 6',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. assignments (Academic Recovery Agent)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. assignment_submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'late', 'graded')),
    submission_text TEXT,
    grade INTEGER,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- 5. events (Hackathons & Workshops Hub)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'workshop', 'seminar', 'guest_lecture', 'coding_competition', 'innovation_challenge', 'cultural', 'other')),
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'offline' CHECK (mode IN ('offline', 'online', 'hybrid')),
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    price NUMERIC(10, 2) DEFAULT 0.00,
    max_capacity INTEGER NOT NULL DEFAULT 100,
    registered_count INTEGER NOT NULL DEFAULT 0,
    team_size_min INTEGER NOT NULL DEFAULT 1,
    team_size_max INTEGER NOT NULL DEFAULT 1,
    organizer_name TEXT NOT NULL,
    faculty_coordinator TEXT,
    student_coordinator TEXT,
    rules TEXT,
    prizes TEXT,
    eligibility TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. event_teams
CREATE TABLE IF NOT EXISTS event_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    team_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES event_teams(id) ON DELETE SET NULL,
    registration_type TEXT NOT NULL DEFAULT 'individual' CHECK (registration_type IN ('individual', 'team')),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'waitlisted', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- 8. grievances (Grievance Management Agent)
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('academic', 'facilities', 'harassment', 'canteen', 'hostel', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'action_taken', 'resolved', 'escalated')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. lost_found_items (Campus Lost & Found AI)
CREATE TABLE IF NOT EXISTS lost_found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    category TEXT NOT NULL CHECK (category IN ('electronics', 'documents', 'accessories', 'books', 'clothing', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    ai_detected_tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'claimed', 'closed')),
    claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. campus_notices (Smart Notice Summarizer)
CREATE TABLE IF NOT EXISTS campus_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_content TEXT NOT NULL,
    ai_summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('academic', 'examination', 'holiday', 'placement', 'event', 'general')),
    important_dates TEXT[] DEFAULT '{}',
    action_required TEXT,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. notifications (Notification Agent)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('attendance_alert', 'assignment_reminder', 'timetable_change', 'event_announcement', 'grievance_update', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. orchestrator_tasks (Autonomous AI Orchestrator)
CREATE TABLE IF NOT EXISTS orchestrator_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL,
    orchestrator_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_step INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'executing', 'awaiting_approval', 'completed', 'failed')),
    agents_involved TEXT[] DEFAULT '{}',
    audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_tasks ENABLE ROW LEVEL SECURITY;

-- Basic Public/Authenticated Policies
CREATE POLICY "Public read for published events" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can view their grievances" ON grievances FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can view their registrations" ON event_registrations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Read access for classrooms" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Read access for timetables" ON timetables FOR SELECT USING (true);
CREATE POLICY "Read access for notices" ON campus_notices FOR SELECT USING (true);
CREATE POLICY "Read access for lost and found" ON lost_found_items FOR SELECT USING (true);
