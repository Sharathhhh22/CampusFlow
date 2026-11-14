import { profileRepository } from '../repositories/profile.repository.js';
import { institutionRepository } from '../repositories/institution.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/db.js';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['student', 'faculty', 'admin'])
});

export const adminController = {
  async listUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await profileRepository.listByInstitution(req.user.institution_id, role || null);
      res.json({
        success: true,
        data: users,
        message: 'Institution users retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const validated = updateRoleSchema.parse(req.body);

      // Prevent self-demoting from admin if only one admin exists
      if (req.params.id === req.user.id && validated.role !== 'admin') {
        throw new AppError('Cannot demote your own administrator account', 400, 'SELF_DEMOTION_PREVENTED');
      }

      const updated = await profileRepository.updateRole(req.params.id, validated.role);
      if (!updated) {
        throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
      }

      // Record audit log
      if (db.isPostgres()) {
        await db.query(
          `INSERT INTO audit_logs (id, institution_id, actor_id, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, 'role_updated', 'profile', $4, $5)`,
          [crypto.randomUUID(), req.user.institution_id, req.user.id, req.params.id, JSON.stringify({ new_role: validated.role })]
        );
      } else {
        db.getStore().audit_logs.push({
          id: crypto.randomUUID(),
          institution_id: req.user.institution_id,
          actor_id: req.user.id,
          action: 'role_updated',
          entity_type: 'profile',
          entity_id: req.params.id,
          details: { new_role: validated.role },
          created_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: updated,
        message: `User role updated to '${validated.role}' successfully`
      });
    } catch (err) {
      next(err);
    }
  },

  async listInstitutions(req, res, next) {
    try {
      const institutions = await institutionRepository.listAll();
      res.json({
        success: true,
        data: institutions,
        message: 'Institutions retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async listAuditLogs(req, res, next) {
    try {
      if (db.isPostgres()) {
        const { rows } = await db.query(
          `SELECT al.*, p.full_name as actor_name, p.email as actor_email
           FROM audit_logs al
           LEFT JOIN profiles p ON al.actor_id = p.id
           WHERE al.institution_id = $1
           ORDER BY al.created_at DESC
           LIMIT 100`,
          [req.user.institution_id]
        );
        return res.json({
          success: true,
          data: rows,
          message: 'Audit logs retrieved successfully'
        });
      }

      const store = db.getStore();
      const logs = store.audit_logs
        .filter(l => l.institution_id === req.user.institution_id)
        .map(l => {
          const actor = store.profiles.find(p => p.id === l.actor_id);
          return {
            ...l,
            actor_name: actor?.full_name || 'System / Admin',
            actor_email: actor?.email || ''
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json({
        success: true,
        data: logs,
        message: 'Audit logs retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

