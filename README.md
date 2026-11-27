<p align="center">
  <img src="client/public/logo-hero-transparent.png" alt="ChronoMagix — Time, scheduled." width="220" />
</p>

<h1 align="center">ChronoMagix</h1>

<p align="center">A date-first lecture scheduling workspace for administrators and instructors.</p>

<p align="center">
  <a href="docs/API.md">API</a> ·
  <a href="docs/DESIGN.md">Design</a> ·
  <a href="docs/DEMO_SCRIPT.md">Demo script</a> ·
  <a href="docs/VISUAL_QA.md">Visual QA</a>
</p>

## What it does

ChronoMagix helps an administrator organize courses and assign instructors to lecture dates. Instructors sign in to see their own upcoming and past lectures. Scheduling uses calendar dates (`YYYY-MM-DD`), without time slots or timezone conversion.

| Admin | Instructor |
| --- | --- |
| Create, edit, search and delete courses | View a personal lecture schedule |
| Create, edit and delete lectures | Filter upcoming and past lectures |
| Check instructor availability before booking | Access only their own schedule |
| Browse instructor schedules | |

The app prevents an instructor from being assigned to two lectures on the same date. A friendly availability check is backed by MongoDB's unique `{ instructor, date }` index, which also protects concurrent requests.

Other features include validated course image uploads (Cloudinary when configured, MongoDB data URL storage otherwise), responsive admin and instructor views, accessible feedback and confirmations, and a welcome splash shown once per browser.

## Run locally

### Requirements

- Node.js 20 or newer and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

### Install and configure

From the repository root, run these in PowerShell:

```powershell
npm.cmd run install:all
Copy-Item server/.env.example server/.env
notepad server/.env
```

In `server/.env`, set `MONGO_URI` to your reachable database and replace `JWT_SECRET` with a private random value of at least 32 characters. The example values are for local development only. Make sure MongoDB is running before continuing.

Seed the demo records, then start the app:

```powershell
npm.cmd run seed
npm.cmd run dev
```

Open <http://localhost:5173>. The development command starts the API and client, and reuses a healthy ChronoMagix service already running on its expected port. If another app owns port 5000 or 5173, close it from the terminal that started it and retry. Press Ctrl+C to stop services started by this command; an already-running service that was reused is left running.

If PowerShell blocks `npm.ps1`, use `npm.cmd` as shown. The Vite client proxies `/api` requests to the Express API on port 5000.

### Demo sign-in

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@chronomagix.com` | `Admin@123` |
| Instructor | `gaurav@chronomagix.com` | `Instructor@123` |

These are public demo credentials for evaluation. Do not use them for a real deployment or reuse either password for a personal account. The seed command is idempotent: it can be run again without creating duplicate demo records.

### Environment settings

The server reads `server/.env`. The client's optional Vite settings belong in `client/.env`.

| Variable | Default / purpose |
| --- | --- |
| `PORT` | Express port; defaults to `5000`. |
| `NODE_ENV` | `development`, `test` or `production`. |
| `MONGO_URI` | Required MongoDB connection string. |
| `JWT_SECRET` | Required private signing secret, at least 32 characters. |
| `JWT_EXPIRES_IN` | JWT lifetime; defaults to `1d`. |
| `CLIENT_ORIGIN` | CORS origin; local default is `http://localhost:5173`. |
| `CLOUDINARY_URL` | Optional. Empty uses MongoDB data URL storage for uploaded course images. |
| `VITE_API_BASE_URL` | Optional client API base; defaults to `/api`. |
| `VITE_SHOW_DEMO_HINTS` | Set to `true` to show demo credential autofill buttons on login. |

Do not commit `.env` files, database URIs or service credentials. The checked-in `.env.example` files contain placeholders.

## Checks and production mode

Run the backend tests and create the production client bundle:

```powershell
npm.cmd --prefix server test
npm.cmd run build
```

To run the production build locally, keep MongoDB and `server/.env` configured, then run:

```powershell
$env:NODE_ENV = 'production'
npm.cmd start
```

Open <http://localhost:5000>. In production mode Express serves both the API and `client/dist`, including client-side deep links. The health endpoint is <http://localhost:5000/api/health>.

The test suite uses an in-memory MongoDB instance and covers authentication, access control, instructor isolation, date validation, course cascade deletion, schedule conflicts and concurrent booking. The expected concurrency result is one successful creation and one HTTP 409 conflict.

## API and application routes

