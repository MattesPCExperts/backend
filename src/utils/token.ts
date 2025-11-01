import crypto from 'crypto';
import ms, { type StringValue } from 'ms';
import { env } from '../config/env';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function calculateAccessExpiry(): Date {
  return calculateExpiry(env.JWT_EXPIRES_IN);
}

export function calculateRefreshExpiry(): Date {
  return calculateExpiry(env.JWT_REFRESH_EXPIRES_IN);
}

function calculateExpiry(duration: string): Date {
  const milliseconds = ms(duration as StringValue);
  if (typeof milliseconds !== 'number') {
    throw new Error(`Invalid duration string: ${duration}`);
  }

  return new Date(Date.now() + milliseconds);
}

