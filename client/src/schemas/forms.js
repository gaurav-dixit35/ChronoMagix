import { z } from 'zod';
import { isDateKey } from '../utils/date.js';

export const loginFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const courseFormSchema = z.object({
  name: z.string().trim().min(3, 'Course name must be at least 3 characters.').max(100, 'Course name must be 100 characters or fewer.'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'], { errorMap: () => ({ message: 'Choose a course level.' }) }),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(1000, 'Description must be 1000 characters or fewer.'),
});

export const lectureFormSchema = z.object({
  date: z.string().refine(isDateKey, 'Choose a real calendar date.'),
  instructorId: z.string().min(1, 'Choose an available instructor.'),
  title: z.string().trim().max(120, 'Batch title must be 120 characters or fewer.'),
});
