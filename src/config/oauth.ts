import { env } from './env';

const baseRedirect = env.OAUTH_REDIRECT_BASE_URL.replace(/\/$/, '');

export const oauthConfig = {
  facebook: {
    clientId: env.FACEBOOK_APP_ID ?? '',
    clientSecret: env.FACEBOOK_APP_SECRET ?? '',
    redirectUri: `${baseRedirect}/facebook/callback`,
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
  },
  instagram: {
    clientId: env.INSTAGRAM_APP_ID ?? env.FACEBOOK_APP_ID ?? '',
    clientSecret: env.INSTAGRAM_APP_SECRET ?? env.FACEBOOK_APP_SECRET ?? '',
    redirectUri: `${baseRedirect}/instagram/callback`,
    scopes: ['instagram_basic', 'instagram_content_publish'],
  },
  twitter: {
    clientId: env.TWITTER_CLIENT_ID ?? '',
    clientSecret: env.TWITTER_CLIENT_SECRET ?? '',
    redirectUri: `${baseRedirect}/twitter/callback`,
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  },
  linkedin: {
    clientId: env.LINKEDIN_CLIENT_ID ?? '',
    clientSecret: env.LINKEDIN_CLIENT_SECRET ?? '',
    redirectUri: `${baseRedirect}/linkedin/callback`,
    scopes: ['openid', 'profile', 'w_member_social'],
  },
} as const;

export type Platform = keyof typeof oauthConfig;

