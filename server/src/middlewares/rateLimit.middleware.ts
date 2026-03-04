import { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter
const requestCounts: Record<string, { count: number; resetAt: number }> = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute per IP

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();

    if (!requestCounts[ip] || now > requestCounts[ip].resetAt) {
        requestCounts[ip] = { count: 1, resetAt: now + WINDOW_MS };
        return next();
    }

    requestCounts[ip].count++;
    if (requestCounts[ip].count > MAX_REQUESTS) {
        return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    next();
};
