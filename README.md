<p align="center">
  <img src="client/public/logo-hero.png" alt="ChronoMagix — Time, scheduled." width="720" />
</p>

# ChronoMagix

**Time, scheduled.**

ChronoMagix is a date-only lecture scheduling module for an administrator and instructors. Administrators manage courses and assign instructors to lecture dates. Instructors see only their own upcoming and past schedule. The module intentionally has no student accounts or time slots.

## People and scope

- **Admin:** manages courses, instructors, and lectures.
- **Instructor:** views a personal schedule; access is scoped to the authenticated account.
- **Students:** future scope; there is no student-facing account or enrollment flow.
- **Evaluators:** can use the seeded admin and instructor demo accounts below.

## Features

- JWT sign-in, session lookup, role protected API endpoints and frontend routes.
- Course create, list, detail, edit and delete; deleting a course also deletes its lectures.
- Image upload with JPEG, PNG and WebP validation and a 2 MB limit. Cloudinary is used when configured; otherwise images are stored as data URLs in MongoDB.
- Admin lecture table and week view, lecture create/edit/delete, and instructor directory with schedule filters.
- Date-first scheduling shows availability and disables instructors already booked that day.
- Clash pre-check returns a helpful HTTP 409; MongoDB's unique instructor/date index guarantees no duplicate assignment under concurrent requests.
- Instructor schedule divided into upcoming and past lectures.
- Responsive Horology Editorial design with self-hosted Fraunces, Instrument Sans and DM Mono fonts, reduced-motion support, loading/empty/error states, confirmations and toasts.
- A one-time welcome splash is remembered in browser `localStorage`.

### UI pattern catalogue

| Pattern                        | Used for                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Sidebar and page-header shell  | Role workspace navigation and orientation                                    |
| Course catalog → course detail | Browse a course and manage its lectures in context                           |
| Date-first slide-over          | Create a lecture without leaving its course                                  |
| Availability constraint        | Disable instructors already booked on the selected date                      |
| Live course preview            | Preview course details and image while editing the form                      |
| Table/week schedule lens       | Switch between lecture rows and a seven-day view                             |
| Date dial                      | Make date-only lecture records easy to scan                                  |
| Skeleton then content          | Keep list and schedule loading states visible                                |
| Empty state with action        | Explain empty results and offer the next useful step                         |
| Inline validation and toast    | Put form/server errors beside the form and announce success globally         |
| Consequence confirmation       | Explain the effect before deleting a course or lecture                       |
| Responsive table viewport      | Preserve table headings while containing horizontal scroll on narrow screens |

## Technology

| Area                | Stack                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Runtime/API         | Node.js 20+, ES modules, Express 4.21, Mongoose 8, MongoDB                                     |
| Validation/security | Zod 3, Helmet 8, CORS, express-rate-limit, HPP, Mongo sanitization, JWT 9, bcryptjs            |
| API tests           | Vitest 5, Supertest 7, mongodb-memory-server 11                                                |
| Client              | React 18.3, Vite 6, React Router 6, Axios                                                      |
| UI/forms            | Tailwind 3, Framer Motion 11, lucide-react, React Hook Form 7, Zod resolver, clsx              |
| Fonts               | `@fontsource-variable/fraunces`, `@fontsource-variable/instrument-sans`, `@fontsource/dm-mono` |

Package manifests and lockfiles pin the full dependency graph. No date library is used; date parsing and display live in `client/src/utils/date.js` and `server/utils/dateKey.js`.

## Architecture

```text
Browser
  └── React pages → route guards/layouts → API service modules
                                      │
                                      └── /api (same origin in production)
                                            ↓
Express middleware → routes → validators → controllers → services → Mongoose → MongoDB
```

Routes own HTTP wiring, middleware handles authentication/roles/uploads/validation, controllers translate HTTP requests, and services own business rules. There is no separate repository layer: the Mongoose models are the data access abstraction at this project's size. Express serves `client/dist` and falls back to its `index.html` for non-API routes in production. Unknown `/api` paths remain JSON 404 responses.

### Repository map

