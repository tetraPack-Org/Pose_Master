import express from "express";
import { signup, login, getCurrentUser, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", getCurrentUser);
router.post("/logout", logout); // Logout endpoint

export default router;