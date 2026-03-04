import { Router } from "express";
import { getAdvisories, getCategories, createAdvisory } from "../controllers/advisory.controller";
import { requireAdmin } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", getAdvisories);
router.get("/categories", getCategories);
router.post("/", requireAdmin, createAdvisory);
export default router;
