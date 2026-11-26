import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new ApiError(401, 'Please sign in to continue.', 'UNAUTHORIZED');
  let payload;
  try { payload = jwt.verify(token, env.JWT_SECRET); } catch { throw new ApiError(401, 'Your session has expired. Please sign in again.', 'UNAUTHORIZED'); }
  const user = await User.findById(payload.sub).select('name email role').lean();
  if (!user) throw new ApiError(401, 'Your session has expired. Please sign in again.', 'UNAUTHORIZED');
  req.user = { ...user, id: String(user._id) };
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have access to this page.', 'FORBIDDEN'));
  next();
};
