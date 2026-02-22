"use client";

import { useState } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const skillCategories = [
    {
        id: "programming",
        label: "Programming",
        icon: "💻",
        skills: [
            { name: "JavaScript", level: "Beginner", needed: ["Software Engineer", "Web Developer"], priority: "high", resource: "https://javascript.info" },
            { name: "Python", level: "None", needed: ["Data Analyst", "Software Engineer"], priority: "high", resource: "https://python.org" },
            { name: "SQL", level: "Intermediate", needed: ["Data Analyst", "Database Admin"], priority: "medium", resource: "https://sqlzoo.net" },
            { name: "C# / .Net", level: "Beginner", needed: ["Software Engineer"], priority: "medium", resource: "https://dotnet.microsoft.com" },
        ],
    },
    {
        id: "web",
        label: "Web Development",
        icon: "🌐",
        skills: [
            { name: "HTML & CSS", level: "Intermediate", needed: ["Web Developer"], priority: "medium", resource: "https://developer.mozilla.org" },
            { name: "React", level: "None", needed: ["Web Developer", "Software Engineer"], priority: "high", resource: "https://react.dev" },
            { name: "REST APIs", level: "None", needed: ["Software Engineer", "Web Developer"], priority: "high", resource: "https://restfulapi.net" },
            { name: "Responsive Design", level: "Beginner", needed: ["Web Developer"], priority: "medium", resource: "https://web.dev" },
        ],
    },
    {
        id: "data",
        label: "Data & Analytics",
        icon: "📊",
        skills: [
            { name: "Data Visualization", level: "None", needed: ["Data Analyst"], priority: "high", resource: "https://tableau.com" },
            { name: "Excel / Spreadsheets", level: "Intermediate", needed: ["Data Analyst", "Business Analyst"], priority: "low", resource: "https://support.microsoft.com" },
            { name: "Statistics", level: "Intermediate", needed: ["Data Analyst"], priority: "medium", resource: "https://khan academy.org" },
        ],
    },
    {
        id: "tools",
        label: "Tools & Soft Skills",
        icon: "🛠️",
        skills: [
            { name: "Git & GitHub", level: "None", needed: ["Software Engineer", "Web Developer"], priority: "high", resource: "https://github.com" },
            { name: "Problem Solving", level: "Intermediate", needed: ["All careers"], priority: "high", resource: "https://leetcode.com" },
            { name: "Communication", level: "Intermediate", needed: ["All careers"], priority: "medium", resource: "" },
            { name: "Project Management", level: "Beginner", needed: ["Software Engineer", "Network Engineer"], priority: "low", resource: "" },
        ],
    },
];

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

    const allSkills = skillCategories.flatMap((cat) =>
        cat.skills.map((skill) => ({ ...skill, category: cat.label, icon: cat.icon }))
    );

    const filteredSkills = allSkills.filter((skill) => {
        const categoryMatch =
            activeCategory === "all" ||
            skillCategories.find((c) => c.id === activeCategory)?.skills.includes(
                skillCategories
                    .find((c) => c.id === activeCategory)
                    ?.skills.find((s) => s.name === skill.name) as typeof skill
            );
        const priorityMatch =
            priorityFilter === "all" || skill.priority === priorityFilter;
        return categoryMatch && priorityMatch;
    });

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
                })) || [];

    // Summary stats
    const totalSkills = allSkills.length;
    const noSkill = allSkills.filter((s) => s.level === "None").length;
    const beginnerSkill = allSkills.filter((s) => s.level === "Beginner").length;
    const intermediateSkill = allSkills.filter((s) => s.level === "Intermediate").length;
    const highPriority = allSkills.filter((s) => s.priority === "high").length;

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Skills to Improve</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Based on your career matches, here are the skills you should develop.
                </p>
            </div>

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
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${priorityColors[skill.priority]}`}>
                                    {skill.priority} priority
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
                                {skill.needed.map((career) => (
                                    <span key={career} className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-md">
                                        {career}
                                    </span>
                                ))}
                            </div>
                        </div>

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