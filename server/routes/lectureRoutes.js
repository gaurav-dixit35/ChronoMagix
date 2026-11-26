import { Router } from 'express';
import * as c from '../controllers/lectureController.js';
import { protect,authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { lectureIdSchema,lectureListSchema,updateLectureSchema } from '../validators/lectureValidators.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router(); router.use(protect,authorize('admin')); router.get('/',validate(lectureListSchema),asyncHandler(c.listLectures)); router.patch('/:id',validate(updateLectureSchema),asyncHandler(c.patchLecture)); router.delete('/:id',validate(lectureIdSchema),asyncHandler(c.removeLecture)); export default router;
