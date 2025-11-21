// backend/src/routes/dashboard.routes.js
import express from "express";
import {
    getDashboardStats,
    getRecentActivities,
    getChartData
} from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All dashboard routes require authentication
router.get("/stats", protect, getDashboardStats);
router.get("/activities", protect, getRecentActivities);
router.get("/charts", protect, getChartData);

export default router;
