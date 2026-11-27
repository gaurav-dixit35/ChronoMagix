import { isRealCalendarDate } from './dateKey.js';

const objectId = /^[a-f\d]{24}$/i;

export function validateDump({ users, courses, lectures }) {
  if (![users, courses, lectures].every(Array.isArray)) throw new Error('Dump must contain users, courses and lectures arrays.');
  const ids = (rows, label) => {
    const set = new Set();
    for (const row of rows) {
      if (!row || typeof row !== 'object' || !objectId.test(String(row._id || ''))) throw new Error(`${label} contains a record with an invalid _id.`);
      if (set.has(String(row._id))) throw new Error(`${label} contains duplicate _id ${row._id}.`);
      set.add(String(row._id));
    }
    return set;
  };
  const userIds = ids(users, 'users');
  const courseIds = ids(courses, 'courses');
  ids(lectures, 'lectures');
  const instructors = new Set();
  const emails = new Set();
  for (const user of users) {
    if (!user.email || !user.name || !['admin', 'instructor'].includes(user.role) || !/^\$2[aby]\$/.test(user.password || '')) throw new Error(`User ${user._id} is missing valid fields or a bcrypt password hash.`);
    const email = String(user.email).trim().toLowerCase();
    if (emails.has(email)) throw new Error(`Dump contains duplicate user email ${user.email}.`);
    emails.add(email);
    if (user.role === 'instructor') instructors.add(String(user._id));
  }
  for (const course of courses) {
    if (!course.name || !['Beginner', 'Intermediate', 'Advanced'].includes(course.level) || !course.description || !course.image || (course.createdBy && !userIds.has(String(course.createdBy)))) throw new Error(`Course ${course._id} is missing valid fields or references.`);
  }
  const instructorDates = new Set();
  const courseDates = new Set();
  for (const lecture of lectures) {
    if (!courseIds.has(String(lecture.course)) || !instructors.has(String(lecture.instructor)) || !isRealCalendarDate(lecture.date)) throw new Error(`Lecture ${lecture._id} has an invalid date or references.`);
    const instructorDate = `${lecture.instructor}:${lecture.date}`;
    const courseDate = `${lecture.course}:${lecture.date}`;
    if (instructorDates.has(instructorDate)) throw new Error(`Dump has an instructor/date clash at ${lecture.date}.`);
    if (courseDates.has(courseDate)) throw new Error(`Dump has duplicate course/date slots at ${lecture.date}.`);
    instructorDates.add(instructorDate);
    courseDates.add(courseDate);
  }
  return { users: users.length, courses: courses.length, lectures: lectures.length };
}
