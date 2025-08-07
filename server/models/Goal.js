import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Health",
        "Learning",
        "Creative",
        "Professional",
        "Personal",
        "Social",
      ],
    },
    target: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastCompletedDate: {
      type: Date,
    },
    completionHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        completed: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
goalSchema.index({ userId: 1, type: 1, isActive: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Goal", goalSchema);
