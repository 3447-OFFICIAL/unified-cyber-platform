import { Router } from "express";
import { adminLogin } from "../middlewares/auth.middleware";
const router = Router();
router.post("/login", adminLogin);
export default router;
