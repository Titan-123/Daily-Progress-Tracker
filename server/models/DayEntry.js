import mongoose from "mongoose";

const dayEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reflection: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    mood: {
      type: String,
      enum: ["excellent", "good", "okay", "difficult"],
      default: "okay",
    },
    highlights: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],
    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    targets: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Target",
        },
        title: String,
        completed: Boolean,
        category: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
dayEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
dayEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DayEntry", dayEntrySchema);
