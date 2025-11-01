import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z
      .string()
      .url()
      .default('postgresql://localhost:5432/auto_social_manager'),
    JWT_SECRET: z.string().min(12).default('replace-with-secure-secret'),
    JWT_EXPIRES_IN: z.string().default('1d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    TOKEN_ENCRYPTION_KEY: z
      .string()
      .min(32)
      .default('0123456789abcdef0123456789abcdef'),
    OAUTH_REDIRECT_BASE_URL: z
      .string()
      .url()
      .default('https://localhost:4000/auth'),
    FACEBOOK_APP_ID: z.string().optional(),
    FACEBOOK_APP_SECRET: z.string().optional(),
    INSTAGRAM_APP_ID: z.string().optional(),
    INSTAGRAM_APP_SECRET: z.string().optional(),
    TWITTER_CLIENT_ID: z.string().optional(),
    TWITTER_CLIENT_SECRET: z.string().optional(),
    LINKEDIN_CLIENT_ID: z.string().optional(),
    LINKEDIN_CLIENT_SECRET: z.string().optional(),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    RATE_LIMIT_WINDOW: z.coerce.number().default(60_000),
  })
  .transform((values) => ({
    ...values,
    isProduction: values.NODE_ENV === 'production',
  }));

export const env = envSchema.parse(process.env);

export type Env = typeof env;

