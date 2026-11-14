import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor: Attach JWT authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: Standardized error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on authentication failure
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('campusflow_token');
        localStorage.removeItem('campusflow_user');
      }
    }
    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed. Please check your connection.'
    };
    return Promise.reject(customError);
  }
);

export const authApi = {
  getMe: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.patch('/auth/profile', data)
};

export const classApi = {
  list: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  getSubjects: (classId) => api.get(`/classes/${classId}/subjects`)
};

export const sessionApi = {
  list: (params) => api.get('/sessions', { params }),
  create: (data) => api.post('/sessions', data),
  getById: (id) => api.get(`/sessions/${id}`),
  close: (id) => api.post(`/sessions/${id}/close`),
  getQR: (id) => api.get(`/sessions/${id}/qr`)
};

export const attendanceApi = {
  scan: (data) => api.post('/attendance/scan', data),
  getHistory: (params) => api.get('/attendance/history', { params }),
  getSessionAttendees: (sessionId) => api.get(`/attendance/session/${sessionId}`),
  reportIssue: (data) => api.post('/attendance/report-issue', data)
};

export const caseApi = {
  list: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  addAdditionalInfo: (id, data) => api.post(`/cases/${id}/additional-information`, data),
  analyze: (id) => api.post(`/cases/${id}/analyze`),
  getAgentActivity: (id) => api.get(`/cases/${id}/agent-activity`)
};

export const decisionApi = {
  record: (caseId, data) => api.post(`/cases/${caseId}/decision`, data),
  list: (caseId) => api.get(`/cases/${caseId}/decisions`)
};

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getIssues: () => api.get('/analytics/issues'),
  getRecovery: () => api.get('/analytics/recovery')
};

export const adminApi = {
  listUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (userId, data) => api.patch(`/admin/users/${userId}/role`, data),
  listInstitutions: () => api.get('/admin/institutions'),
  listAuditLogs: () => api.get('/admin/audit-logs')
};

export default api;

