// Security Middleware Module
// Enterprise compliant security setup

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // requests per window

export function setupSecurity(app) {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        connectSrc: ['\'self\'', 'ws:', 'wss:'],
        scriptSrc: ['\'self\'']
      }
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
    message: 'Too many requests, please try again later.'
  });

  app.use(limiter);
}

export default { setupSecurity };
