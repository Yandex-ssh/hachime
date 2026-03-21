"use client";

import { useEffect, useMemo, useState } from "react";

type Trend = {
    id: number;
    title: string;
    icon: string | null;
    growth: string | null;
    demandLevel: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    description: string | null;
    topRoles: string[];
    topSkills: string[];
    companies: string[];
    insight: string | null;
    year: number | null;
};

type Snapshot = { year: number; active_trends: number };

const colorMap: Record<string, { badge: string; border: string; tag: string; bar: string }> = {
    indigo: { badge: "bg-indigo-500/20 text-indigo-300", border: "border-indigo-500/30", tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20", bar: "bg-indigo-500" },
    red: { badge: "bg-red-500/20 text-red-300", border: "border-red-500/30", tag: "bg-red-500/10 text-red-300 border-red-500/20", bar: "bg-red-500" },
    blue: { badge: "bg-blue-500/20 text-blue-300", border: "border-blue-500/30", tag: "bg-blue-500/10 text-blue-300 border-blue-500/20", bar: "bg-blue-500" },
    violet: { badge: "bg-violet-500/20 text-violet-300", border: "border-violet-500/30", tag: "bg-violet-500/10 text-violet-300 border-violet-500/20", bar: "bg-violet-500" },
    cyan: { badge: "bg-cyan-500/20 text-cyan-300", border: "border-cyan-500/30", tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20", bar: "bg-cyan-500" },
};

const demandWidth: Record<string, string> = {
    "Very High": "w-full",
    "High": "w-3/4",
    "Medium": "w-1/2",
    "Low": "w-1/4",
};

export default function TrendsPage() {
    const [selected, setSelected] = useState<string | null>(null);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const [trendsRes, snapRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/trends`),
                    fetch(`${apiBaseUrl}/trends/snapshot`),
                ]);
                const trendsJson = await trendsRes.json();
                const snapJson = await snapRes.json();
                if (!trendsRes.ok) throw new Error(trendsJson.message || "Failed to load trends");
                if (!snapRes.ok) throw new Error(snapJson.message || "Failed to load market snapshot");
                setTrends(trendsJson);
                setSnapshot(snapJson);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load trends");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiBaseUrl]);

    const selectedTrend = useMemo(() => {
        const id = selected ? Number(selected) : null;
        if (!id) return undefined;
        return trends.find((t) => t.id === id);
    }, [selected, trends]);

    const colorFor = (t: Trend) => {
        const title = t.title.toLowerCase();
        if (title.includes("cyber")) return "red";
        if (title.includes("cloud")) return "blue";
        if (title.includes("web") || title.includes("mobile")) return "violet";
        if (title.includes("data")) return "cyan";
        return "indigo";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Industry Trends</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Stay ahead — see what the tech industry is demanding right now in the Philippines.
                </p>
            </div>

            {/* Market snapshot */}
            <div className="bg-gradient-to-br from-indigo-600/20 via-indigo-600/5 to-gray-900 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📈</span>
                    <h3 className="text-white font-bold">Philippine IT Job Market Snapshot — {snapshot?.year ?? new Date().getFullYear()}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active trends tracked", value: snapshot ? String(snapshot.active_trends) : "—", sub: "In the database" },
                        { label: "Data source", value: "Internal", sub: "Admin-managed" },
                        { label: "Updates", value: "Ongoing", sub: "As trends evolve" },
                        { label: "Coverage", value: "PH market", sub: "General snapshot" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-900/60 rounded-xl p-3 border border-gray-800">
                            <p className="text-white font-bold text-lg">{stat.value}</p>
                            <p className="text-gray-400 text-xs">{stat.label}</p>
                            <p className="text-gray-600 text-xs">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Loading trends...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* Trend cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trends.map((trend) => {
                    const color = colorFor(trend);
                    const c = colorMap[color];
                    const isActive = selected === String(trend.id);
                    const salaryRange =
                        trend.salaryMin != null && trend.salaryMax != null
                            ? `₱${trend.salaryMin.toLocaleString()} – ₱${trend.salaryMax.toLocaleString()}/mo`
                            : "Salary range unavailable";
                    return (
                        <button
                            key={trend.id}
                            onClick={() => setSelected(isActive ? null : String(trend.id))}
                            className={`text-left bg-gray-900 border rounded-2xl p-5 transition-all hover:scale-[1.01]
                ${isActive ? `${c.border} ring-1 ring-inset` : "border-gray-800 hover:border-gray-700"}
              `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl ${c.tag}`}>
                                        {trend.icon ?? "📌"}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{trend.title}</h4>
                                        <p className="text-gray-500 text-xs">{salaryRange}</p>
                                    </div>
                                </div>
                                <span className="text-green-400 font-bold text-sm">{trend.growth ?? "—"}</span>
                            </div>

                            {/* Demand bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500">Market Demand</span>
                                    <span className={`font-medium ${c.badge.split(" ")[1]}`}>{trend.demandLevel ?? "—"}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${c.bar} ${demandWidth[trend.demandLevel ?? "Low"]}`} />
                                </div>
                            </div>

                            <p className="text-gray-400 text-xs">{trend.description ?? "—"}</p>

                            <div className="mt-3 text-xs text-gray-600 text-right">
                                {isActive ? "▲ Hide details" : "▼ See details"}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Detail panel */}
            {selectedTrend && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-6">
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-800">
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${colorMap[colorFor(selectedTrend)].tag}`}>
                            {selectedTrend.icon ?? "📌"}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-xl">{selectedTrend.title}</h3>
                            <p className="text-gray-400 text-sm">
                                {selectedTrend.salaryMin != null && selectedTrend.salaryMax != null
                                    ? `₱${selectedTrend.salaryMin.toLocaleString()} – ₱${selectedTrend.salaryMax.toLocaleString()}/mo`
                                    : "Salary range unavailable"}
                                {selectedTrend.growth ? <> · <span className="text-green-400">{selectedTrend.growth} growth</span></> : null}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Roles */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">💼 Top Job Roles</h4>
                            <div className="flex flex-col gap-2">
                                {selectedTrend.topRoles.map((role) => (
                                    <div key={role} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${colorMap[colorFor(selectedTrend)].bar}`} />
                                        <span className="text-gray-300 text-sm">{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Skills */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">⚡ In-Demand Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedTrend.topSkills.map((skill) => (
                                    <span key={skill} className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[colorFor(selectedTrend)].tag}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Companies */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-3">🏢 Companies Hiring in PH</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedTrend.companies.map((company) => (
                                <span key={company} className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-3 py-1.5 rounded-full">
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                        <span className="text-xl">💡</span>
                        <div>
                            <p className="text-indigo-300 text-xs font-semibold mb-1">Industry Insight</p>
                            <p className="text-gray-300 text-sm">{selectedTrend.insight ?? "—"}</p>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !selected && (
                <div className="text-center py-6 text-gray-600 text-sm">
                    👆 Click any trend card to see full details
                </div>
            )}
        </div>
    );
}