import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.createHash('sha256').update(env.TOKEN_ENCRYPTION_KEY).digest();

export interface EncryptedPayload {
  iv: string;
  authTag: string;
  value: string;
}

export function encrypt(text: string): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    value: encrypted.toString('base64'),
  };
}

export function decrypt(payload: EncryptedPayload): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.value, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function serializeEncrypted(payload: EncryptedPayload): string {
  return JSON.stringify(payload);
}

export function deserializeEncrypted(serialized: string): EncryptedPayload {
  return JSON.parse(serialized) as EncryptedPayload;
}

