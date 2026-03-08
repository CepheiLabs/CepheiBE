import { Router } from "express";
import { getMe, updateUsername } from "../controllers/playerController.js";
import { protect } from "../middlewares/authHandler.js";

const router = Router();

router.get("/me", protect, getMe);
router.patch("/update-username", protect, updateUsername);

export default router;

/**
 * @swagger
 * /api/v1/players/me:
 *   get:
 *     summary: Get the authenticated player's profile
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Player fetched successfully
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
 *                   example: Fetched player data successfully
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
 *                         walletAddress:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/players/update-username:
 *   patch:
 *     summary: Update the authenticated player's username
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: shadowHunter42
 *     responses:
 *       202:
 *         description: Username updated successfully
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
 *                   example: Update username successfully
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
 *                         walletAddress:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
