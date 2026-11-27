export const ROLES = Object.freeze({ ADMIN: 'admin', INSTRUCTOR: 'instructor' });
export const LEVELS = Object.freeze(['Beginner', 'Intermediate', 'Advanced']);
export const ERROR_CODES = Object.freeze({ INSTRUCTOR_DATE_CLASH: 'INSTRUCTOR_DATE_CLASH' });
export const ROUTES = Object.freeze({ LOGIN: '/login', ADMIN_COURSES: '/admin/courses', ADMIN_COURSE_NEW: '/admin/courses/new', ADMIN_INSTRUCTORS: '/admin/instructors', ADMIN_LECTURES: '/admin/lectures', INSTRUCTOR_LECTURES: '/instructor/lectures', courseEdit: (id) => `/admin/courses/${id}/edit`, lectureEdit: (id) => `/admin/lectures/${id}/edit` });
