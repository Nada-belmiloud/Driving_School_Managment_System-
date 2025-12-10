// backend/src/routes/payment.routes.js
import express from "express";
import {
    getPayments,
    getPayment,
    addPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
    getPendingPayments,
    getPendingPaymentsCount,
    getCandidatePayments
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validatePayment } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Specific routes (must come before :id route)
router.get("/pending", getPendingPayments);
router.get("/pending/count", getPendingPaymentsCount);
router.get("/candidate/:candidateId", getCandidatePayments);

// Main CRUD routes
router.route("/")
    .get(getPayments)
    .post(validatePayment, addPayment);

router.route("/:id")
    .get(getPayment)
    .put(updatePayment)
    .delete(deletePayment);

// Mark as paid
router.put("/:id/mark-paid", markAsPaid);

export default router;

