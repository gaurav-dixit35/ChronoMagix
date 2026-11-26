import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';

function withObjectIds(rows, fields) {
  return rows.map((row) => {
    const restored = { ...row };
    for (const field of fields) if (restored[field]) restored[field] = new mongoose.Types.ObjectId(restored[field]);
    if (restored._id) restored._id = new mongoose.Types.ObjectId(restored._id);
    return restored;
  });
}

async function importDump() {
  if (process.argv.includes('--confirm') !== true) throw new Error('Import replaces all three collections. Re-run with --confirm after backing up the target database.');
  await connectDatabase(env.MONGO_URI);
  const base = new URL('../../dump/', import.meta.url);
  const [users, courses, lectures] = await Promise.all(['users', 'courses', 'lectures'].map(async (name) => JSON.parse(await readFile(new URL(`${name}.json`, base), 'utf8'))));
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Lecture.deleteMany({})]);
  if (users.length) await User.collection.insertMany(withObjectIds(users, []));
  if (courses.length) await Course.collection.insertMany(withObjectIds(courses, ['createdBy']));
  if (lectures.length) await Lecture.collection.insertMany(withObjectIds(lectures, ['course', 'instructor']));
  await Promise.all([User.syncIndexes(), Course.syncIndexes(), Lecture.syncIndexes()]);
  process.stdout.write(`Restored ${users.length} users, ${courses.length} courses and ${lectures.length} lectures.\n`);
}

try { await importDump(); } catch (error) { process.stderr.write(`Import failed: ${error.message}\n`); process.exitCode = 1; } finally { await disconnectDatabase(); }
