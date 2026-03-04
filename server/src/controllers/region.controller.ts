import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

// GET /api/regions
export const getRegions = async (req: Request, res: Response) => {
    try {
        const regions = await prisma.region.findMany();
        res.json(regions);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch regions" });
    }
};
