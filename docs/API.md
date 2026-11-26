# ChronoMagix API

Base path: `/api`. All responses use `{ success: true, data }`; errors use `{ success: false, message, code?, errors? }`. Protected routes require `Authorization: Bearer <JWT>`. Admin routes require the `admin` role; the instructor schedule is scoped to the authenticated instructor.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Status and UTC timestamp |
| POST | `/auth/login` | Public | Login using email and password; returns token and safe user DTO |
| GET | `/auth/me` | Signed in | Current user DTO |
| GET | `/instructors` | Admin | Instructor list with lecture counts |
| GET | `/instructors/availability?date=YYYY-MM-DD` | Admin | Instructor availability and booked course for a date |
| GET | `/courses?search=&level=` | Admin | Filtered course list and lecture counts |
| POST | `/courses` | Admin | Multipart course creation (`name`, `level`, `description`, `image`) |
| GET | `/courses/:id` | Admin | Course with date-sorted populated lectures |
| PUT | `/courses/:id` | Admin | Update course fields; optional multipart image |
| DELETE | `/courses/:id` | Admin | Delete course and its lectures |
| POST | `/courses/:id/lectures` | Admin | Create lecture (`instructorId`, `date`, optional `title`) |
| GET | `/lectures?instructorId=&courseId=&from=&to=` | Admin | Filtered populated lecture list |
| PATCH | `/lectures/:id` | Admin | Update instructor, date or title; rechecks clashes |
| DELETE | `/lectures/:id` | Admin | Delete a lecture |
| GET | `/instructor/lectures` | Instructor | The signed-in instructor’s schedule only |

Lecture dates are real Gregorian dates encoded as `YYYY-MM-DD`; past dates are accepted. A duplicate instructor/date booking returns HTTP 409 with `INSTRUCTOR_DATE_CLASH` and conflict details. The unique compound index is authoritative under concurrent requests.

Uploads accept JPEG, PNG or WebP up to 2 MB. With `CLOUDINARY_URL`, images are uploaded to Cloudinary; otherwise a data URL is stored in MongoDB.
