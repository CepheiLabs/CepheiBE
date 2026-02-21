import { Router } from "express";
import { getMe } from "../controllers/playerController";
import { protect } from "../middlewares/authHandler";

const router = Router();

router.get("/me", protect, getMe);

export default router;