```text
client/
  public/       logo, favicon, robots.txt
  src/
    components/ shared fields, tables, date-first lecture drawer, splash
    context/    auth, confirmation and toast providers
    hooks/      reusable page behavior
    layouts/    role guard and responsive application shell
    pages/      auth, admin and instructor routes
    schemas/    client-side Zod form schemas
    services/   typed-by-convention API modules
    utils/      date formatting, route and error helpers
server/
  config/       validated environment and Mongo connection
  controllers/  request handlers
  middleware/   authentication, validation, uploads, errors and limits
  models/       User, Course and Lecture schemas/indexes
  routes/       /api route definitions
  scripts/      seed, JSON dump export/import
  services/     auth, course, instructor, lecture and image storage rules
  tests/        API auth and scheduling tests
  validators/   request Zod schemas
docs/           API, design, QA, demo and handoff documents
dump/           JSON export (passwords are bcrypt hashes)
```

## Data model and scheduling rule

- **User:** name, unique lowercase email, bcrypt password hash (`select: false`), `admin` or `instructor` role, optional bio, timestamps. Login returns a JWT and a safe user object without the password.
- **Course:** name, level, description, image URL/data URL, creator and timestamps.
- **Lecture:** course reference, instructor reference, a validated `YYYY-MM-DD` date string, optional title and timestamps.

The `User` indexes are unique email, role, and role/name. `Course` indexes support creation order, level/order and name. `Lecture` has course, course/date and date indexes, plus the unique compound `{ instructor: 1, date: 1 }` index named `uniq_instructor_date`.

Dates stay as real calendar-date strings from validation through storage and API responses. Display formatting parses the date parts without timezone shifts; “today” is calculated in `Asia/Kolkata`. Past dates are valid. The service checks for an existing instructor/date booking to give a useful conflict message, then relies on the unique index to resolve concurrent requests. Duplicate-key failures map to HTTP 409 with code `INSTRUCTOR_DATE_CLASH`.

## API reference

