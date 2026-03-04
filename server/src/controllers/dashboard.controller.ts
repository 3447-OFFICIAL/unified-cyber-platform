import { Request, Response } from "express";
import { prisma } from "../services/prisma.service";

// GET /api/dashboard/stats?regionCode=IN
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { regionCode } = req.query;
        let regionFilter: any = {};

        if (regionCode) {
            const region = await prisma.region.findUnique({ where: { code: String(regionCode) } });
            if (region) regionFilter = { regionId: region.id };
        }

        // Efficiently fetch data for precisely the two requested sections
        const [latestAdvisories, latestNews, helplineCount, portalCount, articlesByCategory] = await Promise.all([
            // 1. Advisories Section
            prisma.article.findMany({
                where: { ...regionFilter, category: { name: "Advisories" } },
                orderBy: { publishDate: "desc" },
                take: 5,
                include: { region: true, category: true },
            }),
            // 2. Cyber News Section
            prisma.article.findMany({
                where: { ...regionFilter, category: { name: "Cyber News" } },
                orderBy: { publishDate: "desc" },
                take: 5,
                include: { region: true, category: true },
            }),
            prisma.helpline.count({ where: regionFilter }),
            prisma.cyberPortal.count({ where: regionFilter }),
            prisma.category.findMany({
                include: {
                    articles: {
                        where: regionFilter,
                    },
                },
            }),
        ]);

        const categoryStats = articlesByCategory.map((cat) => ({
            name: cat.name,
            count: cat.articles.length,
        }));

        const resourceCountPerRegion = await prisma.region.findMany({
            include: {
                _count: {
                    select: { articles: true, helplines: true, cyberPortals: true },
                },
            },
        });

        res.json({
            latestAdvisories,
            latestNews,
            helplineCount,
            portalCount,
            categoryStats,
            bitacora: "UCRIP Tactical Intel Engine v2.0",
            resourceCountPerRegion,
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
