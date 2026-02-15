import { Router } from "express";
import { registerPlayer, login } from "../controllers/authController";

const router = Router();

router.post("/register", registerPlayer);
router.post("/login", login);

export default router;

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new player
 *     tags:
 *       - Players
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: player@example.com
 *               username:
 *                 type: string
 *                 example: player123
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *               confirmPassword:
 *                 type: string
 *                 example: StrongPass123!
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.png
 *     responses:
 *       201:
 *         description: Player registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a player
 *     tags:
 *       - Players
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jamescameron@gmail.com
 *               password:
 *                 type: string
 *                 example: password1
 *     responses:
 *       200:
 *         description: Player logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Player logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     player:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
