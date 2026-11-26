import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
export async function listInstructors(req, res) {
  const [instructors, counts] = await Promise.all([User.find({ role: 'instructor' }).select('name email bio').sort({ name: 1 }).lean(), Lecture.aggregate([{ $group: { _id: '$instructor', count: { $sum: 1 } } }])]);
  const countMap = new Map(counts.map(row => [String(row._id), row.count]));
  res.json({ success: true, data: instructors.map(user => ({ id: user._id, name: user.name, email: user.email, bio: user.bio, lectureCount: countMap.get(String(user._id)) || 0 })) });
}
export async function availability(req, res) {
  const date = req.validated.query.date;
  const [instructors, bookings] = await Promise.all([User.find({ role: 'instructor' }).select('name').sort({ name: 1 }).lean(), Lecture.find({ date }).populate('course', 'name').select('instructor course').lean()]);
  const busy = new Map(bookings.map(row => [String(row.instructor), row.course?.name]));
  res.json({ success: true, data: instructors.map(user => ({ id: user._id, name: user.name, available: !busy.has(String(user._id)), ...(busy.has(String(user._id)) ? { bookedCourse: busy.get(String(user._id)) } : {}) })) });
}
