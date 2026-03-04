import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Routes
import regionRoutes from "./routes/region.routes";
import advisoryRoutes from "./routes/advisory.routes";
import helplineRoutes from "./routes/helpline.routes";
import portalRoutes from "./routes/portal.routes";
import chatRoutes from "./routes/chat.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminRoutes from "./routes/admin.routes";
import analyzeRoutes from "./routes/analyze.routes";
import { rateLimiter } from "./middlewares/rateLimit.middleware";
import { startScheduler } from "./services/scheduler.service";

const app: Express = express();
const port = process.env.PORT || 5000;

// Global Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(rateLimiter);

// API Routes
app.use("/api/regions", regionRoutes);
app.use("/api/advisories", advisoryRoutes);
app.use("/api/helplines", helplineRoutes);
app.use("/api/portals", portalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analyze", analyzeRoutes);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start background scheduler
startScheduler();

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
