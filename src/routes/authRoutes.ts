import { Router } from "express";
import {
  registerPlayer,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
} from "../controllers/authController";
import { identify, protect } from "../middlewares/authHandler";

import { getWalletNonce, verifyWallet } from "../controllers/walletController";
import { googleSignin } from "../controllers/googleController";

const router = Router();

router.post("/register", registerPlayer);
router.post("/login", login);
router.post("/logout", logout);
router.post("/wallet/nonce", getWalletNonce);
router.post("/wallet/verify", identify, verifyWallet);
router.post("/google/signin", googleSignin);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/request-verification", protect, requestEmailVerification);
router.get("/verify-email", verifyEmail);
export default router;

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new player
 *     tags:
 *       - Auth
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
 *       - Auth
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

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out the current player
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Player logged out successfully
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
 *                   example: Logged out successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/wallet/nonce:
 *   post:
 *     summary: Generate a wallet signature nonce
 *     tags:
 *       - Wallet Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 example: Use Your own !!!
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     nonce:
 *                       type: string
 *                       example: a1b2c3d4e5f6
 *                     message:
 *                       type: string
 *                       example: Welcome to Cephi! Sign this message to verify ownership...
 *       400:
 *         description: Invalid wallet address
 */

/**
 * @swagger
 * /api/v1/auth/wallet/verify:
 *   post:
 *     summary: Verify wallet signature and link/login player
 *     tags:
 *       - Wallet Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signature
 *             properties:
 *               address:
 *                 type: string
 *                 example: Use your own !!!
 *               signature:
 *                 type: string
 *                 example: 0xabcdef1234567890...
 *     responses:
 *       200:
 *         description: Wallet verified successfully
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
 *                   example: Wallet verified successfully
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
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Invalid signature or nonce
 *       409:
 *         description: Wallet already linked to another account
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Sign in or register a player using Google ID token
 *     tags:
 *       - Google Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *                 example: use yours from your google auth playground
 *     responses:
 *       200:
 *         description: Google authentication successful
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
 *                   example: Successfully logged in with google
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
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Invalid Google token data
 *       500:
 *         description: Server error while processing Google authentication
 */

/**
 * @swagger
 * /api/v1/auth/request-reset:
 *   post:
 *     summary: Request password reset link
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent if account exists
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
 *                   example: If an account with a password exists, a reset link has been sent 🫰.
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags:
 *       - Password Reset
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: Password updated successfully! You can now log in with your new credentials.
 *       400:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/request-verification:
 *   get:
 *     summary: Request email verification link
 *     tags:
 *       - Email Verification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: Verification mail sent successfully.
 *       400:
 *         description: Cannot send verification mail (e.g. wallet user)
 *       401:
 *         description: Unauthorized – user not authenticated
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     summary: Verify user email using token
 *     tags:
 *       - Email Verification
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *         example: 3f9c2a8e5d7b4c1a9e0f
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: Email verified successfully! You can now access Cephi.
 *       400:
 *         description: Invalid, expired, or missing token
 *       422:
 *         description: Validation error (invalid token format)
 *       500:
 *         description: Server error
 */
