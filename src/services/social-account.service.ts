import { SocialAccount } from '@prisma/client';
import { prisma } from '../config/database';
import { encrypt, serializeEncrypted } from '../utils/crypto';
import { createHttpError } from '../utils/http-error';

export interface SocialTokenPayload {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date | null;
  accountName?: string;
  platformId?: string;
}

export class SocialAccountService {
  async upsertAccount(
    userId: string,
    platform: string,
    payload: SocialTokenPayload,
  ): Promise<SocialAccount> {
    const encryptedAccess = serializeEncrypted(encrypt(payload.accessToken));
    const encryptedRefresh = payload.refreshToken
      ? serializeEncrypted(encrypt(payload.refreshToken))
      : null;

    const data = {
      platform,
      platformId: payload.platformId ?? 'pending',
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      expiresAt: payload.expiresAt ?? null,
      isActive: true,
      accountName: payload.accountName ?? null,
    } satisfies Partial<SocialAccount> & { platform: string; platformId: string; accessToken: string };

    return prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform,
          platformId: data.platformId,
        },
      },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async listAccounts(userId: string): Promise<SocialAccount[]> {
    return prisma.socialAccount.findMany({
      where: { userId },
    });
  }

  async deactivateAccount(userId: string, platform: string): Promise<void> {
    const updated = await prisma.socialAccount.updateMany({
      where: { userId, platform, isActive: true },
      data: { isActive: false },
    });

    if (updated.count === 0) {
      throw createHttpError(404, 'Social account not found');
    }
  }

  async getAccount(userId: string, platform: string): Promise<SocialAccount | null> {
    return prisma.socialAccount.findFirst({
      where: { userId, platform, isActive: true },
    });
  }
}

export const socialAccountService = new SocialAccountService();

