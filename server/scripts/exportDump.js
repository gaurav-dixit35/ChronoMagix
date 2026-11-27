import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';
import { validateDump } from '../utils/dumpValidation.js';

async function exportDump() {
  await connectDatabase(env.MONGO_URI);
  const dumpDirectory = path.resolve(process.env.CHRONOMAGIX_DUMP_DIR || fileURLToPath(new URL('../../dump/', import.meta.url)));
  await mkdir(dumpDirectory, { recursive: true });
  const [users, courses, lectures] = await Promise.all([
    User.find({}).select('+password').lean(),
    Course.find({}).lean(),
    Lecture.find({}).lean(),
  ]);
  validateDump({ users, courses, lectures });
  for (const [name, rows] of Object.entries({ users, courses, lectures })) {
    const target = path.join(dumpDirectory, `${name}.json`);
    const temporary = path.join(dumpDirectory, `${name}.json.tmp`);
    await writeFile(temporary, `${JSON.stringify(rows, null, 2)}\n`, { flag: 'w' });
    await rename(temporary, target);
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
