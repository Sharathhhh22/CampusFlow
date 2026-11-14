import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or any origin in dev/preview
    if (!origin) return callback(null, true);
    if (!env.FRONTEND_URL || env.FRONTEND_URL === '*') return callback(null, true);

    const configured = env.FRONTEND_URL.split(',').map(s => s.trim().replace(/\/$/, ''));
    if (
      configured.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing & Logging
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Global API Rate Limiting
app.use('/api/', apiLimiter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CampusFlow API',
    tagline: 'Fair Attendance. Fewer Disputes. Less Manual Work.',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// Mount Versioned API Routes
app.use('/api/v1', apiRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if not in test mode
let server = null;
if (env.NODE_ENV !== 'test') {
  server = app.listen(env.PORT, () => {
    console.log(`🚀 [CampusFlow Backend] Server running on port ${env.PORT}`);
    console.log(`🌐 Base API endpoint: http://localhost:${env.PORT}/api/v1`);
    console.log(`🛡️  Environment: ${env.NODE_ENV}`);
  });
}

export { app, server };
export default app;

