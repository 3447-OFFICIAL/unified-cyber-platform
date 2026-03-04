import { Router } from "express";
import { getPortals, createPortal } from "../controllers/portal.controller";
import { requireAdmin } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", getPortals);
router.post("/", requireAdmin, createPortal);
export default router;
