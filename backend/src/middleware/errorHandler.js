import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint '${req.originalUrl}' does not exist.`
    }
  });
};

export const errorHandler = (err, req, res, next) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the submitted information',
        details: formatted
      }
    });
  }

  // Handle Explicit AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  // Handle JSON Body Parser Errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body'
      }
    });
  }

  // Handle PostgreSQL Database Errors gracefully
  if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    console.error('⚠️ Database Error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_RECORD',
          message: 'A duplicate record already exists with the submitted identifier'
        }
      });
    }
  }

  // Log unexpected errors internally, never leak to client
  console.error('💥 Unhandled Internal Server Error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    }
  });
};

