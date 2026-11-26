import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

function clashError(instructor, lecture) {
  const name = lecture.course?.name || 'another course';
  return new ApiError(409, `${instructor.name} is already assigned to ${name} on ${lecture.date}.`, 'INSTRUCTOR_DATE_CLASH', { lectureId: lecture._id, courseName: name });
}

/** Create after checking references and conflicts; the unique index closes race conditions. */
export async function createLecture({ courseId, instructorId, date, title }) {
  const [course, instructor] = await Promise.all([Course.findById(courseId).lean(), User.findOne({ _id: instructorId, role: 'instructor' }).lean()]);
  if (!course) throw new ApiError(404, 'Course not found.', 'NOT_FOUND');
  if (!instructor) throw new ApiError(404, 'Instructor not found.', 'NOT_FOUND');
  const conflict = await Lecture.findOne({ instructor: instructorId, date }).populate('course', 'name').lean();
  if (conflict) throw clashError(instructor, conflict);
  try {
    const count = await Lecture.countDocuments({ course: courseId });
    return await Lecture.create({ course: courseId, instructor: instructorId, date, title: title || `Batch ${count + 1}` });
  } catch (error) {
    if (error.code === 11000) {
      const conflictNow = await Lecture.findOne({ instructor: instructorId, date }).populate('course', 'name').lean();
      if (conflictNow) throw clashError(instructor, conflictNow);
    }
    throw error;
  }
}

/** Update allowed lecture fields and enforce the instructor/date rule. */
export async function updateLecture(lectureId, changes) {
  const current = await Lecture.findById(lectureId).lean();
  if (!current) throw new ApiError(404, 'Lecture not found.', 'NOT_FOUND');
  const instructorId = changes.instructorId || String(current.instructor);
  const date = changes.date || current.date;
  const instructor = await User.findOne({ _id: instructorId, role: 'instructor' }).lean();
  if (!instructor) throw new ApiError(404, 'Instructor not found.', 'NOT_FOUND');
  const conflict = await Lecture.findOne({ instructor: instructorId, date, _id: { $ne: lectureId } }).populate('course', 'name').lean();
  if (conflict) throw clashError(instructor, conflict);
  try {
    return await Lecture.findOneAndUpdate({ _id: lectureId }, { $set: { ...(changes.instructorId ? { instructor: instructorId } : {}), ...(changes.date ? { date } : {}), ...(changes.title !== undefined ? { title: changes.title } : {}) } }, { new: true, runValidators: true });
  } catch (error) { if (error.code === 11000) throw clashError(instructor, await Lecture.findOne({ instructor: instructorId, date }).populate('course', 'name').lean()); throw error; }
}
