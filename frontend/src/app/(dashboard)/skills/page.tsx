"use client";

import { useEffect, useMemo, useState } from "react";

type ApiSkill = {
    name: string;
    level: "None" | "Beginner" | "Intermediate" | "Advanced";
    priority: "low" | "medium" | "high" | null;
    resource: string | null;
    expanded_skills?: Array<{ name: string; url?: string }> | null;
};

type ApiCategory = {
    id: string;
    label: string;
    icon: string;
    skills: ApiSkill[];
};

type SkillsResponse = {
    target_career: { title: string; icon: string | null } | null;
    derived_level: "None" | "Beginner" | "Intermediate" | "Advanced";
    categories: ApiCategory[];
    gap?: { missing_subjects: { subject_id: number; subject_name: string }[] };
    message?: string;
};

const levelColors: Record<string, string> = {
    None: "bg-red-500/10 text-red-400 border-red-500/20",
    Beginner: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Advanced: "bg-green-500/10 text-green-400 border-green-500/20",
};

const levelBar: Record<string, string> = {
    None: "w-0",
    Beginner: "w-1/4",
    Intermediate: "w-2/4",
    Advanced: "w-full",
};

const levelBarColor: Record<string, string> = {
    None: "bg-red-500",
    Beginner: "bg-yellow-500",
    Intermediate: "bg-blue-500",
    Advanced: "bg-green-500",
};

const priorityColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-green-500/10 text-green-400 border-green-500/20",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function SkillsPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [data, setData] = useState<SkillsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) {
                    setData({
                        target_career: null,
                        derived_level: "None",
                        categories: [],
                        message: "Please login to see your personalized skills.",
                    });
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${apiBaseUrl}/students/me/skills`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Failed to load skills");
                setData(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load skills");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [apiBaseUrl]);

    const skillCategories = data?.categories ?? [];
    const allSkills = useMemo(
        () =>
            skillCategories.flatMap((cat) =>
                cat.skills.map((skill) => ({
                    ...skill,
                    category: cat.label,
                    icon: cat.icon,
                    needed: data?.target_career?.title ? [data.target_career.title] : [],
                }))
            ),
        [skillCategories, data?.target_career?.title]
    );

    const displaySkills =
        activeCategory === "all"
            ? allSkills.filter((s) => priorityFilter === "all" || s.priority === priorityFilter)
            : skillCategories
                .find((c) => c.id === activeCategory)
                ?.skills.filter((s) => priorityFilter === "all" || s.priority === priorityFilter)
                .map((s) => ({
                    ...s,
                    category: skillCategories.find((c) => c.id === activeCategory)!.label,
                    icon: skillCategories.find((c) => c.id === activeCategory)!.icon,
                    needed: data?.target_career?.title ? [data.target_career.title] : [],
                })) || [];

    // Summary stats
    const totalSkills = allSkills.length;
    const noSkill = allSkills.filter((s) => s.level === "None").length;
    const beginnerSkill = allSkills.filter((s) => s.level === "Beginner").length;
    const intermediateSkill = allSkills.filter((s) => s.level === "Intermediate").length;
    const highPriority = allSkills.filter((s) => s.priority === "high").length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading skills...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Skills to Improve</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {data?.target_career
                        ? <>For your goal: <span className="text-indigo-300 font-medium">{data.target_career.icon} {data.target_career.title}</span></>
                        : (data?.message ?? "Set a career goal in Profile to get a personalized skill plan.")}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Skills", value: totalSkills, color: "text-white", bg: "bg-gray-800 border-gray-700" },
                    { label: "Not Started", value: noSkill, color: "text-red-400", bg: "bg-red-500/5 border-red-500/20" },
                    { label: "In Progress", value: beginnerSkill + intermediateSkill, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20" },
                    { label: "High Priority", value: highPriority, color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/20" },
                ].map((stat) => (
                    <div key={stat.label} className={`border rounded-2xl p-4 ${stat.bg}`}>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ── FILTERS ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Category filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition border
              ${activeCategory === "all"
                                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                            }`}
                    >
                        All
                    </button>
                    {skillCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition border
                ${activeCategory === cat.id
                                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                }`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Priority filter */}
                <div className="flex gap-2 ml-auto">
                    {["all", "high", "medium", "low"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPriorityFilter(p)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition border capitalize
                ${priorityFilter === p
                                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                }`}
                        >
                            {p === "all" ? "All Priority" : `${p === "high" ? "🔴" : p === "medium" ? "🟡" : "🟢"} ${p}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── SKILLS LIST ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySkills.length === 0 && (
                    <div className="md:col-span-2 text-center py-10 text-gray-600 text-sm border border-gray-800 rounded-2xl bg-gray-900">
                        {data?.target_career ? "No skills found for this career yet." : "Set a career goal to see skills."}
                    </div>
                )}
                {displaySkills.map((skill) => (
                    <div
                        key={skill.name}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
                    >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="text-white font-semibold text-sm">{skill.name}</h4>
                                <p className="text-gray-500 text-xs mt-0.5">{skill.category}</p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${priorityColors[(skill.priority ?? "low") as "low" | "medium" | "high"]}`}>
                                    {(skill.priority ?? "low")} priority
                                </span>
                            </div>
                        </div>

                        {/* Level bar */}
                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-gray-500 text-xs">Current level</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[skill.level]}`}>
                                    {skill.level}
                                </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full transition-all ${levelBar[skill.level]} ${levelBarColor[skill.level]}`} />
                            </div>
                        </div>

                        {/* Needed for */}
                        <div className="mb-4">
                            <p className="text-gray-600 text-xs mb-1.5">Needed for:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(skill.needed ?? []).map((career) => (
                                    <span key={career} className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-md">
                                        {career}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Expanded Skills */}
                        {skill.expanded_skills && skill.expanded_skills.length > 0 && (
                            <div className="mb-4">
                                <p className="text-gray-600 text-[10px] uppercase font-black tracking-wider mb-2">Specific Tools:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {skill.expanded_skills.map((sub, idx) => (
                                        sub.url ? (
                                            <a 
                                                key={idx} href={sub.url} target="_blank" rel="noreferrer" 
                                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-[10px] text-indigo-300 hover:text-white px-2 py-1 rounded border border-indigo-500/20 uppercase tracking-tighter transition-colors flex items-center gap-1"
                                            >
                                                {sub.name} <span>↗</span>
                                            </a>
                                        ) : (
                                            <span key={idx} className="bg-gray-900/50 text-[10px] text-gray-400 px-2 py-1 rounded border border-gray-800 uppercase tracking-tighter">
                                                {sub.name}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learn button */}
                        {skill.resource && (
                            <a
                                href={skill.resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500/40 text-gray-400 hover:text-indigo-300 text-xs font-medium py-2 rounded-xl transition"
                            >
                                <span>📖</span> Start Learning →
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* ── LEARNING PATH TIP ── */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 flex gap-4">
                <div className="text-3xl">💡</div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-1">Where to start?</h4>
                    <p className="text-gray-400 text-sm">
                        Focus on <span className="text-indigo-400 font-medium">high priority skills</span> first — especially ones marked as <span className="text-red-400 font-medium">Not Started</span>. Even 30 minutes a day of practice builds a strong foundation over time.
                    </p>
                </div>
            </div>

        </div>
    );
}