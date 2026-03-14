import express from "express";
import getHealth from "../controllers/healthCheckController";

const router = express.Router();

router.get("/", getHealth);

export default router;

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Get system health status
 *     description: Returns the connectivity status of Postgres, Redis, Blockchain sync, and system resources.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-14T19:35:00Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.2"
 *                     uptime:
 *                       type: string
 *                       example: "3600s"
 *                     resources:
 *                       type: object
 *                       properties:
 *                         memory:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: string
 *                               example: "256MB"
 *                             percentUsed:
 *                               type: string
 *                               example: "45%"
 *                 checks:
 *                   type: object
 *                   properties:
 *                     postgres:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         latency:
 *                           type: string
 *                           example: 5ms
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *
 *
 *       503:
 *         description: System is degraded or down
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: degraded
 *                 checks:
 *                   type: object
 *                   properties:
 *                     postgres:
 *                       $ref: '#/components/schemas/HealthCheckDetail'
 */
