import express from "express";
import {
  createMentorForm,
  getMentorFormByIdAndRoom,
  updateMentorForm,
  deleteMentorForm
} from "../controllers/MentorFormHandler.js";

const router = express.Router();

// Create a mentor form
router.post("/", createMentorForm);

// Get a mentor form by its ID
router.get("/get", getMentorFormByIdAndRoom);

// Update a mentor form by its ID
router.put("/:id", updateMentorForm);

// Delete a mentor form by its ID
router.delete("/:id", deleteMentorForm);

export default router;