The API is rooted at `/api`. Successful responses use `{ "success": true, "data": ... }`; errors include a readable message and, where applicable, a code and validation details. Protected endpoints require a bearer token. The full request and response contract is in [docs/API.md](docs/API.md).

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Signed in |
| `GET` | `/api/instructors` and `/api/instructors/availability` | Admin |
| `GET`, `POST` | `/api/courses` | Admin |
| `GET`, `PUT`, `DELETE` | `/api/courses/:id` | Admin |
| `POST` | `/api/courses/:id/lectures` | Admin |
| `GET` | `/api/lectures` | Admin |
| `GET`, `PATCH`, `DELETE` | `/api/lectures/:id` | Admin |
| `GET` | `/api/instructor/lectures` | Instructor; own records only |

The React app provides `/login`, admin course, lecture and instructor pages, and `/instructor/lectures`. Frontend route guards improve navigation; the API independently enforces roles and instructor data isolation.

## Project structure

```text
client/                 React app, routes, forms, shared components and styles
server/                 Express API, validation, business services and MongoDB models
  config/               Environment validation and database connection
  controllers/           HTTP request handlers
  middleware/            Auth, validation, uploads, rate limits and error handling
  models/                User, Course and Lecture schemas and indexes
  routes/                API route definitions
  scripts/               Seed and JSON dump import/export
  tests/                 API and scheduling tests
docs/                   API, design, demo, QA and handoff documentation
dump/                   Seeded JSON data for the assignment demo
```

The client uses React, Vite, React Router, React Hook Form and Zod. The server uses Node.js, Express, Mongoose and MongoDB. Zod validates request and form data. The service layer holds scheduling and cascade rules; Mongoose models provide database access. See [docs/DESIGN.md](docs/DESIGN.md) for design tokens and UI decisions.

## Seed data and backups

The seed creates one admin, six instructors, three courses and nine clash-free lectures. To export the database selected by `MONGO_URI` to `dump/`:

```powershell
npm.cmd run dump
```

To import those JSON files into the database selected by `MONGO_URI`, explicitly confirm the replacement:

```powershell
npm.cmd --prefix server run import -- --confirm
```

Import replaces the users, courses and lectures collections. Back up the target and check `MONGO_URI` before importing. Set `CHRONOMAGIX_DUMP_DIR` to use a different dump directory. The checked-in demo passwords are bcrypt hashes; do not commit real user exports.

For native backups, install MongoDB Database Tools first:

```powershell
mongodump --uri="$env:MONGO_URI" --out="dump/mongodump"
mongorestore --uri="$env:MONGO_URI" --drop "dump/mongodump/chronomagix"
```

`mongorestore --drop` replaces collections in the target database. Verify the URI and back up the target before running it. Native database backups are git-ignored.

## Deploy to Render

[`render.yaml`](render.yaml) defines a single Node web service that builds the client, starts Express, and checks `/api/health`. The service needs an external MongoDB database; the Blueprint does not provision one.

1. Create a MongoDB Atlas database and a dedicated database user. Allow the Render service to connect, and keep the connection string private.
2. Connect the repository to Render and create the service from the Blueprint. Supply the Atlas `MONGO_URI`; Render generates `JWT_SECRET` and sets the production origin.
3. If the database is empty and the demo data is needed, run `npm run seed` once from the Render shell. Seeding is not part of application startup.
4. Verify `/api/health` and sign in with both demo roles in a private browser window.

For current setup steps, service limits and Blueprint behavior, review the [Render Node deployment guide](https://render.com/docs/deploy-node-express-app) and [Blueprint reference](https://render.com/docs/blueprint-spec). The repository includes a deployment configuration; no live Render deployment has been created from this workspace.

## Scope and known limitations

- Student accounts, enrollment, notifications and email reminders are not implemented.
- Lecture records have dates but no times or time slots. Past dates are allowed.
- The default image fallback stores data URLs in MongoDB; configure Cloudinary for an external image service.
- JWTs are stored in browser `localStorage`; protect the deployed environment and use private credentials.
- Automated keyboard, accessibility-tree and responsive checks are recorded. A spoken screen-reader walkthrough with NVDA, JAWS or Narrator remains to be completed.

The latest recorded Lighthouse results and screenshots are documented in [docs/PHASE6_QA.md](docs/PHASE6_QA.md) and [docs/VISUAL_QA.md](docs/VISUAL_QA.md). Phase 5 evidence is in [docs/PHASE5_QA.md](docs/PHASE5_QA.md). Handoff steps and items that still need external accounts or human review are listed in [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md).

## More documentation

- [API contract](docs/API.md)
- [Design system and decisions](docs/DESIGN.md)
- [Demo walkthrough](docs/DEMO_SCRIPT.md)
- [Responsive and accessibility QA](docs/PHASE5_QA.md)
- [Production and Lighthouse QA](docs/PHASE6_QA.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Submission email template](docs/SUBMISSION_EMAIL.md)
