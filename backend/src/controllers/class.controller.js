import { classRepository } from '../repositories/class.repository.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string().uuid(),
  academic_year: z.string().min(4).max(20),
  semester: z.string().min(1).max(20),
  section: z.string().min(1).max(10)
});

export const classController = {
  async listClasses(req, res, next) {
    try {
      const { departmentId } = req.query;
      const classes = await classRepository.listByInstitution(req.user.institution_id, departmentId || null);
      res.json({
        success: true,
        data: classes,
        message: 'Classes retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getClassById(req, res, next) {
    try {
      const cls = await classRepository.findById(req.params.id);
      if (!cls || cls.institution_id !== req.user.institution_id) {
        throw new AppError('Class not found', 404, 'CLASS_NOT_FOUND');
      }

      const subjects = await classRepository.listSubjectsByClass(cls.id);

      res.json({
        success: true,
        data: {
          ...cls,
          subjects
        },
        message: 'Class details retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async createClass(req, res, next) {
    try {
      const validated = createClassSchema.parse(req.body);
      const newClass = await classRepository.create({
        institution_id: req.user.institution_id,
        ...validated
      });

      res.status(201).json({
        success: true,
        data: newClass,
        message: 'Class section created successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async listSubjects(req, res, next) {
    try {
      const subjects = await classRepository.listSubjectsByClass(req.params.id);
      res.json({
        success: true,
        data: subjects,
        message: 'Class subjects retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

