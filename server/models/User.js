import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: "09:00",
      },
    },
    streaks: {
      current: {
        type: Number,
        default: 0,
      },
      best: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: Date,
        default: Date.now,
      },
    },
    subscription: {
      tier: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "canceled", "expired"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      planId: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
