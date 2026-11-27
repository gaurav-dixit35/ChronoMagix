import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import ApiError from '../utils/ApiError.js';

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export async function listCourses({ search, level }) {
  const filter = { ...(level ? { level } : {}), ...(search ? { name: { $regex: escapeRegex(search), $options: 'i' } } : {}) };
  const [courses, counts] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1, _id: 1 }).lean(),
    Lecture.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]),
  ]);
  const countMap = new Map(counts.map(({ _id, count }) => [String(_id), count]));
  return courses.map((course) => ({ ...course, lectureCount: countMap.get(String(course._id)) || 0 }));
}

export async function createCourse(fields) { return Course.create(fields); }

export async function getCourse(courseId) {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new ApiError(404, 'Course not found.', 'NOT_FOUND');
  const lectures = await Lecture.find({ course: course._id }).populate('instructor', 'name email').sort({ date: 1, _id: 1 }).lean();
  return { ...course, lectures };
}

export async function updateCourse(courseId, changes) {
  if (!Object.keys(changes).length) throw new ApiError(400, 'Provide at least one course field or a new image.', 'VALIDATION_ERROR');
  const course = await Course.findOneAndUpdate({ _id: courseId }, { $set: changes }, { new: true, runValidators: true });
  if (!course) throw new ApiError(404, 'Course not found.', 'NOT_FOUND');
  return course;
}

export async function deleteCourse(courseId) {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new ApiError(404, 'Course not found.', 'NOT_FOUND');
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => { await Lecture.deleteMany({ course: courseId }, { session }); await Course.deleteOne({ _id: courseId }, { session }); });
  } catch (error) {
    if (/transaction numbers are only allowed|replica set|not supported/i.test(error.message)) { await Lecture.deleteMany({ course: courseId }); await Course.deleteOne({ _id: courseId }); }
    else throw error;
  } finally { await session.endSession(); }
  return course;
}
