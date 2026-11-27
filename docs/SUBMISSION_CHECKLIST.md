# ChronoMagix submission checklist

Use this checklist just before sending the assignment. Items marked complete are verified locally; external account and submission actions remain unchecked until you do them.

## Project package and local verification

- [x] README covers setup, roles, architecture, data/indexes, API and frontend routes, design choices, tests, Render configuration and backups.
- [x] `docs/API.md`, `docs/DESIGN.md`, `docs/DEMO_SCRIPT.md`, `docs/SUBMISSION_EMAIL.md` and this checklist match the implemented routes and behavior.
- [x] Production build and single-service Express behavior verified locally, including deep links, hard refresh, API separation and robots.
- [x] Backend test suite passed: 11 tests.
- [x] Actual Lighthouse report saved under `docs/reports/`: Performance 97, Accessibility 100, Best Practices 100, SEO 100.
- [x] JSON dump contains 1 admin, 6 instructors, 3 courses and 9 lectures; passwords are bcrypt hashes. JSON import and export were validated against an isolated in-memory MongoDB.
- [ ] Hands-on screen-reader speech walkthrough with NVDA, JAWS or Narrator. Automated keyboard and accessibility-tree checks are recorded; spoken output has not been verified.

## External deployment and materials

- [ ] Create a dedicated MongoDB Atlas database user with only `readWrite` access to the ChronoMagix database. Do not use or share a personal account.
- [ ] Configure Atlas network access for the Render service; keep the connection string private.
- [ ] Create/apply the Render web service from `render.yaml`, supply the Atlas `MONGO_URI`, and verify the production URL and `/api/health`.
- [ ] Seed the new evaluation database once, if needed. Do not seed automatically on service startup.
- [ ] Verify both demo logins in a private browser after deployment: `admin@chronomagix.com` / `Admin@123`; `gaurav@chronomagix.com` / `Instructor@123`.
- [ ] If using Cloudinary, create a separate submission account and set `CLOUDINARY_URL`; otherwise retain the MongoDB data URL fallback.
- [ ] Record the walkthrough using `docs/DEMO_SCRIPT.md`; upload it to Drive and enable open-access viewing.
- [ ] Provide source code through GitHub or Drive, with the JSON demo dump or a secure dump location. Do not commit real user dumps, Atlas URIs or secrets.
- [ ] Fill in live app, credentials, recording, source and dump links in `docs/SUBMISSION_EMAIL.md`.
- [ ] Warm the Render service shortly before sending and test both roles in a private browser.

## Deadline and email

- [ ] Confirm the deadline month and time with HR. The assignment gives **27 November 2026, 05:00 PM** and separately asks to confirm the month.
- [ ] Use this exact email subject: **Gaurav Dixit - Review Test Assignment**.
- [ ] Check that every link is accessible to the reviewer before sending.
