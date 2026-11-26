import { z } from 'zod';
const empty = z.object({}).passthrough();
const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const courseIdSchema = z.object({ body: empty, params: z.object({ id }), query: empty });
export const coursesListSchema = z.object({ body: empty, params: empty, query: z.object({ search: z.string().max(100).optional(), level: z.enum(['Beginner','Intermediate','Advanced']).optional() }) });
export const courseBodySchema = z.object({ body: z.object({ name: z.string().trim().min(3).max(100), level: z.enum(['Beginner','Intermediate','Advanced']), description: z.string().trim().min(10).max(1000) }), params: empty, query: empty });
export const updateCourseSchema = z.object({ body: courseBodySchema.shape.body.partial(), params: z.object({ id }), query: empty });
