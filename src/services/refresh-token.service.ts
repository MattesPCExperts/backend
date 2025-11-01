import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';
import { hashToken } from '../utils/token';

export class RefreshTokenService {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const tokenHash = hashToken(token);

    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async rotate(oldToken: string, userId: string, newToken: string, expiresAt: Date): Promise<RefreshToken> {
    const existing = await this.validate(oldToken, userId);

    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return this.create(userId, newToken, expiresAt);
  }

  async revoke(token: string, userId: string): Promise<void> {
    const existing = await this.validate(token, userId);
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
  }

  async validate(token: string, userId: string): Promise<RefreshToken> {
    const tokenHash = hashToken(token);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!record || record.userId !== userId) {
      throw new Error('Invalid refresh token');
    }

    if (record.revokedAt) {
      throw new Error('Refresh token revoked');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new Error('Refresh token expired');
    }

    return record;
  }
}

export const refreshTokenService = new RefreshTokenService();

