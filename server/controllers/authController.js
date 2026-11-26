import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';
export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  res.json({ success: true, data: { token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
}
export function me(req, res) { res.json({ success: true, data: req.user }); }
