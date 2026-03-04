import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

// GET /api/portals?regionCode=IN&crimeType=phishing
export const getPortals = async (req: Request, res: Response) => {
    try {
        const { regionCode, crimeType } = req.query;
        const where: any = {};
        if (regionCode) {
            const region = await prisma.region.findUnique({ where: { code: String(regionCode) } });
            if (!region) return res.status(404).json({ error: "Region not found" });
            where.regionId = region.id;
        }
        if (crimeType) where.crimeType = { contains: String(crimeType), mode: "insensitive" };

        const portals = await prisma.cyberPortal.findMany({ where, include: { region: true } });
        res.json(portals);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch portals" });
    }
};

// POST /api/portals (admin only)
export const createPortal = async (req: Request, res: Response) => {
    try {
        const { crimeType, portalName, description, officialUrl, regionCode } = req.body;
        const region = await prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) return res.status(404).json({ error: "Region not found" });
        const portal = await prisma.cyberPortal.create({
            data: { crimeType, portalName, description, officialUrl, regionId: region.id },
        });
        res.status(201).json(portal);
    } catch (e) {
        res.status(500).json({ error: "Failed to create portal" });
    }
};
