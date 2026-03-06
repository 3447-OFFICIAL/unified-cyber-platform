"use client";
import { useState, useEffect } from "react";
import { api, Article, Category } from "@/lib/api";

const categoryBadge: Record<string, string> = {
    "Advisories": "badge-red",
    "Cyber News": "badge-blue",
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdvisoriesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCat, setSelectedCat] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState("IN");

    const fetchArticles = (code: string, catId: string, year: string) => {
        setLoading(true);
        const params = new URLSearchParams({ regionCode: code, limit: "50" }); // Increase limit to show more historical data
        if (catId) params.set("categoryId", catId);
        if (year) params.set("year", year);
        api.get(`/advisories?${params}`).then(r => setArticles(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        // Fetch categories only once on mount
        if (categories.length === 0) {
            api.get("/advisories/categories").then(r => {
                const validCategories = r.data.filter((c: Category) =>
                    c.name !== "Cybercrime Cases" && c.name !== "Educational"
                );
                setCategories(validCategories);
            });
        }

        const code = localStorage.getItem("selectedRegionCode") || "IN";
        setRegion(code);

        // Use the actual selected filters here!
        fetchArticles(code, selectedCat, selectedYear);

        const handler = (e: Event) => {
            const code = (e as CustomEvent).detail;
            setRegion(code);
            fetchArticles(code, selectedCat, selectedYear);
        };
        window.addEventListener("regionChanged", handler);
        return () => window.removeEventListener("regionChanged", handler);
    }, [selectedCat, selectedYear]);

    const handleCatChange = (catId: string) => {
        setSelectedCat(catId);
        fetchArticles(region, catId, selectedYear);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = e.target.value;
        setSelectedYear(year);
        fetchArticles(region, selectedCat, year);
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="section-title" style={{ marginBottom: 6 }}>📡 Intelligence Feed</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Official government advisories and the latest global cyber security news
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 15, marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                        className={`btn-ghost ${!selectedCat ? "btn-primary" : ""}`}
                        onClick={() => handleCatChange("")}
                        style={{ padding: "0.5rem 1.2rem", borderRadius: 12 }}
                    >
                        Total Feed
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => handleCatChange(c.id)}
                            style={{
                                padding: "0.5rem 1.2rem", borderRadius: 12, border: "1px solid",
                                borderColor: selectedCat === c.id ? "var(--accent)" : "var(--border)",
                                background: selectedCat === c.id ? "rgba(37, 140, 244, 0.15)" : "transparent",
                                color: selectedCat === c.id ? "var(--accent)" : "var(--text-muted)",
                                cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, transition: "all 0.3s ease",
                                letterSpacing: "0.05em", textTransform: "uppercase"
                            }}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Year:</span>
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        style={{
                            background: "rgba(30, 58, 95, 0.2)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                            padding: "8px 14px",
                            borderRadius: 10,
                            outline: "none",
                            fontSize: "0.9rem",
                            cursor: "pointer"
                        }}
                    >
                        <option value="">All Time</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                    </select>
                </div>
            </div>

            {
                loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160 }} />)}
                    </div>
                ) : articles.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                        No articles found for selected region/category.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                        {articles.map(a => (
                            <article key={a.id} className="card fade-in" style={{ cursor: "pointer" }}
                                onClick={() => window.open(a.sourceUrl, "_blank")}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <span className={`badge ${categoryBadge[a.category?.name] || "badge-blue"}`}>
                                        {a.category?.name}
                                    </span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{formatDate(a.publishDate)}</span>
                                </div>
                                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: 8 }}>
                                    {a.title}
                                </h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                                    {a.content.substring(0, 140)}...
                                </p>
                                <div style={{ marginTop: 14, fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>
                                    Visit Official Site →
                                </div>
                            </article>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
