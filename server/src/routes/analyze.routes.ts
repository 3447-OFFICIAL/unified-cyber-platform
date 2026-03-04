import { Router } from "express";
import { analyzeScam } from "../controllers/analyze.controller";

const router = Router();

router.post("/", analyzeScam);

export default router;
