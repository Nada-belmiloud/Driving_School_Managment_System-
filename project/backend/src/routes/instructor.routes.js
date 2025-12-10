// backend/src/routes/instructor.routes.js
import express from "express";
import {
    getInstructors,
    getInstructor,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    assignVehicle,
    getInstructorCount
} from "../controllers/instructor.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateInstructor } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Count route (must come before :id route)
router.get("/count", getInstructorCount);

// Main CRUD routes
router.route("/")
    .get(getInstructors)
    .post(validateInstructor, addInstructor);

router.route("/:id")
    .get(getInstructor)
    .put(validateInstructor, updateInstructor)
    .delete(deleteInstructor);

// Vehicle assignment
router.put("/:id/assign-vehicle", assignVehicle);

export default router;

