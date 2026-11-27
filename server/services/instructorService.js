import Lecture from '../models/Lecture.js';
import User from '../models/User.js';

export async function listInstructors() {
  const [instructors, counts] = await Promise.all([
    User.find({ role: 'instructor' }).select('name email bio').sort({ name: 1 }).lean(),
    Lecture.aggregate([{ $group: { _id: '$instructor', count: { $sum: 1 } } }]),
  ]);
  const countMap = new Map(counts.map(({ _id, count }) => [String(_id), count]));
  return instructors.map((user) => ({ id: user._id, name: user.name, email: user.email, bio: user.bio, lectureCount: countMap.get(String(user._id)) || 0 }));
}

export async function getAvailability(date, excludeLectureId) {
  const [instructors, bookings] = await Promise.all([
    User.find({ role: 'instructor' }).select('name').sort({ name: 1 }).lean(),
    Lecture.find({ date, ...(excludeLectureId ? { _id: { $ne: excludeLectureId } } : {}) }).populate('course', 'name').select('instructor course').lean(),
  ]);
  const booked = new Map(bookings.map((lecture) => [String(lecture.instructor), lecture.course?.name]));
  return instructors.map((instructor) => ({ id: instructor._id, name: instructor.name, available: !booked.has(String(instructor._id)), ...(booked.has(String(instructor._id)) ? { bookedCourse: booked.get(String(instructor._id)) } : {}) }));
}
