import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { oauthConfig } from '../../config/oauth';

export class InstagramOAuthService {
  getAuthorizationUrl(state: string): string {
    const config = oauthConfig.instagram;
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(','),
      response_type: 'code',
      state,
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, _req: Request): Promise<{
    accessToken: string;
    refreshToken?: string;
    platformId: string;
    accountName: string;
  }> {
    return {
      accessToken: `instagram-access-${code}`,
      refreshToken: `instagram-refresh-${code}`,
      platformId: randomUUID(),
      accountName: 'Instagram Business Account',
    };
  }
}

export const instagramOAuthService = new InstagramOAuthService();

