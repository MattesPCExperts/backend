import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email?: string;
}

const secret: Secret = env.JWT_SECRET;

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyToken<T extends object = JwtPayload>(token: string): T {
  return jwt.verify(token, secret) as T;
}

