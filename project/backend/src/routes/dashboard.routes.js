// backend/src/routes/dashboard.routes.js
import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All dashboard routes require authentication
router.get("/stats", protect, getDashboardStats);

export default router;

