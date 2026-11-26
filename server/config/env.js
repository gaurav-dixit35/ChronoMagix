import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  CLOUDINARY_URL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`).join('\n');
  throw new Error(`Invalid server environment configuration:\n${details}`);
}

export const env = Object.freeze(parsed.data);