Base path: `/api`. Successful responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "message": ..., "code": ..., "errors": ... }` (optional fields are omitted when not applicable). Protected routes use `Authorization: Bearer <token>`.

| Method | Path                                                          | Access     | Description                                                                            |
| ------ | ------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| GET    | `/health`                                                     | Public     | Service status and timestamp                                                           |
| POST   | `/auth/login`                                                 | Public     | Validate email/password; return JWT and safe user DTO                                  |
| GET    | `/auth/me`                                                    | Signed in  | Current safe user DTO                                                                  |
| GET    | `/instructors`                                                | Admin      | Instructor directory and lecture counts                                                |
| GET    | `/instructors/availability?date=YYYY-MM-DD&excludeLectureId=` | Admin      | Availability and booked course for a date; optional current lecture exclusion for edit |
| GET    | `/courses?search=&level=`                                     | Admin      | Search/filter courses and include lecture counts                                       |
| POST   | `/courses`                                                    | Admin      | Multipart create with `name`, `level`, `description`, and `image`                      |
| GET    | `/courses/:id`                                                | Admin      | Course and date-sorted lectures                                                        |
| PUT    | `/courses/:id`                                                | Admin      | Update one or more course fields; optional multipart `image`                           |
| DELETE | `/courses/:id`                                                | Admin      | Delete course and its lectures                                                         |
| POST   | `/courses/:id/lectures`                                       | Admin      | Create lecture using `instructorId`, `date`, optional `title`                          |
| GET    | `/lectures?instructorId=&courseId=&from=&to=`                 | Admin      | Filtered, populated lecture list                                                       |
| GET    | `/lectures/:id`                                               | Admin      | Lecture detail for edit form                                                           |
| PATCH  | `/lectures/:id`                                               | Admin      | Change instructor, date and/or title; rechecks clashes                                 |
| DELETE | `/lectures/:id`                                               | Admin      | Delete a lecture                                                                       |
| GET    | `/instructor/lectures`                                        | Instructor | Only the signed-in instructor's lectures                                               |

Dates in request bodies and filters are `YYYY-MM-DD`. Invalid calendar dates return HTTP 400. A clash returns HTTP 409 and includes `INSTRUCTOR_DATE_CLASH` plus conflict details. The expanded API notes are in [docs/API.md](docs/API.md).

## Frontend routes

| Route                      | Access     | Screen                                      |
| -------------------------- | ---------- | ------------------------------------------- |
| `/login`                   | Public     | Sign in                                     |
| `/admin/courses`           | Admin      | Course catalog/search/filter                |
| `/admin/courses/new`       | Admin      | Create course                               |
| `/admin/courses/:id`       | Admin      | Course details and lecture drawer           |
| `/admin/courses/:id/edit`  | Admin      | Edit course                                 |
| `/admin/lectures`          | Admin      | Lecture table/week view and filters         |
| `/admin/lectures/:id/edit` | Admin      | Edit lecture and check availability         |
| `/admin/instructors`       | Admin      | Instructor directory and filtered schedules |
| `/instructor/lectures`     | Instructor | Personal upcoming and past schedule         |

Unknown paths show the not-found screen. Role guards redirect users to the correct role home; API authorization is enforced independently.

## Local setup

Requirements: Node.js 20+, npm and a reachable MongoDB server (local Community Server or MongoDB Atlas). PowerShell commands:

```powershell
npm.cmd run install:all
Copy-Item server/.env.example server/.env
notepad server/.env
npm.cmd run seed
npm.cmd run dev
```

Set `MONGO_URI` to your database and `JWT_SECRET` to a private random value of at least 32 characters. Open <http://localhost:5173>. Vite proxies `/api` to Express on port 5000. If PowerShell blocks `npm.ps1`, use `npm.cmd`.

### Environment variables

| Variable               | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `PORT`                 | Express port; defaults to 5000. Render supplies this at runtime. |
| `NODE_ENV`             | `development`, `test` or `production`                            |
| `MONGO_URI`            | MongoDB connection string                                        |
| `JWT_SECRET`           | Private JWT signing key, minimum 32 characters                   |
| `JWT_EXPIRES_IN`       | JWT lifetime; defaults to `1d`                                   |
| `CLIENT_ORIGIN`        | Allowed origin for CORS; local default `http://localhost:5173`   |
| `CLOUDINARY_URL`       | Optional Cloudinary URL; empty selects MongoDB data URL storage  |
| `VITE_API_BASE_URL`    | Optional client API base; defaults to `/api`                     |
| `VITE_SHOW_DEMO_HINTS` | Optional login autofill hints; enabled only when set to `true`   |

Do not commit `.env` files, database URIs, or real service credentials. The checked-in `.env.example` files contain local placeholders.

## Seed and demo accounts

`npm.cmd run seed` safely upserts the assignment's demo data: one admin, six instructors, three courses and nine clash-free lectures. Running it repeatedly does not duplicate those records. It prints the lecture index list. The destructive reset is separate and requires both `--reset` and `CONFIRM_RESET=yes`.

| Role       | Email                   | Password         |
| ---------- | ----------------------- | ---------------- |
| Admin      | `admin@chronomagix.com` | `Admin@123`      |
| Instructor | `rahul@chronomagix.com` | `Instructor@123` |

These are predictable assignment demo credentials. Keep them limited to the evaluation environment and rotate them or remove the demo accounts after evaluation if the service remains online. Never reuse a personal password.

## Tests and production build

```powershell
npm.cmd --prefix server test
npm.cmd run build
$env:NODE_ENV='production'
npm.cmd start
```

The backend suite uses `mongodb-memory-server` and currently passes 11 tests across auth and scheduling. It covers date validation, role protection, instructor isolation, course cascade deletion, lecture create/update conflicts and concurrent duplicate booking (one 201, one 409). Test output prints the unique instructor/date index. Production uses the same Express process for `/api` and the built React app.

## Render deployment

The repository includes [`render.yaml`](render.yaml), a Blueprint for one Node web service. It installs the root/server/client dependencies, builds `client/dist`, starts Express with `npm start`, and uses `/api/health` for its health check. Render supplies `PORT`; the Blueprint sets `NODE_ENV=production`, creates a random `JWT_SECRET`, obtains `CLIENT_ORIGIN` from the service's assigned external URL, and prompts for the private `MONGO_URI`. It does not create a MongoDB database; use MongoDB Atlas.

