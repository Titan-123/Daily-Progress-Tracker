import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  completed: {
    type: Boolean,
    default: false
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
targetSchema.index({ userId: 1, date: 1 });
targetSchema.index({ userId: 1, goalId: 1 });
targetSchema.index({ date: 1, userId: 1 });

// Ensure one target per goal per day
targetSchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

export default mongoose.model('Target', targetSchema);
