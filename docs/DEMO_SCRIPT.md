# ChronoMagix demo recording script

Record at 1280 px desktop width, then show the key screens at 360 px. Start with a fresh browser profile. Use only the seeded demo accounts and temporary demo records. Keep the address bar and UI visible, but never show `.env`, Atlas credentials, a JWT, or a real account.

## Suggested 5–7 minute walkthrough

1. **Sign in as admin.** Use `admin@chronomagix.com` / `Admin@123`. Show the course catalog, search/filter, then the instructor directory.
2. **Create a temporary course.** Add a course name, level, short description and a JPEG/PNG/WebP image. Show the live preview, save, and open its detail page.
3. **Book a lecture.** Open Add lecture, choose a date first, and show the booked/available instructor choices. Select an available instructor and save. Show the new row and updated availability.
4. **Demonstrate the API race-safe rule.** In a REST client with the admin token hidden, make a second `POST /api/courses/:id/lectures` request for the same instructor and date under a different course. Show HTTP 409 and `INSTRUCTOR_DATE_CLASH`. Do not expose the bearer token in the recording. The automated test also demonstrates concurrent requests: exactly one receives 201 and the other 409.
5. **Edit and clean up.** Change the temporary lecture date, delete one lecture with the confirmation dialog, then delete the temporary course. Show that its remaining lecture is cascaded away. This keeps the seeded example data intact.
6. **Show the schedule lenses.** Open Admin → Lectures, show the table and Week view, then apply a course/date/instructor filter and point out that filters are URL-backed.
7. **Sign in as instructor.** Use `gaurav@chronomagix.com` / `Instructor@123`. Show Next Up, upcoming and past sections. Try an admin URL and show that the instructor is redirected. Sign out afterward.
8. **Show mobile layout.** At 360 px, show the responsive navigation, course cards or lecture list, and instructor schedule. Keep the nested table's internal horizontal scrolling inside its panel.

## Before recording

- Start from a seeded database with the expected one admin, six instructors, three courses and nine lectures.
- Choose a future date with at least one available instructor; do not assume a specific instructor is free.
- Use a temporary course and remove it at the end. Do not delete or edit the seed courses/lectures.
- If using a hosted instance, allow for a cold start, verify both logins in a private browser first, and use the hosted URL. Do not expose service setup or private credentials.
- Save the final video to Drive and enable open-access viewing for the reviewer.
