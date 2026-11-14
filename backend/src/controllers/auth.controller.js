import { profileRepository } from '../repositories/profile.repository.js';
import { institutionRepository } from '../repositories/institution.repository.js';
import { supabaseAdmin, supabaseClient } from '../config/supabase.js';
import { registerSchema, loginSchema, profileUpdateSchema } from '../validators/auth.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/db.js';

export const authController = {
  async getMe(req, res, next) {
    try {
      const fullProfile = await profileRepository.findById(req.user.id);
      res.json({
        success: true,
        data: fullProfile || req.user,
        message: 'Profile retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);

      // Find target institution
      const inst = await institutionRepository.findBySlug(validated.institution_slug);
      if (!inst) {
        throw new AppError('The specified institution does not exist.', 404, 'INSTITUTION_NOT_FOUND');
      }

      // Check for existing profile with same email
      const existing = await profileRepository.findByEmail(validated.email);
      if (existing) {
        throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
      }

      let userId = crypto.randomUUID();
      let sessionToken = 'demo-student-token';

      // If Supabase Auth is configured, sign up via Supabase Auth
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: validated.email,
          password: validated.password,
          email_confirm: true,
          user_metadata: {
            full_name: validated.full_name,
            role: 'student'
          }
        });

        if (error) {
          throw new AppError(error.message, 400, 'AUTH_SIGNUP_ERROR');
        }
        userId = data.user.id;
      } else if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              full_name: validated.full_name,
              role: 'student'
            }
          }
        });
        if (error) {
          throw new AppError(error.message, 400, 'AUTH_SIGNUP_ERROR');
        }
        if (data.user) {
          userId = data.user.id;
        }
      }

      // Create application profile strictly with role='student'
      const profile = await profileRepository.create({
        id: userId,
        institution_id: inst.id,
        full_name: validated.full_name,
        email: validated.email,
        role: 'student', // Non-privileged role strictly enforced
        department_id: validated.department_id || null
      });

      // Audit log
      if (!db.isPostgres()) {
        db.getStore().audit_logs.push({
          id: crypto.randomUUID(),
          institution_id: inst.id,
          actor_id: profile.id,
          action: 'user_registered',
          entity_type: 'profile',
          entity_id: profile.id,
          details: { role: 'student' },
          created_at: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        data: {
          profile,
          token: sessionToken
        },
        message: 'Student account registered successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);

      // Check if user exists in profile repository
      const profile = await profileRepository.findByEmail(validated.email);
      if (!profile) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      let token = `demo-${profile.role}-token`;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: validated.email,
          password: validated.password
        });

        if (error) {
          // If Supabase Auth rejects, in demo fallback we allow valid demo seed emails
          if (!['admin@apex.edu', 'faculty@apex.edu', 'student@apex.edu', 'priya@apex.edu', 'jordan@apex.edu'].includes(validated.email)) {
            throw new AppError(error.message, 401, 'AUTH_LOGIN_ERROR');
          }
        } else if (data.session) {
          token = data.session.access_token;
        }
      }

      res.json({
        success: true,
        data: {
          profile,
          token
        },
        message: 'Logged in successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      res.json({
        success: true,
        data: null,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validated = profileUpdateSchema.parse(req.body);
      const updated = await profileRepository.findById(req.user.id);
      if (validated.full_name) updated.full_name = validated.full_name;
      if (validated.department_id) updated.department_id = validated.department_id;

      res.json({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

