import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { oauthConfig } from '../../config/oauth';

export class LinkedinOAuthService {
  getAuthorizationUrl(state: string): string {
    const config = oauthConfig.linkedin;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, _req: Request): Promise<{
    accessToken: string;
    refreshToken?: string;
    platformId: string;
    accountName: string;
  }> {
    return {
      accessToken: `linkedin-access-${code}`,
      refreshToken: `linkedin-refresh-${code}`,
      platformId: randomUUID(),
      accountName: 'LinkedIn Page',
    };
  }
}

export const linkedinOAuthService = new LinkedinOAuthService();

