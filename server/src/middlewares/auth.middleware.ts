import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AdminRequest extends Request {
    admin?: { username: string };
}

// Middleware: Verify JWT token for admin routes
export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
        req.admin = decoded;
        next();
    } catch (e) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

// POST /api/admin/login
export const adminLogin = (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Simple hardcoded admin for demo — replace with DB lookup in production
    const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "cyber@admin123";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "8h" });
        return res.json({ token, message: "Login successful" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
};
