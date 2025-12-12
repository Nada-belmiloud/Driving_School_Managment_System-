// backend/src/routes/schedule.routes.js
import express from "express";
import {
    getSchedules,
    getSchedule,
    addSchedule,
    updateSchedule,
    cancelSchedule,
    completeSchedule,
    getCandidateSchedule,
    getInstructorSchedule,
    getUpcomingSchedules
} from "../controllers/schedule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateSchedule } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Specific routes (must come before :id route)
router.get("/upcoming", getUpcomingSchedules);
router.get("/candidate/:candidateId", getCandidateSchedule);
router.get("/instructor/:instructorId", getInstructorSchedule);

// Main CRUD routes
router.route("/")
    .get(getSchedules)
    .post(validateSchedule, addSchedule);

router.route("/:id")
    .get(getSchedule)
    .put(updateSchedule)
    .delete(cancelSchedule);

// Mark as completed
router.put("/:id/complete", completeSchedule);

export default router;

