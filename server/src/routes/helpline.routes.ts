import { Router } from "express";
import { getHelplines, createHelpline, updateHelpline } from "../controllers/helpline.controller";
import { requireAdmin } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", getHelplines);
router.post("/", requireAdmin, createHelpline);
router.put("/:id", requireAdmin, updateHelpline);
export default router;
