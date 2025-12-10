// backend/src/routes/candidate.routes.js
import express from "express";
import {
    getCandidates,
    getCandidate,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateCount,
    updateProgress
} from "../controllers/candidate.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateCandidate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Count route (must come before :id route)
router.get("/count", getCandidateCount);

// Main CRUD routes
router.route("/")
    .get(getCandidates)
    .post(validateCandidate, addCandidate);

router.route("/:id")
    .get(getCandidate)
    .put(validateCandidate, updateCandidate)
    .delete(deleteCandidate);

// Progress update
router.put("/:id/progress", updateProgress);

export default router;

