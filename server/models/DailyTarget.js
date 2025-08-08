import mongoose from "mongoose";

const dailyTargetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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
        "Other",
      ],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: true,
      default: () => new Date(), // Today by default
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
dailyTargetSchema.index({ userId: 1, dueDate: 1, completed: 1 });
dailyTargetSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DailyTarget", dailyTargetSchema);
