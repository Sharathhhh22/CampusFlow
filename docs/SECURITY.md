# CampusFlow Security Architecture & Hardening

Security and trust are foundational to CampusFlow. This document defines the security guarantees, boundaries, and implementation details.

---

## 1. Authentication & Role-Based Access Control (RBAC)

1. **Authentication Engine:** Supabase Auth (JWT tokens verified server-side).
2. **Roles:**
   - `student`: Can register publicly, scan QR codes, report attendance recovery cases, submit additional info, view personal attendance and cases.
   - `faculty`: Can create and monitor sessions, review assigned cases, inspect AI agent evidence summaries, approve/reject recovery requests with reasons.
   - `admin`: Manages users, classes, subjects, view institutional audit logs and system analytics.
3. **Privilege Escalation Prevention:**
   - Registration endpoints strictly force the `student` role.
   - Elevated roles (`faculty`, `admin`) can never be self-assigned; they must be provisioned by an institution admin or created via initial migration seeds.

---

## 2. Row Level Security (RLS) & Multi-Tenant Data Isolation

- Every table has RLS explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- `institution_id` partition checks prevent any user from inspecting or tampering with another institution's data.
- Students can only SELECT their own records and enrollments.
- Direct UPDATE/DELETE by students on `attendance_records` and `attendance_events` is blocked at the database level.

---

## 3. QR Token Security & Fraud Resistance

- **Cryptographic Generation:** Session tokens are generated using cryptographically secure random bytes (`crypto.randomBytes(32)`).
- **Hashed Storage:** The database stores a SHA-256 hash of the session token (`token_hash`), preventing token harvesting from read-only leaks.
- **Server-Side Expiration:** Timestamps are computed and validated exclusively on the Express backend (`starts_at <= now <= expires_at`). Frontend timestamps are never trusted.
- **Duplicate Prevention:** Enforced by PostgreSQL unique constraints (`uq_attendance_session_student`) to prevent race conditions and concurrent double-scanning.
- **Rate Limiting:** Attendance scan endpoints are rate-limited per IP and user to prevent brute-force token guessing.

---

## 4. Agentic AI Safety & Human-in-the-Loop Governance

1. **Human Authority Rule:** AI agents never mark attendance as present, never approve recovery cases, and never issue penalties. All decisions require an authenticated faculty member's recorded reason.
2. **Prompt Injection Defense:** Student-submitted descriptions and report texts are treated as strictly untrusted user data. They are escaped and provided inside isolated JSON data contexts, with explicit instructions forbidding them from overriding system policies.
3. **Structured Validation:** All AI agent responses are schema-validated using Zod before insertion or presentation. Malformed responses trigger safe, rule-based fallback summaries.
4. **Credential Isolation:** The Google Gemini API key (`GEMINI_API_KEY`) is strictly confined to the backend environment and never sent to or visible in the frontend browser client.
5. **No Hallucination Policy:** Agents are explicitly instructed to cite specific database record IDs. If an event log is absent, the agent must report "no matching log found" rather than inventing one.

