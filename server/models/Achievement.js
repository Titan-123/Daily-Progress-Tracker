import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
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
      maxlength: 300,
    },
    icon: {
      type: String,
      required: true,
      maxlength: 10,
    },
    type: {
      type: String,
      required: true,
      enum: ["streak", "completion", "consistency", "milestone", "special"],
    },
    criteria: {
      streakDays: Number,
      completionRate: Number,
      targetCount: Number,
      categorySpecific: String,
    },
    isGlobal: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// User achievements (earned achievements)
const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, earnedAt: -1 });

export const Achievement = mongoose.model("Achievement", achievementSchema);
export const UserAchievement = mongoose.model(
  "UserAchievement",
  userAchievementSchema,
);
