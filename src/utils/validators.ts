import { z } from 'zod';

export const platformEnum = z.enum(['facebook', 'instagram', 'twitter', 'linkedin']);

export const registerSchema = {
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
    name: z.string().min(1).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const vehicleInputSchema = z.object({
  id: z.string().uuid(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1900),
  price: z.coerce.number().nonnegative(),
  mileage: z.coerce.number().int().nonnegative().optional(),
  vin: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  features: z.array(z.string()).default([]),
  description: z.string().min(1),
  sourceUrl: z.string().url(),
  scrapedAt: z.string().datetime().optional(),
});

export const saveVehiclesSchema = {
  body: z.object({
    vehicles: z.array(vehicleInputSchema).min(1),
  }),
};

export const vehicleIdParamSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const createPostSchema = {
  body: z.object({
    vehicleId: z.string().uuid(),
    platform: platformEnum,
    content: z.string().min(1),
    status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
    scheduledFor: z.string().datetime().optional(),
  }),
};

export const publishPostSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const schedulePostSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    scheduledFor: z.string().datetime(),
  }),
};

export const postAnalyticsParamsSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const socialAuthParamSchema = {
  params: z.object({
    platform: platformEnum,
  }),
};

export const socialCallbackSchema = {
  params: z.object({
    platform: platformEnum,
  }),
  body: z.object({
    code: z.string().min(1),
    state: z.string().optional(),
  }),
};

