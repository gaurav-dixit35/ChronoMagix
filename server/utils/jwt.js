import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const signToken = (userId) => jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
