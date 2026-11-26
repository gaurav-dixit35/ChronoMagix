import ApiError from '../utils/ApiError.js';
export function notFound(req, res, next) { next(new ApiError(404, 'The requested resource was not found.', 'NOT_FOUND')); }
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.statusCode || 500;
  let code = error.code;
  let message = error.message || 'Something went wrong.';
  if (error.name === 'ValidationError' || error.name === 'CastError') { status = 400; code = 'VALIDATION_ERROR'; }
  if (error.code === 11000) { status = 409; code = 'INSTRUCTOR_DATE_CLASH'; message = 'This instructor is already assigned to a lecture on that date.'; }
  if (error.name === 'MulterError') { status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400; code = 'UPLOAD_ERROR'; message = status === 413 ? 'The image must be 2 MB or smaller.' : error.message; }
  const body = { success: false, message, ...(code ? { code } : {}) };
  if (error.details) body.errors = error.details;
  if (status >= 500 && process.env.NODE_ENV !== 'production') body.stack = error.stack;
  res.status(status).json(body);
}
