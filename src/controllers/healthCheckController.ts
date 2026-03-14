import type { Request, Response } from "express";
import handleAsync from "express-async-handler";
import * as healthService from "../services/healthService";
import { version } from "../../package.json";

const getSystemMeta = () => {
  const uptimeSeconds = Math.floor(process.uptime());
  const memory = process.memoryUsage();

  // bytes to MB
  const usedMemoryMb = Math.round(memory.heapUsed / 1024 / 1024);
  const totalMemoryMb = Math.round(memory.heapTotal / 1024 / 1024);

  // Calculate percentage
  const percentUsed = Math.round((usedMemoryMb / totalMemoryMb) * 100);

  return {
    version: version,
    uptime: `${uptimeSeconds}s`,
    resources: {
      memory: {
        used: `${usedMemoryMb}MB`,
        percentUsed: `${percentUsed}%`,
      },
    },
  };
};

const getHealth = handleAsync(async (req: Request, res: Response) => {
  const [postgres, redis] = await Promise.all([
    healthService.checkPostgres(),
    healthService.checkRedis(),
  ]);

  const isSystemHealthy = postgres.status === "up" && redis.status === "up";

  res.status(isSystemHealthy ? 200 : 503).json({
    status: isSystemHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    meta: getSystemMeta(),
    checks: {
      postgres,
      redis,
    },
  });
});

export default getHealth;
