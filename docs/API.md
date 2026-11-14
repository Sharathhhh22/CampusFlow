# CampusFlow REST API Documentation

Base URL: `/api/v1`

All responses follow a standard envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted information",
    "details": []
  }
}
```

---

## 1. Authentication & Identity

### `GET /auth/me`
Returns current authenticated user profile and roles.
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@apex.edu",
      "full_name": "Alex Rivera",
      "role": "student",
      "institution_id": "uuid",
      "department_id": "uuid"
    }
  }
  ```

### `POST /auth/logout`
Terminates active session and records audit event.

---

## 2. Classes & Subjects

### `GET /classes`
Lists classes for the user's institution.
- **Query Params:** `departmentId` (optional), `page`, `limit`

### `POST /classes` *(Admin only)*
Creates a new academic class section.
- **Body:** `{ "name": "B.Tech CSE Year 3", "academic_year": "2025-2026", "semester": "Semester 6", "section": "A", "department_id": "uuid" }`

---

## 3. Attendance Sessions

### `GET /sessions`
Lists attendance sessions.
- **Query Params:** `status` (`active`, `closed`, `expired`), `classId`, `subjectId`

### `POST /sessions` *(Faculty / Admin)*
Creates a new independent QR attendance session.
- **Body:**
  ```json
  {
    "class_id": "uuid",
    "subject_id": "uuid",
    "duration_minutes": 15
  }
  ```
- **Response:** Returns session record and active QR payload containing the random session token.

### `POST /sessions/:id/close` *(Faculty / Admin)*
Manually closes an active session.

### `GET /sessions/:id/qr` *(Faculty / Admin)*
Retrieves current QR code data for an active session.

---

## 4. Attendance Actions

### `POST /attendance/scan` *(Student)*
Submits a scanned QR token for attendance check-in.
- **Body:**
  ```json
  {
    "session_id": "uuid",
    "token": "plaintext_random_token"
  }
  ```
- **Responses:**
  - `200 OK`: Check-in recorded in `attendance_records` and `attendance_events`.
  - `400 Bad Request`: Expired session or invalid token.
  - `409 Conflict`: Duplicate submission detected.

### `GET /attendance/history`
Retrieves personal attendance history for students, or class attendance history for faculty.

### `POST /attendance/report-issue` *(Student)*
Submits an attendance failure recovery report.
- **Body:**
  ```json
  {
    "session_id": "uuid",
    "issue_category": "network_failure",
    "description": "Wi-Fi disconnected during scanning in Room 402.",
    "occurred_at": "2026-11-14T10:14:00Z"
  }
  ```

---

## 5. Verification Cases & AI Investigations

### `GET /cases`
Lists verification cases. Filterable by `status`, `issue_category`, `student_id`.

### `GET /cases/:id`
Retrieves detailed verification case, timeline, evidence records, and agent runs.

### `POST /cases/:id/additional-information` *(Student)*
Appends clarifying details requested by faculty.

### `POST /cases/:id/analyze` *(Faculty / Admin)*
Triggers the Multi-Agent AI investigation pipeline (Coordinator, Integrity, Recovery, Evidence agents).

---

## 6. Faculty Decisions

### `POST /cases/:id/decision` *(Faculty / Admin)*
Submits final human verdict on a recovery case.
- **Body:**
  ```json
  {
    "decision": "approved",
    "reason": "Verified network interruption in Room 402 with IT logs; student was in class.",
    "internal_note": "Approved per faculty discretion."
  }
  ```

---

## 7. Analytics

### `GET /analytics/summary`
Dashboard metrics: total students, sessions, active recoveries, resolution rates.

### `GET /analytics/issues`
Breakdown of attendance exceptions by category and class.

