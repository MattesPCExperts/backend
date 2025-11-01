import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { oauthConfig } from '../../config/oauth';

export class TwitterOAuthService {
  getAuthorizationUrl(state: string): string {
    const config = oauthConfig.twitter;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
      code_challenge: state,
      code_challenge_method: 'plain',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, _req: Request): Promise<{
    accessToken: string;
    refreshToken?: string;
    platformId: string;
    accountName: string;
  }> {
    return {
      accessToken: `twitter-access-${code}`,
      refreshToken: `twitter-refresh-${code}`,
      platformId: randomUUID(),
      accountName: 'Twitter Account',
    };
  }
}

export const twitterOAuthService = new TwitterOAuthService();

