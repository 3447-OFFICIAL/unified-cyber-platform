import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

// GET /api/advisories?regionCode=IN&categoryId=...&limit=10
export const getAdvisories = async (req: Request, res: Response) => {
    try {
        const { regionCode, categoryId, limit, year } = req.query;
        const where: any = {};
        if (regionCode) {
            const region = await prisma.region.findUnique({ where: { code: String(regionCode) } });
            if (!region) return res.status(404).json({ error: "Region not found" });
            where.regionId = region.id;
        }
        if (categoryId) where.categoryId = String(categoryId);
        if (year) {
            const startOfYear = new Date(parseInt(String(year)), 0, 1);
            const endOfYear = new Date(parseInt(String(year)), 11, 31, 23, 59, 59, 999);
            where.publishDate = {
                gte: startOfYear,
                lte: endOfYear
            };
            console.log("Filtering by year:", year, startOfYear, endOfYear);
        }

        console.log("WHERE CLAUSE:", JSON.stringify(where, null, 2));

        const articles = await prisma.article.findMany({
            where,
            orderBy: { publishDate: "desc" },
            take: limit ? parseInt(String(limit)) : 20,
            include: { region: true, category: true },
        });
        res.json(articles);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch advisories" });
    }
};

// GET /api/advisories/categories
export const getCategories = async (req: Request, res: Response) => {
    try {
        const cats = await prisma.category.findMany();
        res.json(cats);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

// POST /api/advisories (admin only - add article manually)
export const createAdvisory = async (req: Request, res: Response) => {
    try {
        const { title, content, sourceUrl, regionCode, categoryId } = req.body;
        const region = await prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) return res.status(404).json({ error: "Region not found" });

        const article = await prisma.article.create({
            data: { title, content, sourceUrl, regionId: region.id, categoryId },
        });
        res.status(201).json(article);
    } catch (e) {
        res.status(500).json({ error: "Failed to create advisory" });
    }
};
