import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    // Owner of the task. Every query is filtered by this, so users only see their own tasks.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
    description: { type: String, trim: true, default: '', maxlength: 1000 },
    // Start date & time (mandatory). Stored as a full UTC instant.
    dueAt: { type: Date, required: [true, 'Date & time is required'] },
    endAt: { type: Date, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high', null], default: null },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  },
  { timestamps: true }
);

taskSchema.index({ dueAt: 1 });

export default mongoose.model('Task', taskSchema);
