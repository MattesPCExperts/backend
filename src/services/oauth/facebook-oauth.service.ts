import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { oauthConfig } from '../../config/oauth';

export class FacebookOAuthService {
  getAuthorizationUrl(state: string): string {
    const config = oauthConfig.facebook;
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
      accessToken: `facebook-access-${code}`,
      refreshToken: `facebook-refresh-${code}`,
      platformId: randomUUID(),
      accountName: 'Facebook Page',
    };
  }
}

export const facebookOAuthService = new FacebookOAuthService();

