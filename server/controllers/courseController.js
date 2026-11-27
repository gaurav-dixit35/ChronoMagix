import { saveImage } from '../services/uploadService.js';
import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from '../services/courseService.js';
import ApiError from '../utils/ApiError.js';
export async function list(req, res) { res.json({ success: true, data: await listCourses(req.validated.query) }); }
export async function create(req, res) {
  const image = await saveImage(req.file);
  if (!image) throw new ApiError(400, 'A course image is required.', 'IMAGE_REQUIRED');
  const data = await createCourse({ ...req.validated.body, image, createdBy: req.user.id });
  res.status(201).json({ success: true, data });
}
export async function detail(req, res) { res.json({ success: true, data: await getCourse(req.validated.params.id) }); }
export async function update(req, res) {
  const changes = { ...req.validated.body };
  if (req.file) changes.image = await saveImage(req.file);
  res.json({ success: true, data: await updateCourse(req.validated.params.id, changes) });
}
export async function remove(req, res) {
  const course = await deleteCourse(req.validated.params.id);
  res.json({ success: true, data: { id: course._id } });
}
