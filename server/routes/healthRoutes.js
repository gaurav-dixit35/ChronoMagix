import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { emptyRequestSchema } from '../validators/commonValidators.js';
const router=Router(); router.get('/',validate(emptyRequestSchema),(req,res)=>res.json({success:true,data:{status:'ok',time:new Date().toISOString()}})); export default router;
