import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import Lecture from './models/Lecture.js';
import app from './app.js';

async function start() {
  await connectDatabase(env.MONGO_URI);
  await Lecture.syncIndexes();
  const indexes = await Lecture.collection.indexes();
  process.stdout.write(`Lecture indexes synchronized: ${JSON.stringify(indexes)}\n`);
  const server=app.listen(env.PORT,()=>process.stdout.write(`ChronoMagix API listening on ${env.PORT}\n`));
  const shutdown=async()=>{server.close();await disconnectDatabase();process.exit(0);}; process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown);
}

try {
  await start();
} catch (error) {
  process.stderr.write(`Startup failed: ${error.message}\n`);
  await disconnectDatabase();
  process.exitCode = 1;
}
