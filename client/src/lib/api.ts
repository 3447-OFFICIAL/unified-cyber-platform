// src/lib/api.ts – Centralized API utilities
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Intercept to attach JWT token if available
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Region {
    id: string;
    name: string;
    code: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Article {
    id: string;
    title: string;
    content: string;
    sourceUrl: string;
    publishDate: string;
    region: Region;
    category: Category;
}

export interface Helpline {
    id: string;
    name: string;
    purpose: string;
    contact: string;
    availability: string;
    region: Region;
}

export interface CyberPortal {
    id: string;
    crimeType: string;
    portalName: string;
    description: string;
    officialUrl: string;
    region: Region;
}

export interface DashboardStats {
    latestAdvisories: Article[];
    latestNews: Article[];
    helplineCount: number;
    portalCount: number;
    categoryStats: { name: string; count: number }[];
    resourceCountPerRegion: {
        id: string;
        name: string;
        code: string;
        _count: { articles: number; helplines: number; cyberPortals: number };
    }[];
}
