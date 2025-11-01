import type { NextFunction, Request, Response } from 'express';
import { socialAccountService } from '../services/social-account.service';
import { socialService, type SocialPlatform } from '../services/social.service';
import { createHttpError } from '../utils/http-error';

export async function initiateOAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const platform = req.params.platform as SocialPlatform;
    const state = socialService.generateState();
    const authorizationUrl = socialService.getAuthorizationUrl(platform, state);

    res.status(200).json({ authorizationUrl, state });
  } catch (error) {
    next(error);
  }
}

export async function handleOAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const platform = req.params.platform as SocialPlatform;
    const { code } = req.body as { code: string };

    const tokenResponse = await socialService.exchangeCode(platform, code, req);

    await socialAccountService.upsertAccount(req.user.id, platform, {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      accountName: tokenResponse.accountName,
      platformId: tokenResponse.platformId,
    });

    res.status(200).json({ message: 'Account connected successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getConnectionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const platform = req.params.platform as SocialPlatform;
    const account = await socialAccountService.getAccount(req.user.id, platform);

    res.status(200).json({
      platform,
      connected: Boolean(account?.isActive),
      accountName: account?.accountName ?? null,
      refreshedAt: account?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    next(error);
  }
}

export async function disconnectAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const platform = req.params.platform as SocialPlatform;
    await socialAccountService.deactivateAccount(req.user.id, platform);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

