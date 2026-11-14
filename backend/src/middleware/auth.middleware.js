import { supabaseAdmin, supabaseClient } from '../config/supabase.js';
import { db } from '../config/db.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    let userId = null;
    let userEmail = null;

    // 1. Support Dev / Demo Mock Tokens for smooth local evaluation & testing
    if (token === 'demo-student-token' || token === 'student') {
      userId = '33333333-3333-3333-3333-333333333333';
    } else if (token === 'demo-faculty-token' || token === 'faculty') {
      userId = '33333333-3333-3333-3333-333333333332';
    } else if (token === 'demo-admin-token' || token === 'admin') {
      userId = '33333333-3333-3333-3333-333333333331';
    } else if (token.startsWith('user_')) {
      userId = token.replace('user_', '');
    } else if (supabaseAdmin || supabaseClient) {
      // 2. Verify with Supabase Auth
      const client = supabaseAdmin || supabaseClient;
      const { data: { user }, error } = await client.auth.getUser(token);

      if (error || !user) {
        throw new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN');
      }

      userId = user.id;
      userEmail = user.email;
    } else {
      // In standalone demo mode with custom JWT / tokens
      userId = token;
    }

    // 3. Fetch user profile from database or in-memory store
    let profile = null;

    if (db.isPostgres()) {
      const { rows } = await db.query(
        'SELECT id, institution_id, full_name, email, role, department_id, is_active FROM profiles WHERE id = $1',
        [userId]
      );
      if (rows.length > 0) {
        profile = rows[0];
      }
    } else {
      const store = db.getStore();
      profile = store.profiles.find(p => p.id === userId || (userEmail && p.email === userEmail));
    }

    if (!profile) {
      // If user exists in Auth but not in profiles yet, create a default student profile
      if (userId && userEmail) {
        profile = {
          id: userId,
          institution_id: '11111111-1111-1111-1111-111111111111',
          full_name: userEmail.split('@')[0],
          email: userEmail,
          role: 'student',
          department_id: null,
          is_active: true
        };
        if (!db.isPostgres()) {
          db.getStore().profiles.push(profile);
        }
      } else {
        throw new AppError('User profile not found. Please register or contact administrator.', 401, 'PROFILE_NOT_FOUND');
      }
    }

    if (!profile.is_active) {
      throw new AppError('User account is deactivated. Please contact your institution admin.', 403, 'ACCOUNT_DEACTIVATED');
    }

    req.user = profile;
    next();
  } catch (err) {
    next(err);
  }
};

