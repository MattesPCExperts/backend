import { randomBytes } from 'crypto';
import type { Request } from 'express';
import { facebookOAuthService } from './oauth/facebook-oauth.service';
import { instagramOAuthService } from './oauth/instagram-oauth.service';
import { twitterOAuthService } from './oauth/twitter-oauth.service';
import { linkedinOAuthService } from './oauth/linkedin-oauth.service';
import { createHttpError } from '../utils/http-error';

const providers = {
  facebook: facebookOAuthService,
  instagram: instagramOAuthService,
  twitter: twitterOAuthService,
  linkedin: linkedinOAuthService,
} as const;

export type SocialPlatform = keyof typeof providers;

export class SocialService {
  generateState(): string {
    return randomBytes(16).toString('hex');
  }

  getAuthorizationUrl(platform: SocialPlatform, state: string): string {
    return this.getProvider(platform).getAuthorizationUrl(state);
  }

  async exchangeCode(platform: SocialPlatform, code: string, req: Request) {
    return this.getProvider(platform).exchangeCodeForToken(code, req);
  }

  private getProvider(platform: SocialPlatform) {
    const provider = providers[platform];
    if (!provider) {
      throw createHttpError(400, `Unsupported platform: ${platform}`);
    }
    return provider;
  }
}

export const socialService = new SocialService();

