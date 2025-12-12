// backend/src/routes/auth.routes.js
import express from "express";
import {
    loginAdmin,
    getMe,
    updateEmail,
    updatePassword,
    updateName,
    logoutAdmin,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateLogin } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginLimiter, validateLogin, loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/email", protect, updateEmail);
router.put("/password", protect, updatePassword);
router.put("/name", protect, updateName);
router.post("/logout", protect, logoutAdmin);

export default router;

