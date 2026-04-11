"use client";

import { useEffect, useMemo, useState } from "react";

type AlumniCard = {
    id: number;
    name: string;
    program: string | null;
    batch: string | null;
    graduatedYear: number | null;
    currentRole: string | null;
    company: string | null;
    location: string | null;
    salary: string | null;
    monthsToLand: number | null;
    favoriteSubjects: string[];
    skills: string[];
    internships: Array<{ role_title?: string; company_name?: string; location?: string; year?: number }>;
    advice: string | null;
    linkedin: string | null;
};

type AlumniStats = {
    total_alumni: number;
    avg_months_to_land_job: number | null;
    hired_in_6_months_percent: number;
    companies: number;
};

const colorMap: Record<string, { avatar: string; badge: string; border: string; tag: string }> = {
    indigo: { avatar: "bg-indigo-600 text-white", badge: "bg-indigo-500/20 text-indigo-300", border: "border-indigo-500/30", tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
    cyan: { avatar: "bg-cyan-600 text-white", badge: "bg-cyan-500/20 text-cyan-300", border: "border-cyan-500/30", tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
    blue: { avatar: "bg-blue-600 text-white", badge: "bg-blue-500/20 text-blue-300", border: "border-blue-500/30", tag: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    violet: { avatar: "bg-violet-600 text-white", badge: "bg-violet-500/20 text-violet-300", border: "border-violet-500/30", tag: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
};

export default function AlumniTracksPage() {
    const [programFilter, setProgramFilter] = useState("All");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [alumni, setAlumni] = useState<AlumniCard[]>([]);
    const [stats, setStats] = useState<AlumniStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const [cardsRes, statsRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/alumni?program=${encodeURIComponent(programFilter)}`),
                    fetch(`${apiBaseUrl}/alumni/stats`),
                ]);
                const cardsJson = await cardsRes.json();
                const statsJson = await statsRes.json();
                if (!cardsRes.ok) throw new Error(cardsJson.message || "Failed to load alumni");
                if (!statsRes.ok) throw new Error(statsJson.message || "Failed to load alumni stats");
                setAlumni(cardsJson);
                setStats(statsJson);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load alumni");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [apiBaseUrl, programFilter]);

    const filtered = alumni;

    const programs = useMemo(() => ["All", "BSIT", "BSCRIM", "BSED", "BSOA", "BSPOL.SCI"], []);

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Alumni Tracks</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Real career journeys of TMC graduates — see where your path could lead.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "TMC Alumni", value: stats ? String(stats.total_alumni) : "—", color: "text-white", bg: "bg-gray-800 border-gray-700" },
                    { label: "Avg. time to hire", value: stats?.avg_months_to_land_job != null ? `${stats.avg_months_to_land_job} mos` : "—", color: "text-green-400", bg: "bg-green-500/5 border-green-500/20" },
                    { label: "Hired in 6 mos", value: stats ? `${stats.hired_in_6_months_percent}%` : "—", color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/20" },
                    { label: "Companies", value: stats ? String(stats.companies) : "—", color: "text-cyan-400", bg: "bg-cyan-500/5 border-cyan-500/20" },
                ].map((s) => (
                    <div key={s.label} className={`border rounded-2xl p-4 ${s.bg}`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {programs.map((p) => (
                    <button
                        key={p}
                        onClick={() => setProgramFilter(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition border
              ${programFilter === p
                                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Loading alumni...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* Alumni Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!loading && filtered.length === 0 && (
                    <div className="md:col-span-2 text-center py-10 text-gray-600 text-sm border border-gray-800 rounded-2xl bg-gray-900">
                        No alumni found for this program yet.
                    </div>
                )}
                {filtered.map((person, idx) => {
                    const palette = ["indigo", "cyan", "blue", "violet"] as const;
                    const c = colorMap[palette[idx % palette.length]];
                    const isExpanded = expanded === person.id;
                    return (
                        <div
                            key={person.id}
                            className={`bg-gray-900 border rounded-2xl p-5 transition-all
                ${isExpanded ? `${c.border} ring-1 ring-inset` : "border-gray-800 hover:border-gray-700"}
              `}
                        >
                            {/* Profile */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${c.avatar}`}>
                                    {(person.name || "?").split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-white font-semibold">{person.name}</h4>
                                            <p className="text-gray-400 text-xs">{person.currentRole ?? "—"} · {person.company ?? "—"}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
                                            {(person.program ?? "—")} {person.batch ? `'${person.batch}` : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick info */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                    📍 {person.location ?? "—"}
                                </span>
                                {person.salary && (
                                    <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full">
                                        💰 {person.salary}
                                    </span>
                                )}
                                <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                    ⚡ {person.monthsToLand != null ? `${person.monthsToLand} months to land job` : "—"}
                                </span>
                            </div>

                            {/* Expand toggle */}
                            <button
                                onClick={() => setExpanded(isExpanded ? null : person.id)}
                                className="w-full text-xs text-gray-500 hover:text-indigo-400 transition text-center py-1"
                            >
                                {isExpanded ? "▲ Show less" : "▼ See full story"}
                            </button>

                            {/* Expanded content */}
                            {isExpanded && (
                                <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
                                    {/* Graduation + internships */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                                            <p className="text-gray-500 text-xs mb-1">🎓 Graduated</p>
                                            <p className="text-gray-200 text-sm">{person.graduatedYear ?? "—"}</p>
                                        </div>
                                        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                                            <p className="text-gray-500 text-xs mb-1">🧑‍💼 Internship experience</p>
                                            {(person.internships ?? []).length === 0 ? (
                                                <p className="text-gray-500 text-sm">—</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {(person.internships ?? []).slice(0, 3).map((it, i) => (
                                                        <p key={i} className="text-gray-300 text-sm">
                                                            {(it.role_title ?? "Intern")} · {(it.company_name ?? "—")}
                                                            {it.location ? <span className="text-gray-500"> · {it.location}</span> : null}
                                                            {it.year ? <span className="text-gray-500"> · {it.year}</span> : null}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <p className="text-gray-500 text-xs mb-2">Skills they use daily:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(person.skills ?? []).map((skill) => (
                                                <span key={skill} className={`text-xs px-2.5 py-1 rounded-full border ${c.tag}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Favorite subjects */}
                                    <div>
                                        <p className="text-gray-500 text-xs mb-2">Subjects that helped most:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(person.favoriteSubjects ?? []).map((subject) => (
                                                <span key={subject} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advice */}
                                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                        <p className="text-gray-500 text-xs mb-1">💬 Story from this alumni:</p>
                                        <p className="text-gray-300 text-sm italic">{person.advice ? `"${person.advice}"` : "—"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}