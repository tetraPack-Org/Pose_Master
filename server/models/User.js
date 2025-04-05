import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      required: true,
    },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["female", "male"], default: "female" }, // Default to "female"
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    activity_level: {
      type: String,
      enum: ["lightly active", "Sedentary", "Moderately active", "very active"],
      default: "lightly active", // Default to "lightly active"
    },
    goal: {
      type: String,
      enum: ["weight Loss", "maintenance", "muscle Gain", "Improve Health"],
      default: "Improve Health", // Default to "Improve Health"
    },
    diet_pref: {
      type: String,
      enum: ["Vegeterian", "Non-vegeterian", "Gluten Free", "No Preference"],
      default: "No Preference", // Default to "No Preference"
    },
    allergies: { type: String, default: "" },
    medical_conditions: { type: String, default: "" },
    meal_pref: { type: String, default: "" },
    budget_level: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low", // Default to "low"
    },
    days: { type: Number, default: 7 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
