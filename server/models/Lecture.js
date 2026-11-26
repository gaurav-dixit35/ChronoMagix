import mongoose from 'mongoose';
import { isRealCalendarDate } from '../utils/dateKey.js';

const lectureSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true, validate: { validator: isRealCalendarDate, message: 'Date must be a real calendar date in YYYY-MM-DD format.' } },
  title: { type: String, trim: true, maxlength: 120 },
}, { timestamps: true });

lectureSchema.index({ instructor: 1, date: 1 }, { unique: true, name: 'uniq_instructor_date' });
lectureSchema.index({ course: 1, date: 1 });
lectureSchema.index({ date: 1 });

export default mongoose.models.Lecture || mongoose.model('Lecture', lectureSchema);
