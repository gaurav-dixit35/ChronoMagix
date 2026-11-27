import { listInstructorLectures } from '../services/lectureService.js';
export async function myLectures(req,res) { const data=await listInstructorLectures(req.user.id); res.json({success:true,data}); }
