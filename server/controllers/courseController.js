import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import { saveImage } from '../services/uploadService.js';
import { deleteCourse } from '../services/courseService.js';
import ApiError from '../utils/ApiError.js';
export async function listCourses(req,res) {
 const {search,level}=req.validated.query; const filter={...(level?{level}:{}),...(search?{name:{$regex:search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'}}:{})};
 const [courses,counts]=await Promise.all([Course.find(filter).sort({createdAt:-1,_id:1}).lean(),Lecture.aggregate([{$group:{_id:'$course',count:{$sum:1}}}])]); const map=new Map(counts.map(x=>[String(x._id),x.count]));
 res.json({success:true,data:courses.map(c=>({...c,lectureCount:map.get(String(c._id))||0}))});
}
export async function createCourse(req,res) { const image=await saveImage(req.file); if(!image) throw new ApiError(400,'A course image is required.','IMAGE_REQUIRED'); const course=await Course.create({...req.validated.body,image,createdBy:req.user.id}); res.status(201).json({success:true,data:course}); }
export async function getCourse(req,res) { const course=await Course.findById(req.validated.params.id).lean(); if(!course) throw new ApiError(404,'Course not found.','NOT_FOUND'); const lectures=await Lecture.find({course:course._id}).populate('instructor','name email').sort({date:1,_id:1}).lean(); res.json({success:true,data:{...course,lectures}}); }
export async function updateCourse(req,res) { const changes={...req.validated.body}; if(req.file) changes.image=await saveImage(req.file); const course=await Course.findOneAndUpdate({_id:req.validated.params.id},{$set:changes},{new:true,runValidators:true}); if(!course) throw new ApiError(404,'Course not found.','NOT_FOUND'); res.json({success:true,data:course}); }
export async function removeCourse(req,res) { const course=await deleteCourse(req.validated.params.id); res.json({success:true,data:{id:course._id}}); }
