import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import ApiError from '../utils/ApiError.js';

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
