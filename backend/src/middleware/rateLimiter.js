import rateLimit from 'express-rate-limit';

// Standard API rate limiter (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this client. Please try again after 15 minutes.'
    }
  }
});

// Sensitive rate limiter for QR Attendance Scanning (60 requests per 10 minutes)
export const scanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'SCAN_RATE_LIMIT_EXCEEDED',
      message: 'Too many attendance scan attempts. Please wait a moment before trying again.'
    }
  }
});

// Issue reporting limiter (20 reports per hour)
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED',
      message: 'Maximum issue reports reached for this hour. Please try again later.'
    }
  }
});