Before creating the Blueprint:

1. Create an Atlas database and a dedicated database user with only `readWrite` access to the ChronoMagix database. Do not use personal account credentials. Configure network access for the Render service.
2. Connect the repository to Render and apply the Blueprint. Supply the Atlas `MONGO_URI` when prompted. Keep the generated JWT secret private.
3. On a new empty database, run `npm run seed` once from the Render service shell if the evaluation needs demo accounts and courses. Do not run seeding automatically on every service start.
4. Check `/api/health`, then sign in with both roles in a private browser session. Verify the assigned `onrender.com` origin matches `CLIENT_ORIGIN` if you change the service URL or add a custom domain.

Build command:

```sh
npm install --include=dev && npm --prefix server install --include=dev && npm --prefix client install --include=dev && npm run build
```

Start command: `npm start`.

The assignment expects the free Render tier; free services may sleep, so allow about 30–60 seconds for a cold first load. Review the current [Render Node deployment guide](https://render.com/docs/deploy-node-express-app) and [Blueprint reference](https://render.com/docs/blueprint-spec) when configuring the service. The app has been verified in production mode locally; it has not been externally deployed from this repository.

## JSON and native database backups

The checked-in `dump/users.json`, `dump/courses.json`, and `dump/lectures.json` contain the demo dataset. User `password` values are bcrypt hashes, not plaintext passwords. The images are data URLs, not credentials. Do not run the exporter against a personal or production database and commit the resulting user data.

Export the database selected by `MONGO_URI`:

```powershell
npm.cmd run dump
```

By default the scripts read/write the repository's `dump/` directory. To test or use another directory, set `CHRONOMAGIX_DUMP_DIR` to an absolute path before running either script.

Validate the three JSON arrays and restore them to the database selected by `MONGO_URI` (this replaces its users, courses and lectures):

```powershell
npm.cmd --prefix server run import -- --confirm
```

Back up the target first and verify `MONGO_URI` before importing. Import validates hashes, IDs, dates, references and clash uniqueness before deleting records. On a failed or interrupted restore, restore the backup before using that database.

For a native MongoDB backup (requires MongoDB Database Tools):

```powershell
mongodump --uri="$env:MONGO_URI" --out="dump/mongodump"
mongorestore --uri="$env:MONGO_URI" --drop "dump/mongodump/chronomagix"
```

`mongorestore --drop` replaces collections in the target database. Check the URI and back up the target before running it. `dump/mongodump/` is git-ignored; keep private database backups out of source control.

## Design decisions, limits and QA

- Lecture dates are calendar dates only; no time slots or timezone conversions are stored.
- Availability is advisory; the unique index is the concurrency-safe guarantee.
- Cloudinary is optional; the default MongoDB data URL storage is bounded by the 2 MB upload limit.
- Students, enrollments, notifications and email reminders are not implemented.
- JWTs are stored in browser `localStorage`; deployment should use a private signing secret and demo-only accounts.
- Automated accessibility semantics, keyboard flows and responsive checks are recorded, but a hands-on screen-reader speech walkthrough remains pending.

Phase 5 responsive/accessibility evidence is in [docs/PHASE5_QA.md](docs/PHASE5_QA.md). Production verification, screenshots and measured Lighthouse results (27 November 2026; Performance 97, Accessibility 100, Best Practices 100, SEO 100) are in [docs/PHASE6_QA.md](docs/PHASE6_QA.md) and [docs/VISUAL_QA.md](docs/VISUAL_QA.md). Lighthouse 13 also reports an additional Agentic Browsing score of 50 for missing `llms.txt` and an invalid ARD manifest; those are not application requirements.

## Submission material

- [API reference](docs/API.md)
- [Design system](docs/DESIGN.md)
- [Demo recording script](docs/DEMO_SCRIPT.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Submission email template](docs/SUBMISSION_EMAIL.md)
- [QA index and screenshots](docs/VISUAL_QA.md)
- [Phase 7 handoff QA](docs/PHASE7_QA.md)

The assignment states **27 November 2026, 05:00 PM** and explicitly asks to confirm the deadline month with HR. Confirm the deadline before submission.
