import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../server/config/env.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiUrl = `http://127.0.0.1:${env.PORT}/api/health`;
const clientUrl = 'http://127.0.0.1:5173/';

async function isRunning(url, isExpected) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (!response.ok || !(await isExpected(response))) {
      throw new Error(`A service is already using ${url}, but it is not the expected ChronoMagix service.`);
    }
    return true;
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false;
    throw error;
  }
}

const apiRunning = await isRunning(apiUrl, async (response) => {
  const body = await response.json();
  return body.success === true && body.data?.status === 'ok';
});
const clientRunning = await isRunning(clientUrl, async (response) => (await response.text()).includes('<div id="root"></div>'));

if (apiRunning) process.stdout.write(`Reusing the running ChronoMagix API on port ${env.PORT}.\n`);
if (clientRunning) process.stdout.write('Reusing the running ChronoMagix client on port 5173.\n');

const children = [];
if (!apiRunning) children.push(spawn(process.execPath, ['--watch', 'server/server.js'], { cwd: root, stdio: 'inherit' }));
if (!clientRunning) children.push(spawn(process.execPath, [path.join(root, 'client/node_modules/vite/bin/vite.js'), '--host', '0.0.0.0'], { cwd: path.join(root, 'client'), stdio: 'inherit' }));

let shuttingDown = false;
function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  if (!children.length) process.exitCode = exitCode;
  else {
    let remaining = children.filter((child) => child.exitCode === null).length;
    if (!remaining) process.exitCode = exitCode;
    else for (const child of children) child.once('exit', () => { if (--remaining === 0) process.exitCode = exitCode; });
  }
}

for (const child of children) child.on('exit', (code) => {
  if (!shuttingDown) stop(code || 0);
});
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

if (children.length) process.stdout.write('ChronoMagix is available at http://localhost:5173. Press Ctrl+C to stop processes started by this command.\n');
