import { authenticate } from '../services/authService.js';
export async function login(req, res) { res.json({ success: true, data: await authenticate(req.validated.body) }); }
export function me(req, res) { res.json({ success: true, data: req.user }); }
