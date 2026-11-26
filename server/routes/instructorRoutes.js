import { Router } from 'express';
import { listInstructors, availability } from '../controllers/instructorController.js';
import { protect,authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { availabilitySchema } from '../validators/lectureValidators.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emptyRequestSchema } from '../validators/commonValidators.js';
const router=Router(); router.use(protect,authorize('admin')); router.get('/',validate(emptyRequestSchema),asyncHandler(listInstructors)); router.get('/availability',validate(availabilitySchema),asyncHandler(availability)); export default router;
