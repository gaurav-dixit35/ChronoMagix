import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { loginSchema, meSchema } from '../validators/authValidators.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router(); router.post('/login',loginLimiter,validate(loginSchema),asyncHandler(login)); router.get('/me',protect,validate(meSchema),asyncHandler(me)); export default router;
