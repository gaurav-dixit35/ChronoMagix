import { Router } from 'express';
import { myLectures } from '../controllers/instructorPanelController.js';
import { protect,authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { emptyRequestSchema } from '../validators/commonValidators.js';
const router=Router(); router.get('/lectures',protect,authorize('instructor'),validate(emptyRequestSchema),asyncHandler(myLectures)); export default router;
