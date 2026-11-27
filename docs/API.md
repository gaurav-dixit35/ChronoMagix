# ChronoMagix API

Base path: `/api`. JSON routes return `{ "success": true, "data": ... }`. Errors return `{ "success": false, "message": ..., "code": ..., "errors": ... }`; optional `code` and `errors` keys are omitted where not applicable. Protected requests use `Authorization: Bearer <JWT>`. Admin routes require role `admin`; `/instructor/lectures` always scopes to the authenticated instructor ID.

## Routes

| Method | Path | Access | Request / response |
|---|---|---|---|
| GET | `/health` | Public | `data.status` is `ok`; includes a UTC timestamp. |
| POST | `/auth/login` | Public | JSON `{ email, password }`; returns `{ token, user: { id, name, email, role } }`. Password is never returned. |
| GET | `/auth/me` | Signed in | Returns the authenticated safe user DTO. |
| GET | `/instructors` | Admin | Returns instructor `{ id, name, email, bio, lectureCount }` records. |
| GET | `/instructors/availability?date=YYYY-MM-DD&excludeLectureId=` | Admin | Returns `{ id, name, available, bookedCourse? }` per instructor. `excludeLectureId` is used while editing an existing lecture. |
| GET | `/courses?search=&level=` | Admin | Optional case-insensitive name search and `Beginner`, `Intermediate` or `Advanced` level filter; each result includes `lectureCount`. |
| POST | `/courses` | Admin | Multipart fields `name`, `level`, `description`, `image`; responds HTTP 201 with the course. |
| GET | `/courses/:id` | Admin | Returns course and its date-sorted lectures with instructor name/email. |
| PUT | `/courses/:id` | Admin | Update one or more course fields. Multipart is accepted when replacing `image`; responds HTTP 200. |
| DELETE | `/courses/:id` | Admin | Deletes the course and its lectures; returns `{ id }`. |
| POST | `/courses/:id/lectures` | Admin | JSON `{ instructorId, date, title? }`; creates a lecture with HTTP 201. Missing title gets a generated `Batch N` value. |
| GET | `/lectures?instructorId=&courseId=&from=&to=` | Admin | All filters are optional; `from` and `to` are inclusive `YYYY-MM-DD` bounds. Course and instructor details are populated. |
| GET | `/lectures/:id` | Admin | Returns one lecture with populated course and instructor for edit screens. |
| PATCH | `/lectures/:id` | Admin | JSON with one or more of `{ instructorId, date, title }`; rechecks instructor/date clash and returns the updated lecture. |
| DELETE | `/lectures/:id` | Admin | Deletes a lecture and returns `{ id }`. |
| GET | `/instructor/lectures` | Instructor | Returns only that instructor's date-sorted lectures with course details. |

## Dates, uploads and errors

Dates are strings in `YYYY-MM-DD` format and must be real Gregorian calendar dates. Past dates are valid. Dates remain date-only values; no time or timezone conversion is applied.

Course images accept JPEG, PNG or WebP up to 2 MB. The multipart field name is `image`. When `CLOUDINARY_URL` is configured, the server uploads to Cloudinary; otherwise it stores a data URL in MongoDB.

Common status codes:

| Status | Meaning |
|---|---|
| 400 | Invalid request, date, or image type; response includes a readable message and validation details when present. |
| 401 | Missing/invalid token or incorrect login credentials. |
| 403 | Authenticated role cannot access the route. |
| 404 | Record or route not found. |
| 409 | Instructor already has a lecture on that date; code is `INSTRUCTOR_DATE_CLASH`. |
| 413 | Image exceeds 2 MB. |
| 429 | Rate limit reached; login permits 10 requests and the general API permits 300 requests per 15 minutes per client IP. |

The lecture service checks for a clash first to provide a friendly message. MongoDB's unique `{ instructor: 1, date: 1 }` index is the final race-safe guarantee; duplicate-key failures are mapped to the same HTTP 409 response.

### Example: login and create a lecture

```http
POST /api/auth/login
Content-Type: application/json

{"email":"admin@chronomagix.com","password":"Admin@123"}
```

Use the returned token in `Authorization: Bearer <token>` when calling protected routes:

```http
POST /api/courses/COURSE_ID/lectures
Authorization: Bearer <token>
Content-Type: application/json

{"instructorId":"INSTRUCTOR_ID","date":"2026-12-10","title":"Batch 1"}
```

If that instructor already has a lecture on `2026-12-10`, the endpoint returns status 409 and `code: "INSTRUCTOR_DATE_CLASH"`.
