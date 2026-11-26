import { mkdir, writeFile } from 'node:fs/promises';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';

async function exportDump() {
  await connectDatabase(env.MONGO_URI);
  await mkdir(new URL('../../dump/', import.meta.url), { recursive: true });
  const [users, courses, lectures] = await Promise.all([
    User.find({}).select('+password').lean(),
    Course.find({}).lean(),
    Lecture.find({}).lean(),
  ]);
  for (const [name, rows] of Object.entries({ users, courses, lectures })) {
    await writeFile(new URL(`../../dump/${name}.json`, import.meta.url), `${JSON.stringify(rows, null, 2)}\n`);
    process.stdout.write(`Exported ${rows.length} ${name}.\n`);
  }
  process.stdout.write('Dump exported. User passwords are stored as hashes.\n');
}

try {
  await exportDump();
} catch (error) {
  process.stderr.write(`Dump failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
