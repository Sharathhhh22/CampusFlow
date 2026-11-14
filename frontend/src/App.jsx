import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AttendanceHistoryPage } from './pages/student/AttendanceHistoryPage';
import { QRScanPage } from './pages/student/QRScanPage';
import { ReportIssuePage } from './pages/student/ReportIssuePage';
import { CasesListPage } from './pages/student/CasesListPage';
import { CaseDetailPage } from './pages/student/CaseDetailPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { SessionsListPage } from './pages/faculty/SessionsListPage';
import { CreateSessionPage } from './pages/faculty/CreateSessionPage';
import { SessionDetailPage } from './pages/faculty/SessionDetailPage';
import { ClassAttendancePage } from './pages/faculty/ClassAttendancePage';
import { FacultyCasesPage } from './pages/faculty/FacultyCasesPage';
import { FacultyCaseReviewPage } from './pages/faculty/FacultyCaseReviewPage';
import { FacultyAnalyticsPage } from './pages/faculty/FacultyAnalyticsPage';
import { FacultyProfilePage } from './pages/faculty/FacultyProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ClassManagementPage } from './pages/admin/ClassManagementPage';
import { AdminSessionsPage } from './pages/admin/AdminSessionsPage';
import { AdminCasesPage } from './pages/admin/AdminCasesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Authenticated Application with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<RoleGuard allowedRoles={['student']}><StudentDashboard /></RoleGuard>} />
            <Route path="/student/attendance" element={<RoleGuard allowedRoles={['student']}><AttendanceHistoryPage /></RoleGuard>} />
            <Route path="/student/scan" element={<RoleGuard allowedRoles={['student']}><QRScanPage /></RoleGuard>} />
            <Route path="/student/report-issue" element={<RoleGuard allowedRoles={['student']}><ReportIssuePage /></RoleGuard>} />
            <Route path="/student/cases" element={<RoleGuard allowedRoles={['student']}><CasesListPage /></RoleGuard>} />
            <Route path="/student/cases/:id" element={<RoleGuard allowedRoles={['student']}><CaseDetailPage /></RoleGuard>} />
            <Route path="/student/profile" element={<RoleGuard allowedRoles={['student']}><ProfilePage /></RoleGuard>} />

            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={<RoleGuard allowedRoles={['faculty', 'admin']}><FacultyDashboard /></RoleGuard>} />
            <Route path="/faculty/sessions" element={<RoleGuard allowedRoles={['faculty', 'admin']}><SessionsListPage /></RoleGuard>} />
            <Route path="/faculty/sessions/create" element={<RoleGuard allowedRoles={['faculty', 'admin']}><CreateSessionPage /></RoleGuard>} />
            <Route path="/faculty/sessions/:id" element={<RoleGuard allowedRoles={['faculty', 'admin']}><SessionDetailPage /></RoleGuard>} />
            <Route path="/faculty/attendance" element={<RoleGuard allowedRoles={['faculty', 'admin']}><ClassAttendancePage /></RoleGuard>} />
            <Route path="/faculty/cases" element={<RoleGuard allowedRoles={['faculty', 'admin']}><FacultyCasesPage /></RoleGuard>} />
            <Route path="/faculty/cases/:id" element={<RoleGuard allowedRoles={['faculty', 'admin']}><FacultyCaseReviewPage /></RoleGuard>} />
            <Route path="/faculty/analytics" element={<RoleGuard allowedRoles={['faculty', 'admin']}><FacultyAnalyticsPage /></RoleGuard>} />
            <Route path="/faculty/profile" element={<RoleGuard allowedRoles={['faculty', 'admin']}><FacultyProfilePage /></RoleGuard>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
            <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><UserManagementPage /></RoleGuard>} />
            <Route path="/admin/classes" element={<RoleGuard allowedRoles={['admin']}><ClassManagementPage /></RoleGuard>} />
            <Route path="/admin/sessions" element={<RoleGuard allowedRoles={['admin']}><AdminSessionsPage /></RoleGuard>} />
            <Route path="/admin/cases" element={<RoleGuard allowedRoles={['admin']}><AdminCasesPage /></RoleGuard>} />
            <Route path="/admin/analytics" element={<RoleGuard allowedRoles={['admin']}><AdminAnalyticsPage /></RoleGuard>} />
            <Route path="/admin/settings" element={<RoleGuard allowedRoles={['admin']}><AdminSettingsPage /></RoleGuard>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

