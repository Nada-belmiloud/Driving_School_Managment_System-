// backend/src/routes/vehicle.routes.js
import express from "express";
import {
    getVehicles,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    assignInstructor,
    getVehicleCount,
    getMaintenanceLogs,
    addMaintenanceLog,
    updateMaintenanceLog
} from "../controllers/vehicle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateVehicle } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Count route (must come before :id route)
router.get("/count", getVehicleCount);

// Main CRUD routes
router.route("/")
    .get(getVehicles)
    .post(validateVehicle, addVehicle);

router.route("/:id")
    .get(getVehicle)
    .put(validateVehicle, updateVehicle)
    .delete(deleteVehicle);

// Instructor assignment
router.put("/:id/assign-instructor", assignInstructor);

// Maintenance logs
router.route("/:id/maintenance-logs")
    .get(getMaintenanceLogs)
    .post(addMaintenanceLog);

router.put("/:id/maintenance-logs/:logId", updateMaintenanceLog);

export default router;

