import { Router } from "express";
import { getMe, updateUsername } from "../controllers/playerController";
import { protect } from "../middlewares/authHandler";

const router = Router();

router.get("/me", protect, getMe);
router.patch("/update-username", protect, updateUsername);

export default router;
