"use client";

import { useState } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const internships = [
    {
        id: 1,
        company: "Accenture Philippines",
        role: "Software Developer Intern",
        location: "Taguig, Metro Manila",
        type: "On-site",
        duration: "6 months",
        stipend: "₱15,000/mo",
        deadline: "March 15, 2025",
        match: 94,
        careers: ["Software Engineer", "Web Developer"],
        skills: ["JavaScript", "React", "REST APIs", "Git"],
        description: "Work with agile development teams building enterprise-grade web applications for global clients.",
        logo: "🏢",
        color: "indigo",
        urgent: true,
    },
    {
        id: 2,
        company: "Globe Telecom",
        role: "IT Infrastructure Intern",
        location: "Bonifacio Global City",
        type: "Hybrid",
        duration: "3 months",
        stipend: "₱12,000/mo",
        deadline: "April 1, 2025",
        match: 80,
        careers: ["Network Engineer", "System Admin"],
        skills: ["Networking", "Linux", "System Administration"],
        description: "Assist in managing and maintaining Globe's IT infrastructure and network systems.",
        logo: "📡",
        color: "blue",
        urgent: false,
    },
    {
        id: 3,
        company: "Exist Software Labs",
        role: "Web Development Intern",
        location: "Quezon City",
        type: "On-site",
        duration: "6 months",
        stipend: "₱10,000/mo",
        deadline: "March 30, 2025",
        match: 88,
        careers: ["Web Developer", "Software Engineer"],
        skills: ["HTML/CSS", "JavaScript", "PHP", "MySQL"],
        description: "Build and maintain web applications using modern technologies for various clients.",
        logo: "🧪",
        color: "violet",
        urgent: true,
    },
    {
        id: 4,
        company: "UnionBank of the Philippines",
        role: "Data Analytics Intern",
        location: "Pasig City",
        type: "Hybrid",
        duration: "3 months",
        stipend: "₱13,000/mo",
        deadline: "April 20, 2025",
        match: 76,
        careers: ["Data Analyst", "Business Analyst"],
        skills: ["SQL", "Excel", "Data Visualization", "Python"],
        description: "Support the data analytics team in generating insights from banking data to improve business decisions.",
        logo: "🏦",
        color: "cyan",
        urgent: false,
    },
    {
        id: 5,
        company: "Sprout Solutions",
        role: "Full Stack Developer Intern",
        location: "Makati City",
        type: "Remote",
        duration: "6 months",
        stipend: "₱14,000/mo",
        deadline: "May 1, 2025",
        match: 85,
        careers: ["Software Engineer", "Web Developer"],
        skills: ["React", "Node.js", "REST APIs", "Git"],
        description: "Join a fast-growing HR tech startup and work on real features used by thousands of businesses.",
        logo: "🌱",
        color: "indigo",
        urgent: false,
    },
    {
        id: 6,
        company: "DOST - ASTI",
        role: "ICT Research Intern",
        location: "Quezon City",
        type: "On-site",
        duration: "3 months",
        stipend: "₱8,000/mo",
        deadline: "April 10, 2025",
        match: 70,
        careers: ["Data Analyst", "Software Engineer"],
        skills: ["Python", "Research", "Data Analysis"],
        description: "Assist government researchers in developing ICT-based solutions for public service delivery.",
        logo: "🔬",
        color: "blue",
        urgent: false,
    },
];

const colorMap: Record<string, { badge: string; border: string; tag: string }> = {
    indigo: { badge: "bg-indigo-500/20 text-indigo-300", border: "border-indigo-500/40", tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
    violet: { badge: "bg-violet-500/20 text-violet-300", border: "border-violet-500/40", tag: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
    blue: { badge: "bg-blue-500/20 text-blue-300", border: "border-blue-500/40", tag: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    cyan: { badge: "bg-cyan-500/20 text-cyan-300", border: "border-cyan-500/40", tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
};

const typeColors: Record<string, string> = {
    "On-site": "bg-green-500/10 text-green-400 border-green-500/20",
    "Hybrid": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Remote": "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function InternshipsPage() {
    const [typeFilter, setTypeFilter] = useState("All");
    const [sortBy, setSortBy] = useState("match");
    const [saved, setSaved] = useState<number[]>([]);

    const toggleSave = (id: number) => {
        setSaved((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
    };

    const filtered = internships
        .filter((i) => typeFilter === "All" || i.type === typeFilter)
        .sort((a, b) => sortBy === "match" ? b.match - a.match : a.deadline.localeCompare(b.deadline));

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Internships</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Opportunities matched to your career path and skills.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Available", value: internships.length, color: "text-white", bg: "bg-gray-800 border-gray-700" },
                    { label: "High Match (80%+)", value: internships.filter((i) => i.match >= 80).length, color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/20" },
                    { label: "Closing Soon", value: internships.filter((i) => i.urgent).length, color: "text-red-400", bg: "bg-red-500/5 border-red-500/20" },
                    { label: "Saved", value: saved.length, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20" },
                ].map((s) => (
                    <div key={s.label} className={`border rounded-2xl p-4 ${s.bg}`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {["All", "On-site", "Hybrid", "Remote"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition border
                ${typeFilter === t
                                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="match">Sort by: Best Match</option>
                    <option value="deadline">Sort by: Deadline</option>
                </select>
            </div>

            {/* Internship Cards */}
            <div className="flex flex-col gap-4">
                {filtered.map((internship) => {
                    const c = colorMap[internship.color];
                    const isSaved = saved.includes(internship.id);
                    return (
                        <div
                            key={internship.id}
                            className={`bg-gray-900 border rounded-2xl p-5 hover:border-gray-700 transition
                ${internship.match >= 90 ? c.border : "border-gray-800"}
              `}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Logo */}
                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${c.tag}`}>
                                    {internship.logo}
                                </div>

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                        <div>
                                            <h4 className="text-white font-semibold">{internship.role}</h4>
                                            <p className="text-gray-400 text-sm">{internship.company}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {internship.urgent && (
                                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full">
                                                    🔥 Closing Soon
                                                </span>
                                            )}
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                                                {internship.match}% match
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex flex-wrap gap-2 my-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColors[internship.type]}`}>
                                            {internship.type}
                                        </span>
                                        <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                            📍 {internship.location}
                                        </span>
                                        <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                            ⏱ {internship.duration}
                                        </span>
                                        <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                            💰 {internship.stipend}
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-xs mb-3">{internship.description}</p>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {internship.skills.map((skill) => (
                                            <span key={skill} className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-md">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-600 text-xs">
                                            Deadline: <span className="text-gray-400">{internship.deadline}</span>
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleSave(internship.id)}
                                                className={`text-xs px-3 py-1.5 rounded-xl border transition font-medium
                          ${isSaved
                                                        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                                    }`}
                                            >
                                                {isSaved ? "⭐ Saved" : "☆ Save"}
                                            </button>
                                            <button className="text-xs px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition">
                                                Apply Now →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}