"use client";

import { useState } from "react";

const alumni = [
    {
        id: 1,
        name: "Mark Reyes",
        program: "BSIT",
        batch: "2022",
        currentRole: "Full Stack Developer",
        company: "Accenture Philippines",
        location: "Taguig, Metro Manila",
        salary: "₱45,000/mo",
        yearsToLand: "4 months after graduation",
        favoriteSubjects: ["Web Information System", "OOP 1 & 2", "Software Engineering"],
        skills: ["React", "Node.js", "PostgreSQL", "Docker"],
        advice: "Master the basics deeply. Many devs rush to learn frameworks but struggle with fundamentals. Data Structures and OOP saved me in every technical interview.",
        linkedin: "#",
        avatar: "MR",
        color: "indigo",
    },
    {
        id: 2,
        name: "Patricia Santos",
        program: "BSIT",
        batch: "2021",
        currentRole: "Data Analyst",
        company: "UnionBank of the Philippines",
        location: "Pasig City",
        salary: "₱38,000/mo",
        yearsToLand: "2 months after graduation",
        favoriteSubjects: ["Database System", "Advanced Statistics", "Methodology"],
        skills: ["SQL", "Python", "Tableau", "Excel"],
        advice: "Don't underestimate Statistics and Database. Those two subjects literally define what I do every day. Fall in love with data — it tells stories.",
        linkedin: "#",
        avatar: "PS",
        color: "cyan",
    },
    {
        id: 3,
        name: "Carlo Mendoza",
        program: "BSIT",
        batch: "2023",
        currentRole: "Junior Network Engineer",
        company: "Globe Telecom",
        location: "BGC, Taguig",
        salary: "₱32,000/mo",
        yearsToLand: "6 months after graduation",
        favoriteSubjects: ["Data Communication & Networking", "Operating System", "Advanced Networking"],
        skills: ["Cisco", "Linux", "TCP/IP", "Network Security"],
        advice: "Get your CCNA certification while in school. Companies look for it. Also, your Practicum is your first real job — treat it seriously.",
        linkedin: "#",
        avatar: "CM",
        color: "blue",
    },
    {
        id: 4,
        name: "Angela Cruz",
        program: "BSIT",
        batch: "2021",
        currentRole: "UI/UX Designer",
        company: "Sprout Solutions",
        location: "Makati City",
        salary: "₱40,000/mo",
        yearsToLand: "3 months after graduation",
        favoriteSubjects: ["Computer Graphics Design", "Web Information System", "Multimedia Concepts"],
        skills: ["Figma", "Adobe XD", "HTML/CSS", "User Research"],
        advice: "IT isn't just coding. I found my passion in design. Explore everything in your 2nd and 3rd year — you might discover a path you didn't expect.",
        linkedin: "#",
        avatar: "AC",
        color: "violet",
    },
    {
        id: 5,
        name: "Brian Lim",
        program: "BSCRIM",
        batch: "2022",
        currentRole: "Criminal Investigator",
        company: "Philippine National Police",
        location: "Camp Crame, QC",
        salary: "₱30,000/mo",
        yearsToLand: "1 month after board exam",
        favoriteSubjects: ["CDI 1 & 2", "Forensic 1-3", "CLJ 3 & 4"],
        skills: ["Investigation", "Report Writing", "Forensic Analysis", "Criminal Law"],
        advice: "Pass the Criminologist board exam right after graduation — don't delay. Study CDI and Forensics hard, those are the bulk of the board exam.",
        linkedin: "#",
        avatar: "BL",
        color: "blue",
    },
    {
        id: 6,
        name: "Maria Dela Torre",
        program: "BSIT",
        batch: "2020",
        currentRole: "Software Engineer",
        company: "Exist Software Labs",
        location: "Quezon City",
        salary: "₱55,000/mo",
        yearsToLand: "During practicum (hired directly)",
        favoriteSubjects: ["Data Structures and Algorithms", "OOP 1 & 2", "Capstone Project"],
        skills: ["Java", "Spring Boot", "React", "AWS"],
        advice: "Your Capstone project is your portfolio. Build something real, solve a real problem — that's what impressed my interviewer. Don't just build a library system.",
        linkedin: "#",
        avatar: "MD",
        color: "indigo",
    },
];

const colorMap: Record<string, { avatar: string; badge: string; border: string; tag: string }> = {
    indigo: { avatar: "bg-indigo-600 text-white", badge: "bg-indigo-500/20 text-indigo-300", border: "border-indigo-500/30", tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
    cyan: { avatar: "bg-cyan-600 text-white", badge: "bg-cyan-500/20 text-cyan-300", border: "border-cyan-500/30", tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
    blue: { avatar: "bg-blue-600 text-white", badge: "bg-blue-500/20 text-blue-300", border: "border-blue-500/30", tag: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    violet: { avatar: "bg-violet-600 text-white", badge: "bg-violet-500/20 text-violet-300", border: "border-violet-500/30", tag: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
};

export default function AlumniTracksPage() {
    const [programFilter, setProgramFilter] = useState("All");
    const [expanded, setExpanded] = useState<number | null>(null);

    const filtered = alumni.filter((a) => programFilter === "All" || a.program === programFilter);

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
                    { label: "TMC Alumni", value: "120+", color: "text-white", bg: "bg-gray-800 border-gray-700" },
                    { label: "Avg. Salary", value: "₱40K", color: "text-green-400", bg: "bg-green-500/5 border-green-500/20" },
                    { label: "Hired in 6 mos", value: "87%", color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/20" },
                    { label: "Companies", value: "50+", color: "text-cyan-400", bg: "bg-cyan-500/5 border-cyan-500/20" },
                ].map((s) => (
                    <div key={s.label} className={`border rounded-2xl p-4 ${s.bg}`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {["All", "BSIT", "BSCRIM", "BSED", "BSOA", "BSPOL.SCI"].map((p) => (
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

            {/* Alumni Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((person) => {
                    const c = colorMap[person.color];
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
                                    {person.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-white font-semibold">{person.name}</h4>
                                            <p className="text-gray-400 text-xs">{person.currentRole} · {person.company}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
                                            {person.program} '{person.batch}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick info */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                    📍 {person.location}
                                </span>
                                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full">
                                    💰 {person.salary}
                                </span>
                                <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                                    ⚡ {person.yearsToLand}
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
                                    {/* Skills */}
                                    <div>
                                        <p className="text-gray-500 text-xs mb-2">Skills they use daily:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {person.skills.map((skill) => (
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
                                            {person.favoriteSubjects.map((subject) => (
                                                <span key={subject} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advice */}
                                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                        <p className="text-gray-500 text-xs mb-1">💬 Advice to current students:</p>
                                        <p className="text-gray-300 text-sm italic">"{person.advice}"</p>
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