import { getAvailability, listInstructors as findInstructors } from '../services/instructorService.js';
export async function listInstructors(req, res) { res.json({ success: true, data: await findInstructors() }); }
export async function availability(req, res) { res.json({ success: true, data: await getAvailability(req.validated.query.date, req.validated.query.excludeLectureId) }); }
