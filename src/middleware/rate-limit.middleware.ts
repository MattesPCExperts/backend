import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

