"use client";

import { useEffect, useMemo, useState } from "react";

type RoadmapStep = {
    year_level: number;
    progress: { completed: number; total: number; percent: number };
    subjects: Array<{ subject_id: number; subject_name: string; semester: number | null; completed: boolean }>;
};

type PathwayResponse = {
    target_career: {
        career_id: number;
        title: string;
        icon: string | null;
        description: string | null;
        growth_rate: string | null;
        demand_level: string | null;
        job_examples: string[];
        salary_range: { min: number; max: number } | null;
        salary_by_experience: {
            entry: { min: number; max: number };
            mid: { min: number; max: number };
            senior: { min: number; max: number };
        } | null;
        skills: string[];
    } | null;
    roadmap: RoadmapStep[];
    gap?: { missing_subjects: { subject_id: number; subject_name: string }[] };
    message?: string;
};

// ─── COLOR MAPS ───────────────────────────────────────────────────────────────
const colorMap: Record<string, { card: string; badge: string; bar: string; tag: string; timeline: string; dot: string }> = {
    indigo: {
        card: "border-indigo-500/40 ring-1 ring-indigo-500/20",
        badge: "bg-indigo-500/20 text-indigo-300",
        bar: "bg-indigo-500",
        tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
        timeline: "border-indigo-500/30",
        dot: "bg-indigo-500",
    },
    cyan: {
        card: "border-cyan-500/40 ring-1 ring-cyan-500/20",
        badge: "bg-cyan-500/20 text-cyan-300",
        bar: "bg-cyan-500",
        tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
        timeline: "border-cyan-500/30",
        dot: "bg-cyan-500",
    },
    violet: {
        card: "border-violet-500/40 ring-1 ring-violet-500/20",
        badge: "bg-violet-500/20 text-violet-300",
        bar: "bg-violet-500",
        tag: "bg-violet-500/10 text-violet-300 border-violet-500/20",
        timeline: "border-violet-500/30",
        dot: "bg-violet-500",
    },
    blue: {
        card: "border-blue-500/40 ring-1 ring-blue-500/20",
        badge: "bg-blue-500/20 text-blue-300",
        bar: "bg-blue-500",
        tag: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        timeline: "border-blue-500/30",
        dot: "bg-blue-500",
    },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function CareerPathwayPage() {
    const [data, setData] = useState<PathwayResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) {
                    setData({ target_career: null, roadmap: [], message: "Please login to see your roadmap." });
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${apiBaseUrl}/students/me/pathway`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Failed to load pathway");
                setData(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load pathway");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [apiBaseUrl]);

    const selectedCareer = data?.target_career ?? null;
    const themeColor = useMemo(() => {
        if (!selectedCareer) return "indigo";
        const title = selectedCareer.title.toLowerCase();
        if (title.includes("data")) return "cyan";
        if (title.includes("web")) return "violet";
        if (title.includes("network")) return "blue";
        return "indigo";
    }, [selectedCareer]);

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Career Pathways</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {selectedCareer
                        ? <>Your personalized roadmap for <span className="text-indigo-300 font-medium">{selectedCareer.icon} {selectedCareer.title}</span>.</>
                        : (data?.message ?? "Set a career goal in Profile to generate a roadmap.")}
                </p>
            </div>

            {loading && (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Loading pathway...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* ── DETAILED ROADMAP ── */}
            {!loading && selectedCareer && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-8">
                    {/* Career header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${colorMap[themeColor].tag}`}>
                                {selectedCareer.icon ?? "🎯"}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">{selectedCareer.title}</h3>
                                <p className="text-gray-400 text-sm">
                                    {selectedCareer.salary_range
                                        ? `₱${selectedCareer.salary_range.min.toLocaleString()} – ₱${selectedCareer.salary_range.max.toLocaleString()}/mo`
                                        : "Salary range unavailable"}
                                    {selectedCareer.growth_rate ? <> · <span className="text-green-400">{selectedCareer.growth_rate} growth</span></> : null}
                                </p>
                            </div>
                        </div>
                        <span className={`text-sm font-bold px-4 py-2 rounded-full self-start ${colorMap[themeColor].badge}`}>
                            {selectedCareer.demand_level ?? "Demand"} demand
                        </span>
                    </div>

                    {/* Skills + Jobs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Skills */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">⚡ Skills You Need</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedCareer.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[themeColor].tag}`}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Job Examples */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">💼 Job Examples</h4>
                            <div className="flex flex-wrap gap-2">
                                {(selectedCareer.job_examples ?? []).map((job) => (
                                    <span
                                        key={job}
                                        className="text-xs px-3 py-1.5 rounded-full border bg-gray-800 border-gray-700 text-gray-300"
                                    >
                                        {job}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Roadmap */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-6">🗺️ Your Year-by-Year Roadmap</h4>
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />

                            <div className="space-y-8">
                                {(data?.roadmap ?? []).map((step, index) => (
                                    <div key={step.year_level} className="relative flex gap-6 pl-12">
                                        {/* Dot */}
                                        <div className={`absolute left-0 w-9 h-9 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colorMap[themeColor].dot}`}>
                                            {index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 bg-gray-800/50 border rounded-xl p-4 ${index === 0 ? colorMap[themeColor].timeline : "border-gray-700/50"}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-semibold ${colorMap[themeColor].badge} px-2 py-0.5 rounded-full`}>
                                                    {step.year_level}{step.year_level === 1 ? "st" : step.year_level === 2 ? "nd" : step.year_level === 3 ? "rd" : "th"} Year
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {step.progress.completed}/{step.progress.total} completed
                                                </span>
                                            </div>

                                            {/* Subjects */}
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {step.subjects.map((s) => (
                                                    <span
                                                        key={s.subject_id}
                                                        className={`text-xs px-2 py-0.5 rounded-md border ${s.completed ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-gray-700/50 text-gray-300 border-gray-700"}`}
                                                    >
                                                        {s.subject_name}
                                                    </span>
                                                ))}
                                            </div>

                                            {data?.gap && data.gap.missing_subjects.length > 0 && index === (data.roadmap.length - 1) && (
                                                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
                                                    <span className="text-yellow-400 text-xs">🎯</span>
                                                    <span className="text-gray-300 text-xs">
                                                        Finish remaining key subjects to close your gap.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && !selectedCareer && (
                <div className="text-center py-10 text-gray-600 text-sm">
                    👆 Set your career goal in Profile to see your roadmap
                </div>
            )}
        </div>
    );
}