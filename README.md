# ChronoMagix

**Time, scheduled.**

![ChronoMagix identity](client/public/logo-hero.png)

ChronoMagix is an online lecture scheduling module for administrators and instructors. Admins manage courses, instructors and date-only lectures. Instructors see their own schedule. Students and time slots are out of scope; student accounts are future scope.

## Features

- Admin login; course create/list/detail/edit API/delete, instructor list/availability, lecture create/update/delete and table/week views.
- Instructor login and personal date-sorted schedule, isolated by authenticated identity.
- Instructor/date uniqueness enforced by a MongoDB compound unique index, with a friendly pre-check and 409 response.
- Date-first scheduling form displays availability and disables instructors already booked on the selected date.
- In-memory image upload (JPEG, PNG, WebP, 2 MB maximum), Cloudinary when configured and a MongoDB data URL fallback.
- Responsive Horology Editorial visual identity with self-hosted Fraunces, Instrument Sans and DM Mono.
- A one-time animated brand splash, remembered in browser `localStorage`; it has an Enter button and honors reduced-motion preferences.

## Stack

Node.js 20+, ES modules, Express 4, Mongoose 8, MongoDB, Zod, bcryptjs, JWT, Vitest, Supertest, mongodb-memory-server; React 18.3, Vite 6, React Router 6, Axios, Tailwind 3, Framer Motion, lucide-react. React Hook Form and Zod resolver packages are present for the planned schema-driven form refactor; current screens use controlled native forms.

## Architecture

`Routes → middleware (auth, role, upload, validation) → controllers (HTTP) → services (business rules) → Mongoose models → MongoDB`.

Services own lecture clash logic and course cascade deletion. The unique `{ instructor: 1, date: 1 }` index is the race-safe guarantee; the pre-check provides the friendly conflict description. A duplicate-key error is translated to 409 `INSTRUCTOR_DATE_CLASH`.

## Data model and indexes

- **User**: name, unique lowercase email, bcrypt password hash (`select: false`), role, optional bio, timestamps.
- **Course**: name, level, description, image URL/data URL, creator, timestamps.
- **Lecture**: course, instructor, real date string `YYYY-MM-DD`, optional batch title, timestamps.
- **Indexes**: user email unique and role/name; course createdAt, level/createdAt, name; lecture unique instructor/date, course/date and date.

Date keys are validated as real Gregorian calendar dates, including past dates. They are compared and sorted as strings, with no timezone conversion. “Today” is derived in Asia/Kolkata.

## Repository map

`client/` React application and visual assets; `server/` API, models, services, validators, scripts and tests; `docs/` API/design/demo/submission material; `dump/` JSON export destination. Express serves `client/dist` in production and keeps API routes under `/api`.

## Local development

Requirements: Node.js 20+ and a MongoDB server (local Community Server or Atlas). In PowerShell:

```powershell
Copy-Item server/.env.example server/.env
notepad server/.env
npm.cmd run install:all
npm.cmd run seed
npm.cmd run dev
```

Set `MONGO_URI` to the reachable database and `JWT_SECRET` to a private random value of at least 32 characters. Open `http://localhost:5173`; Vite proxies `/api` to Express on port 5000. In PowerShell installations that block `npm.ps1`, use `npm.cmd`.

### Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development`, `test` or `production` |
| `MONGO_URI` | Local or Atlas MongoDB URI |
| `JWT_SECRET` | Private signing key, minimum 32 characters |
| `JWT_EXPIRES_IN` | JWT lifetime, default `1d` |
| `CLIENT_ORIGIN` | Allowed browser origin |
| `CLOUDINARY_URL` | Optional Cloudinary URL; blank uses MongoDB data URLs |
| `VITE_API_BASE_URL` | Client API base; defaults to `/api` |
| `VITE_SHOW_DEMO_HINTS` | Show demo login fill buttons when `true` |

Never commit `.env` files or real secrets. The `.env.example` files contain placeholders only.

## Demo accounts and seed

`npm.cmd run seed` is idempotent and upserts one admin, six named instructors, three generated SVG-image courses, and nine lectures without date conflicts. Credentials:

- Admin: `admin@chronomagix.com` / `Admin@123`
- Instructor: `rahul@chronomagix.com` / `Instructor@123`

Change demo passwords and JWT secret before any public deployment; these accounts are intentionally predictable for the assignment demo.

## API routes

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health status |
| POST / GET | `/api/auth/login`, `/api/auth/me` | Public / signed-in | Login / current user |
| GET | `/api/instructors`, `/api/instructors/availability?date=` | Admin | Instructors, date availability |
| GET / POST | `/api/courses` | Admin | List/filter / multipart create |
| GET / PUT / DELETE | `/api/courses/:id` | Admin | Detail / edit / cascade delete |
| POST | `/api/courses/:id/lectures` | Admin | Add lecture to an existing course |
| GET / PATCH / DELETE | `/api/lectures` and `/api/lectures/:id` | Admin | Filter / update / delete lecture |
| GET | `/api/instructor/lectures` | Instructor | Own schedule only |

Full contract and response notes are in [docs/API.md](docs/API.md).

## Frontend routes

| Route | Role | Screen |
|---|---|---|
| `/login` | Public | Sign in |
| `/admin/courses` | Admin | Course catalog |
| `/admin/courses/new` | Admin | Create course |
| `/admin/courses/:id` | Admin | Course details and lecture drawer |
| `/admin/instructors` | Admin | Instructor directory |
| `/admin/lectures` | Admin | Filterable table/week view |
| `/instructor/lectures` | Instructor | Personal schedule |

## Tests, build and production

```powershell
npm.cmd --prefix server test
npm.cmd run build
$env:NODE_ENV='production'; npm.cmd start
```

Backend tests use an in-memory MongoDB and cover create clashes, concurrent duplicate booking (one 201 and one 409), updates, date validation, role protection, schedule isolation and auth. The test output prints MongoDB indexes. The production Express server serves the built single-page client, including deep links.

For Render, use build command `npm install && npm --prefix server install && npm --prefix client install && npm run build` and start command `npm start`. Configure `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGIN` and optional `CLOUDINARY_URL`. Render free services sleep; first load can take 30–60 seconds.

## Design decisions and limitations

Lectures are date-only; there are no time slots. Cloudinary is optional; bounded image uploads fall back to data URLs. Availability is advisory; the unique index handles races. The current interface keeps shared route screens in `App.jsx` and uses controlled native forms; React Hook Form/Zod form integration and complete WCAG review remain follow-up work. Students, notifications and reminders are future scope.

Responsive production screenshots, measured page widths and the user-supplied Lighthouse results are recorded in [docs/VISUAL_QA.md](docs/VISUAL_QA.md). Those scores predate the robots and logo-payload fixes; rerun Lighthouse to capture updated results.

## Data export

`npm.cmd run dump` writes `dump/users.json`, `dump/courses.json` and `dump/lectures.json`; user passwords are hashes. `npm.cmd run import -- --confirm` replaces the three collections from those files and rebuilds indexes; back up the target database first. A native export can be made with `mongodump --uri="<MONGO_URI>" --out=dump/mongodump`; restore with `mongorestore --uri="<MONGO_URI>" --drop dump/mongodump/chronomagix`. Never include real secrets in a dump.

## Submission material

See [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md), [SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md), [SUBMISSION_EMAIL.md](docs/SUBMISSION_EMAIL.md), [DESIGN.md](docs/DESIGN.md), and [VISUAL_QA.md](docs/VISUAL_QA.md). Confirm the deadline month with HR as requested in the assignment.
