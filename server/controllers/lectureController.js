import Lecture from '../models/Lecture.js';
import { createLecture, updateLecture } from '../services/lectureService.js';
import ApiError from '../utils/ApiError.js';
export async function createForCourse(req,res) { const lecture=await createLecture({courseId:req.validated.params.id,...req.validated.body}); res.status(201).json({success:true,data:lecture}); }
export async function listLectures(req,res) { const {instructorId,courseId,from,to}=req.validated.query; const filter={...(instructorId?{instructor:instructorId}:{}),...(courseId?{course:courseId}:{}),...(from||to?{date:{...(from?{$gte:from}:{}),...(to?{$lte:to}:{})}}:{})}; const data=await Lecture.find(filter).populate('course','name image level').populate('instructor','name email').sort({date:1,_id:1}).lean(); res.json({success:true,data}); }
export async function patchLecture(req,res) { const data=await updateLecture(req.validated.params.id,req.validated.body); res.json({success:true,data}); }
export async function removeLecture(req,res) { const data=await Lecture.findByIdAndDelete(req.validated.params.id); if(!data) throw new ApiError(404,'Lecture not found.','NOT_FOUND'); res.json({success:true,data:{id:data._id}}); }
