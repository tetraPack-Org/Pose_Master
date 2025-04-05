import express from "express";
import upload from "../middlewares/upload.js";
import {
  createMentorForm,
  getMentorFormById,
  updateMentorForm,
  deleteMentorForm
} from "../controllers/MentorFormHandler.js";

const router = express.Router();

// Create a mentor form
router.post("/", upload.any(), createMentorForm);

// Get a mentor form by its ID
router.get("/:id", getMentorFormById);

// Update a mentor form by its ID
router.put("/:id", updateMentorForm);

// Delete a mentor form by its ID
router.delete("/:id", deleteMentorForm);

export default router;