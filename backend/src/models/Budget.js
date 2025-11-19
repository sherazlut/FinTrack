import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [0, "Monthly limit cannot be negative"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be between 1 and 12"],
      max: [12, "Month must be between 1 and 12"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Year must be a valid year"],
      max: [2100, "Year must be a valid year"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one budget per user per category per month/year
budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);
budgetSchema.index({ user: 1, month: 1, year: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
