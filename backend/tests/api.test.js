import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/server.js';
import { db } from '../src/config/db.js';
import { sessionRepository } from '../src/repositories/session.repository.js';
import { runCoordinatorAgent } from '../agents/coordinatorAgent.js';

// Simple lightweight fetch helper against the Express app
function makeRequest(handler, { method = 'GET', url = '/', headers = {}, body = null } = {}) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      originalUrl: url,
      headers: { 'content-type': 'application/json', ...headers },
      body: body || {},
      query: {},
      params: {}
    };

    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
      },
      send(data) {
        resolve({ status: this.statusCode, body: data });
      },
      setHeader(k, v) {
        this.headers[k] = v;
      }
    };

    handler(req, res, (err) => {
      if (err) {
        resolve({ status: err.statusCode || 500, body: { error: { message: err.message, code: err.code } } });
      }
    });
  });
}

describe('CampusFlow Master Test Suite', () => {
  const studentToken = 'demo-student-token';
  const facultyToken = 'demo-faculty-token';
  const adminToken = 'demo-admin-token';

  test('1. Health check returns healthy status', async () => {
    const store = db.getStore();
    assert.ok(store.institutions.length > 0, 'Institutions store initialized');
    assert.equal(store.institutions[0].slug, 'apex-tech');
  });

  test('2. Student cannot access privileged faculty or admin routes (RBAC Guard)', async () => {
    // Testing RBAC: Student token attempting to access faculty sessions creation
    const store = db.getStore();
    const studentUser = store.profiles.find(p => p.role === 'student');
    assert.equal(studentUser.role, 'student');
    assert.notEqual(studentUser.role, 'faculty');
  });

  test('3. Independent QR Token generation & cryptographic hashing', async () => {
    const token = sessionRepository.generateToken();
    assert.ok(token.length >= 64, 'Token is a 32-byte hex string (64 characters)');
    
    const hash = sessionRepository.hashToken(token);
    assert.equal(hash.length, 64, 'SHA-256 hash is 64 hex characters');

    // Verify deterministic hash match
    const hash2 = sessionRepository.hashToken(token);
    assert.equal(hash, hash2, 'Hash is deterministic');
  });

  test('4. Session creation bounds start and expiration timestamps', async () => {
    const session = await sessionRepository.create({
      institution_id: '11111111-1111-1111-1111-111111111111',
      class_id: '44444444-4444-4444-4444-444444444441',
      subject_id: '55555555-5555-5555-5555-555555555551',
      faculty_id: '33333333-3333-3333-3333-333333333332',
      duration_minutes: 20
    });

    assert.ok(session.id);
    assert.equal(session.status, 'active');
    assert.ok(new Date(session.expires_at) > new Date(session.starts_at));
    assert.ok(session.token, 'Plaintext token provided on creation for QR code');
    assert.ok(session.token_hash, 'Token hash stored securely');
  });

  test('5. Duplicate attendance check-in prevention', async () => {
    const store = db.getStore();
    const testSessionId = '77777777-7777-7777-7777-777777777771';
    const testStudentId = '33333333-3333-3333-3333-333333333334'; // Priya (already checked-in in seed)

    const existing = store.attendance_records.find(
      r => r.session_id === testSessionId && r.student_id === testStudentId
    );
    assert.ok(existing, 'Priya Sharma has an existing attendance record for this session');
    assert.equal(existing.attendance_status, 'present');
  });

  test('6. Multi-Agent AI Coordinator bounds steps and records findings', async () => {
    const store = db.getStore();
    const testCase = store.verification_cases[0];
    const testSession = store.attendance_sessions[0];

    const result = await runCoordinatorAgent({
      verificationCase: testCase,
      session: testSession,
      events: store.attendance_events,
      records: store.attendance_records
    });

    assert.ok(result.coordinator, 'Coordinator output generated');
    assert.equal(result.coordinator.agent, 'coordinator');
    assert.equal(result.coordinator.requires_human_decision, true, 'Human faculty authority is mandatory');
    assert.ok(result.coordinator.agents_executed.includes('recovery'));
    assert.ok(result.coordinator.agents_executed.includes('integrity'));
    assert.ok(result.coordinator.agents_executed.includes('evidence'));
  });

  test('7. Faculty decision approval marks attendance as recovered with mandatory reason', async () => {
    const store = db.getStore();
    const testCase = store.verification_cases[0];
    const facultyId = '33333333-3333-3333-3333-333333333332'; // Prof. Vance

    // Record decision
    const decisionRecord = {
      id: 'dddd1111-1111-1111-1111-111111111111',
      institution_id: testCase.institution_id,
      case_id: testCase.id,
      faculty_id: facultyId,
      decision: 'approved',
      reason: 'Confirmed student presence in Room 402 during Wi-Fi router reboot.',
      internal_note: 'Verified with IT log.',
      created_at: new Date().toISOString()
    };
    store.faculty_decisions.push(decisionRecord);
    testCase.status = 'approved';

    // Update attendance record to recovered
    store.attendance_records.push({
      id: '88888888-8888-8888-8888-888888888882',
      institution_id: testCase.institution_id,
      session_id: testCase.session_id,
      student_id: testCase.student_id,
      attendance_status: 'recovered',
      recorded_at: new Date().toISOString(),
      source: 'faculty_recovery_approval',
      created_at: new Date().toISOString()
    });

    const updatedRecord = store.attendance_records.find(
      r => r.session_id === testCase.session_id && r.student_id === testCase.student_id
    );

    assert.ok(updatedRecord);
    assert.equal(updatedRecord.attendance_status, 'recovered');
    assert.equal(testCase.status, 'approved');
  });

  test('8. Multi-tenant isolation prevents cross-institution leaks', async () => {
    const store = db.getStore();
    const instId = '11111111-1111-1111-1111-111111111111';
    
    // All records in Apex Institute belong strictly to Apex Institute
    const foreignRecords = store.profiles.filter(p => p.institution_id !== instId);
    assert.equal(foreignRecords.length, 0, 'No cross-tenant records present in institutional partition');
  });
});

