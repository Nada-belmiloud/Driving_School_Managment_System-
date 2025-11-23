import express from "express";
import {
    getStudents,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentStats
} from "../controllers/student.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateStudent } from "../middleware/auth.middleware.js";

// Note: students = candidates (as malak did in the frontend)

const router = express.Router();

router.get("/stats", protect, getStudentStats);
router.get("/", protect, getStudents);
router.get("/:id", protect, getStudent);
router.post("/", protect, validateStudent, addStudent);
router.put("/:id", protect, validateStudent, updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;