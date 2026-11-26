export default class ApiError extends Error {
  constructor(statusCode, message, code, details) {
    super(message);
    this.statusCode = statusCode;
    if (code) this.code = code;
    if (details) this.details = details;
  }
}
