import Lecture from '../models/Lecture.js';
export async function myLectures(req,res) { const data=await Lecture.find({instructor:req.user.id}).populate('course','name image level').sort({date:1,_id:1}).lean(); res.json({success:true,data}); }
