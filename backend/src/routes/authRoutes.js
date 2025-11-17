import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateRegister,
  handleValidationErrors,
  register
);

router.post(
  "/login",
  authLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.get("/me", protect, getMe);

export default router;
