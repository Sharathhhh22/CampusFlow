import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsController = {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsRepository.getSummary(req.user.institution_id);
      res.json({
        success: true,
        data: summary,
        message: 'Summary analytics retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getIssues(req, res, next) {
    try {
      const issues = await analyticsRepository.getIssuesBreakdown(req.user.institution_id);
      res.json({
        success: true,
        data: issues,
        message: 'Attendance issue breakdown retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecovery(req, res, next) {
    try {
      const trends = await analyticsRepository.getRecoveryTrends(req.user.institution_id);
      res.json({
        success: true,
        data: trends,
        message: 'Recovery trends retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

