// backend/src/routes/auth.routes.js

/*
Hello Team, below is the routes file for authentication
functionalities including registration, login, profile retrieval,
password update, and logout. Each route is documented with Swagger
for easy API reference.

IMPORTANT: the middleware functions such as 'protect', 'validateLogin',
'validateRegister', and rate limiters are assumed to be implemented
elsewhere in the codebase. and they will be implemented later
*/

import express from "express";
import {
    registerAdmin,
    loginAdmin,
    getMe,
    updatePassword,
    logoutAdmin
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateLogin, validateRegister } from "../middleware/auth.middleware.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new admin
 *     description: Create a new admin account (limited to 3 per hour per IP)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input or admin already exists
 */
router.post("/register", registerLimiter, validateRegister, registerAdmin);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login admin
 *     description: Authenticate admin and receive JWT token (limited to 5 attempts per 15 minutes per IP)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginLimiter, validateLogin, loginAdmin);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current admin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved
 *       401:
 *         description: Not authorized
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/updatepassword:
 *   put:
 *     tags: [Authentication]
 *     summary: Update admin password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 */
router.put("/updatepassword", protect, passwordResetLimiter, updatePassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", protect, logoutAdmin);

export default router;