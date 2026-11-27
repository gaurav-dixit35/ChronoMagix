import { createLecture, getLecture, listLectures, removeLecture, updateLecture } from '../services/lectureService.js';
export async function createForCourse(req,res) { const lecture=await createLecture({courseId:req.validated.params.id,...req.validated.body}); res.status(201).json({success:true,data:lecture}); }
export async function list(req,res) { res.json({success:true,data:await listLectures(req.validated.query)}); }
export async function detail(req,res) { res.json({success:true,data:await getLecture(req.validated.params.id)}); }
export async function patchLecture(req,res) { const data=await updateLecture(req.validated.params.id,req.validated.body); res.json({success:true,data}); }
export async function remove(req,res) { const data=await removeLecture(req.validated.params.id); res.json({success:true,data:{id:data._id}}); }
