import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on load
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('campusflow_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('campusflow_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Session verification error, clearing stored auth:', err.message);
        localStorage.removeItem('campusflow_token');
        localStorage.removeItem('campusflow_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { profile, token: authToken } = res.data;
      setUser(profile);
      setToken(authToken);
      localStorage.setItem('campusflow_user', JSON.stringify(profile));
      localStorage.setItem('campusflow_token', authToken);
      return profile;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.success && res.data) {
      const { profile, token: authToken } = res.data;
      setUser(profile);
      setToken(authToken);
      localStorage.setItem('campusflow_user', JSON.stringify(profile));
      localStorage.setItem('campusflow_token', authToken);
      return profile;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('campusflow_token');
      localStorage.removeItem('campusflow_user');
      setUser(null);
      setToken(null);
    }
  };

  // Instant demo role switch for evaluators & demonstration
  const switchDemoRole = async (role) => {
    const demoProfiles = {
      student: {
        id: '33333333-3333-3333-3333-333333333333',
        institution_id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Alex Rivera',
        email: 'student@apex.edu',
        role: 'student',
        department_name: 'Computer Science and Engineering',
        is_active: true
      },
      faculty: {
        id: '33333333-3333-3333-3333-333333333332',
        institution_id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Prof. Marcus Vance',
        email: 'faculty@apex.edu',
        role: 'faculty',
        department_name: 'Computer Science and Engineering',
        is_active: true
      },
      admin: {
        id: '33333333-3333-3333-3333-333333333331',
        institution_id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Dr. Sarah Jenkins',
        email: 'admin@apex.edu',
        role: 'admin',
        department_name: 'Computer Science and Engineering',
        is_active: true
      }
    };

    const targetProfile = demoProfiles[role] || demoProfiles.student;
    const targetToken = `demo-${role}-token`;

    setUser(targetProfile);
    setToken(targetToken);
    localStorage.setItem('campusflow_user', JSON.stringify(targetProfile));
    localStorage.setItem('campusflow_token', targetToken);
    return targetProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

