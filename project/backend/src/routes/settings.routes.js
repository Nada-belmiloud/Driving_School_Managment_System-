// backend/src/routes/settings.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getSettings,
    updateName,
    updateEmail,
    updatePassword
} from "../controllers/settings.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current settings
router.get('/', getSettings);

// Update name
router.put('/name', updateName);

// Update email
router.put('/email', updateEmail);

// Update password
router.put('/password', updatePassword);

export default router;

