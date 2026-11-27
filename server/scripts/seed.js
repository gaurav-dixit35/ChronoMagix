import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import { addDays, todayKey } from '../utils/dateKey.js';

const instructors = [
  ['Gaurav Dixit', 'gaurav@chronomagix.com'],
  ['Priya Nair', 'priya@chronomagix.com'],
  ['Amit Verma', 'amit@chronomagix.com'],
  ['Sneha Kulkarni', 'sneha@chronomagix.com'],
  ['Vikram Singh', 'vikram@chronomagix.com'],
  ['Neha Joshi', 'neha@chronomagix.com'],
];

const courseSeeds = [
  { name: 'Node.js Foundations', level: 'Beginner', description: 'Build a clear foundation in server-side JavaScript and Node.js essentials.', initials: 'N', colors: ['#111833', '#2447C9'] },
  { name: 'React Interface Design', level: 'Intermediate', description: 'Shape thoughtful, accessible interfaces with reusable React patterns.', initials: 'R', colors: ['#0A0F1F', '#6B3FC4'] },
  { name: 'Data Structures in JavaScript', level: 'Advanced', description: 'Explore practical data structures and reason about efficient solutions.', initials: 'D', colors: ['#111833', '#0B6B52'] },
];

function makeCourseImage({ initials, colors }) {
  const ticks = Array.from({ length: 60 }, (_, index) => {
    const angle = (index * 6 - 90) * Math.PI / 180;
    const major = index % 5 === 0;
    const inner = major ? 32 : 35;
    const outer = 41;
    const x1 = 160 + Math.cos(angle) * inner;
    const y1 = 100 + Math.sin(angle) * inner;
    const x2 = 160 + Math.cos(angle) * outer;
    const y2 = 100 + Math.sin(angle) * outer;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#EBD9AE" stroke-opacity="${major ? '.9' : '.35'}" stroke-width="${major ? 1.5 : .8}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="640" height="400" fill="url(#ink)"/><circle cx="160" cy="100" r="43" fill="none" stroke="#B8872D" stroke-opacity=".55"/>${ticks}<text x="160" y="111" text-anchor="middle" fill="#F5F0E6" font-family="Georgia,serif" font-size="32">${initials}</text><path d="M0 330h640" stroke="#B8872D" stroke-opacity=".55"/><circle cx="590" cy="50" r="3" fill="#EBD9AE"/><circle cx="50" cy="350" r="2" fill="#EBD9AE" opacity=".7"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function upsertUser(name, email, role, password) {
  let user = await User.findOne({ email }).select('+password');
  if (!user) user = new User({ name, email, role, password });
  else {
    user.name = name;
    user.role = role;
    if (!user.password) user.password = password;
  }
  await user.save();
  return user;
}

async function migrateLegacyInstructor() {
  const previous = await User.findOne({ email: 'rahul@chronomagix.com' });
  if (!previous) return;

  const current = await User.findOne({ email: 'gaurav@chronomagix.com' });
  if (!current) {
    previous.name = 'Gaurav Dixit';
    previous.email = 'gaurav@chronomagix.com';
    await previous.save();
    return;
  }

  const previousLectures = await Lecture.find({ instructor: previous._id });
  for (const lecture of previousLectures) {
    const conflict = await Lecture.exists({ instructor: current._id, date: lecture.date });
    if (conflict) throw new Error(`Cannot migrate Rahul's lecture on ${lecture.date}: Gaurav already has a lecture that day.`);
    lecture.instructor = current._id;
    await lecture.save();
  }
  await previous.deleteOne();
}

async function seed() {
  const resetRequested = process.argv.includes('--reset');
  if (resetRequested && process.env.CONFIRM_RESET !== 'yes') {
    throw new Error('Reset requires explicit confirmation: set CONFIRM_RESET=yes and pass --reset.');
  }
  await connectDatabase(env.MONGO_URI);
  if (resetRequested) {
    await Promise.all([User.deleteMany({}), Course.deleteMany({}), Lecture.deleteMany({})]);
  }
  await Lecture.syncIndexes();
  await migrateLegacyInstructor();

  const admin = await upsertUser('ChronoMagix Admin', 'admin@chronomagix.com', 'admin', 'Admin@123');
  const instructorUsers = [];
  for (const [name, email] of instructors) {
    instructorUsers.push(await upsertUser(name, email, 'instructor', 'Instructor@123'));
  }

  const courses = [];
  for (const courseSeed of courseSeeds) {
    const { initials, colors, ...fields } = courseSeed;
    const course = await Course.findOneAndUpdate(
      { name: fields.name },
      { $set: { ...fields, image: makeCourseImage(courseSeed), createdBy: admin._id } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    courses.push(course);
  }

  const base = '2026-11-27';
  let lectureCount = 0;
  let lectureSkipped = 0;
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex += 1) {
    for (let batch = 0; batch < 3; batch += 1) {
      // Cycle the six instructors across nine distinct dates without producing clashes.
      const instructorIndex = (courseIndex * 3 + batch) % instructorUsers.length;
      const lecture = {
        course: courses[courseIndex]._id,
        instructor: instructorUsers[instructorIndex]._id,
        date: addDays(base, (courseIndex * 3) + batch + 1),
        title: `Batch ${batch + 1}`,
      };
      const [courseSlot, instructorSlot] = await Promise.all([
        Lecture.exists({ course: lecture.course, date: lecture.date }),
        Lecture.exists({ instructor: lecture.instructor, date: lecture.date }),
      ]);
      if (courseSlot || instructorSlot) { lectureSkipped += 1; continue; }
      try {
        const result = await Lecture.updateOne(
          { course: lecture.course, date: lecture.date },
          { $setOnInsert: lecture },
          { upsert: true, runValidators: true },
        );
        lectureCount += result.upsertedCount;
        if (!result.upsertedCount) lectureSkipped += 1;
      } catch (error) {
        if (error.code !== 11000) throw error;
        lectureSkipped += 1;
      }
    }
  }

  const indexes = await Lecture.collection.indexes();
  process.stdout.write(`ChronoMagix seed complete.\nAdmin: 1; instructors: ${instructorUsers.length}; courses: ${courses.length}; lectures added: ${lectureCount}; lecture slots skipped: ${lectureSkipped}.\nLecture indexes: ${indexes.map(({ name, key, unique }) => `${name} ${JSON.stringify(key)}${unique ? ' unique' : ''}`).join('; ')}\n\nDemo credentials\nAdmin: admin@chronomagix.com / Admin@123\nInstructor: gaurav@chronomagix.com / Instructor@123\n`);
}

try {
  await seed();
} catch (error) {
  process.stderr.write(`Seed failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
