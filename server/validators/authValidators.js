import { z } from 'zod';
const empty = z.object({}).passthrough();
export const loginSchema = z.object({ body: z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(1) }), params: empty, query: empty });
export const meSchema = z.object({ body: empty, params: empty, query: empty });
