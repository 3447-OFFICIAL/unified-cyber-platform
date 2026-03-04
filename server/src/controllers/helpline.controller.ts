import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

// GET /api/helplines?regionCode=IN
export const getHelplines = async (req: Request, res: Response) => {
    try {
        const { regionCode } = req.query;
        const where: any = {};
        if (regionCode) {
            const region = await prisma.region.findUnique({ where: { code: String(regionCode) } });
            if (!region) return res.status(404).json({ error: "Region not found" });
            where.regionId = region.id;
        }
        const helplines = await prisma.helpline.findMany({ where, include: { region: true } });
        res.json(helplines);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch helplines" });
    }
};

// POST /api/helplines (admin only)
export const createHelpline = async (req: Request, res: Response) => {
    try {
        const { name, purpose, contact, availability, regionCode } = req.body;
        const region = await prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) return res.status(404).json({ error: "Region not found" });
        const helpline = await prisma.helpline.create({
            data: { name, purpose, contact, availability, regionId: region.id },
        });
        res.status(201).json(helpline);
    } catch (e) {
        res.status(500).json({ error: "Failed to create helpline" });
    }
};

// PUT /api/helplines/:id (admin only)
export const updateHelpline = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.helpline.update({ where: { id }, data });
        // Log the update
        await prisma.updateLog.create({
            data: {
                entityType: "Helpline",
                entityId: id,
                changes: JSON.stringify(data),
                helplineId: id,
            },
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: "Failed to update helpline" });
    }
};
