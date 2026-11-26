import rateLimit from 'express-rate-limit';
const response = { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' };
export const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message: response });
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: response });
