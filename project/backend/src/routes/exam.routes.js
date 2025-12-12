// backend/src/routes/exam.routes.js
import express from "express";
import {
    getExams,
    getExam,
    scheduleExam,
    updateExam,
    recordExamResult,
    cancelExam,
    checkCanTakeExam,
    getCandidateExams,
    getUpcomingExams
} from "../controllers/exam.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateExam } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Specific routes (must come before :id route)
router.get("/upcoming", getUpcomingExams);
router.get("/candidate/:candidateId", getCandidateExams);
router.get("/can-take/:candidateId/:examType", checkCanTakeExam);

// Main CRUD routes
router.route("/")
    .get(getExams)
    .post(validateExam, scheduleExam);

router.route("/:id")
    .get(getExam)
    .put(updateExam)
    .delete(cancelExam);

// Record exam result
router.put("/:id/result", recordExamResult);

export default router;

