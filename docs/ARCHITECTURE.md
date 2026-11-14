# CampusFlow System Architecture

> **Fair Attendance. Fewer Disputes. Less Manual Work.**

CampusFlow is an Agentic AI-powered Attendance Trust & Recovery Platform designed to improve the reliability, transparency, and governance of academic attendance systems.

---

## 1. High-Level Architectural Overview

CampusFlow addresses two complementary operational challenges in collegiate attendance:
1. **Attendance Integrity:** Uncovering anomalous, clustered, duplicate, or out-of-window attendance submissions using specialized AI agent investigations.
2. **Attendance Reliability & Recovery:** Providing students facing legitimate hardware, network, or session faults with a transparent, evidence-backed recovery mechanism.

### Operational Separation & Integrity Boundary
CampusFlow is an independent platform. It operates without unauthorized access to third-party or NIAT institutional private databases.
- QR sessions in CampusFlow are generated independently with cryptographic hashes and strict expiration windows.
- Student reports regarding external or legacy attendance failures are clearly labeled as **Unverified External Report** until authorized faculty complete review.
- AI agents act solely as investigative and synthesis assistants; **authorized human faculty retain exclusive authority** to approve or reject attendance corrections.

```
+-----------------------------------------------------------------------------------+
|                                  CampusFlow UI                                    |
|   +--------------------+  +----------------------+  +-------------------------+   |
|   | Student Portal     |  | Faculty Decision Ctr |  | Administrator Dashboard |   |
|   +--------------------+  +----------------------+  +-------------------------+   |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / REST / JWT
                                          v
+-----------------------------------------------------------------------------------+
|                                Express.js API                                     |
|  [Security / Helmet / RateLimit] -> [Auth Middleware / JWT] -> [Zod Validators]   |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
                     v                                    v
+------------------------------------+   +------------------------------------------+
|       Agentic AI Coordinator       |   |       Data Persistence & Security        |
|  +------------------------------+  |   |                                          |
|  | Coordinator Agent            |  |   |  Supabase / PostgreSQL                   |
|  |  |- Integrity Agent          |  |   |   - Row-Level Security (RLS)             |
|  |  |- Recovery Agent           |  |   |   - Immutable attendance_events          |
|  |  \- Evidence Agent           |  |   |   - Atomic attendance_records            |
|  +------------------------------+  |   |   - verification_cases & faculty_decisions|
|  Google Gemini API (@google/genai) |   |   - audit_logs                           |
+------------------------------------+   +------------------------------------------+
```

---

## 2. Multi-Agent AI System Design

CampusFlow implements four specialized agents operating in a bounded workflow:

```
                  +-----------------------------------+
                  |      New Verification Case        |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |        Coordinator Agent          |
                  +--------+-----------------+--------+
                           |                 |
             +-------------+                 +-------------+
             v                                             v
+--------------------------+                 +--------------------------+
|     Integrity Agent      |                 |      Recovery Agent      |
|  - Anomaly detection     |                 |  - Session validity check|
|  - Clustered submissions |                 |  - Failure log cross-ref |
|  - Rate & timing analysis|                 |  - Evidence synthesis    |
+------------+-------------+                 +-------------+------------+
             |                                             |
             +---------------------+-----------------------+
                                   |
                                   v
                  +-----------------------------------+
                  |          Evidence Agent           |
                  |  - Chronological event timeline   |
                  |  - Verified vs self-reported data |
                  |  - Faculty-ready dossier          |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |   Coordinator Final Assessment    |
                  |  (Recommendation -> Faculty Queue)|
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |     Authorized Faculty Review     |
                  |  (Approve / Reject / Request Info)|
                  +-----------------------------------+
```

### Agent Responsibilities & Rules
1. **Integrity Agent:** Analyzes session attendance records and events for rapid clusters, duplicate attempts, and time-drift. It assigns risk levels (`low`, `medium`, `high`, `unknown`) without treating statistical anomaly as proof of guilt.
2. **Recovery Agent:** Focuses on student-reported failure cases. Evaluates whether the reported class and session were genuinely active at the timestamp, checks for corresponding `scan_rejected` or error event logs, and highlights missing context.
3. **Evidence Agent:** Extracts immutable system event records, sorts timestamps chronologically, distinguishes between hard system records and unverified student claims, and formats an objective evidence dossier.
4. **Coordinator Agent:** Orchestrates execution with strict timeout limits and bounded steps (no infinite loops). Aggregates findings and dispatches the dossier to the human Faculty Decision Center.

---

## 3. Independent QR Attendance Verification Workflow

1. **Session Creation:** Faculty selects class, subject, duration, and creates a session.
2. **Token Generation:** The backend generates a cryptographically random token (`crypto.randomBytes(32)`), stores a SHA-256 hash in `attendance_sessions.token_hash`, and embeds the token with the session ID into the QR code.
3. **Student Scan:** The student scans via `html5-qrcode` or submits the token to `POST /api/v1/attendance/scan`.
4. **Server-Side Validation:**
   - Active session verification (current time must be between `starts_at` and `expires_at`).
   - Token hash comparison (`crypto.createHash('sha256').update(token).digest('hex')`).
   - Uniqueness constraint check (`uq_attendance_session_student`).
   - Atomic recording in `attendance_events` (immutable event log) and `attendance_records` (ledger).

---

## 4. Multi-Tenant Data Isolation

CampusFlow supports tenant isolation using an `institution_id` foreign key across all tables:
- Colleges, departments, classes, subjects, enrollments, and sessions are partitioned by institution.
- PostgreSQL Row-Level Security (RLS) ensures students and faculty only access records belonging to their institution and assigned classes.

