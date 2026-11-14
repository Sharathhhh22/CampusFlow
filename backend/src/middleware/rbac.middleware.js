import { AppError } from './errorHandler.js';

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}`,
        403,
        'FORBIDDEN_ROLE'
      ));
    }

    next();
  };
};

export const requireInstitution = (req, res, next) => {
  if (!req.user || !req.user.institution_id) {
    return next(new AppError('User is not associated with an institution.', 403, 'NO_INSTITUTION'));
  }
  next();
};

