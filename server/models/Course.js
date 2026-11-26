import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  level: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  image: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

courseSchema.index({ createdAt: -1 });
courseSchema.index({ level: 1, createdAt: -1 });
courseSchema.index({ name: 1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
