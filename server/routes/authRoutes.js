import express from "express";
import { signup, login, getCurrentUser, logout } from "../controllers/auth.js";
import { requireAuth } from "../middlewares/mid_auth.js";
import User from "../models/User.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", getCurrentUser);
router.post("/logout", logout); // Logout endpoint

// Get user profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("User profile fetched:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", requireAuth, async (req, res) => {
  const {
    age,
    weight,
    height,
    activity_level,
    goal,
    diet_pref,
    allergies,
    medical_conditions,
    meal_pref,
    budget_level,
    days,
    userId,
  } = req.body;
    console.log("Profile update request:", req.body);
    console.log("User ID from request:", userId);
  try {
    const user = await User.findById(userId);
    
    console.log("User found for update:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (age !== undefined) user.age = age;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (activity_level !== undefined) user.activity_level = activity_level;
    if (goal !== undefined) user.goal = goal;
    if (diet_pref !== undefined) user.diet_pref = diet_pref;
    if (allergies !== undefined) user.allergies = allergies;
    if (medical_conditions !== undefined)
       user.medical_conditions = medical_conditions;
    if (meal_pref !== undefined) user.meal_pref = meal_pref;
    if (budget_level !== undefined) user.budget_level = budget_level;
    if (days !== undefined) user.days = days;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;