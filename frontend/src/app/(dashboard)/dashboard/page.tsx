"use client";

import { useState, useEffect } from "react";

const matchColors: Record<string, string> = {
    indigo: "bg-indigo-600/20 border-indigo-500/30 text-indigo-400",
    violet: "bg-violet-600/20 border-violet-500/30 text-violet-400",
    blue: "bg-blue-600/20 border-blue-500/30 text-blue-400",
    cyan: "bg-cyan-600/20 border-cyan-500/30 text-cyan-400",
};

const matchBarColors: Record<string, string> = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
};

const matchBadgeColors: Record<string, string> = {
    indigo: "bg-indigo-500/20 text-indigo-300",
    violet: "bg-violet-500/20 text-violet-300",
    blue: "bg-blue-500/20 text-blue-300",
    cyan: "bg-cyan-500/20 text-cyan-300",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [student, setStudent] = useState<any>(null);
    const [recommendedCareers, setRecommendedCareers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get student from localStorage
        const studentData = JSON.parse(localStorage.getItem("student") || "{}");
        setStudent(studentData);

        // Fetch career matches from backend
        const fetchCareerMatches = async () => {
            try {
                const response = await fetch(
                    `http://localhost:4000/careers/matches/${studentData.student_id}`
                );
                const data = await response.json();

                // Map backend data to frontend format
                const formattedCareers = data.map((career: any, index: number) => ({
                    title: career.title,
                    match: career.match,
                    description: career.description,
                    salaryRange: `₱${Number(career.salary_min).toLocaleString()} – ₱${Number(career.salary_max).toLocaleString()}/mo`,
                    skills: [], // We'll add this later
                    color: ['indigo', 'violet', 'blue', 'cyan'][index % 4],
                    icon: career.icon,
                }));

                setRecommendedCareers(formattedCareers);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching careers:", error);
                setLoading(false);
            }
        };

        if (studentData.student_id) {
            fetchCareerMatches();
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const progressPercent = 40; // TODO: Calculate from database

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* ── WELCOME BANNER ── */}
            <div className="relative bg-gradient-to-br from-indigo-600/30 via-indigo-600/10 to-gray-900 border border-indigo-500/20 rounded-2xl p-7 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-violet-500/10 rounded-full translate-y-1/2 blur-2xl" />

                <div className="relative">
                    <p className="text-indigo-300 text-sm font-medium mb-1">{greeting()},</p>
                    <h2 className="text-3xl font-bold text-white mb-2">{student.name} 👋</h2>
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full border border-indigo-500/30">
                            {student.program}
                        </span>
                        <span className="bg-gray-700/50 text-gray-300 text-xs font-medium px-3 py-1 rounded-full border border-gray-700">
                            {student.yearLevel}
                        </span>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-gray-400 text-sm">Academic Progress</p>
                            <p className="text-white text-sm font-semibold">{student.finishedSubjects} / {student.totalSubjects} subjects</p>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-700"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-indigo-400 text-xs mt-1.5">{progressPercent}% complete</p>
                    </div>
                </div>
            </div>

            {/* ── LIKED SUBJECTS SUMMARY ── */}
            <div>
                <p className="text-gray-400 text-sm mb-3">
                    Your top subjects · <span className="text-indigo-400">based on your interests</span>
                </p>
                <div className="flex flex-wrap gap-2">
                    {(student?.likedSubjects ?? []).map((subject: string) => (
                        <span
                            key={subject}
                            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full"
                        >
                            ♥ {subject}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── RECOMMENDED CAREERS ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-bold text-lg">Your Recommended Careers</h3>
                        <p className="text-gray-500 text-sm">Based on your finished subjects and interests</p>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                        {recommendedCareers.length} matches
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedCareers.map((career, index) => (
                        <div
                            key={career.title}
                            className={`relative bg-gray-900 border rounded-2xl p-5 hover:scale-[1.01] transition-transform cursor-pointer group
                ${index === 0 ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : "border-gray-800"}
              `}
                        >
                            {/* Best match badge */}
                            {index === 0 && (
                                <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                                    ⭐ Best Match
                                </span>
                            )}

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl ${matchColors[career.color]}`}>
                                        {career.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{career.title}</h4>
                                        <p className="text-gray-500 text-xs">{career.salaryRange}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${matchBadgeColors[career.color]}`}>
                                    {career.match}% match
                                </span>
                            </div>

                            {/* Match bar */}
                            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-700 ${matchBarColors[career.color]}`}
                                    style={{ width: `${career.match}%` }}
                                />
                            </div>

                            <p className="text-gray-400 text-xs mb-3">{career.description}</p>

                            {/* Matched skills */}
                            <div className="flex flex-wrap gap-1.5">
                                {career.skills.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-md border border-gray-700"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute bottom-4 right-4 text-gray-700 group-hover:text-indigo-400 transition text-sm">
                                →
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-6">
                {[
                    { label: "View Career Paths", href: "/pathway", icon: "🗺️" },
                    { label: "Skills to Improve", href: "/skills", icon: "⚡" },
                    { label: "Find Internships", href: "/internships", icon: "💼" },
                    { label: "Alumni Tracks", href: "/alumni", icon: "🎓" },
                ].map((action) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className="bg-gray-900 border border-gray-800 hover:border-indigo-500/40 hover:bg-gray-800 rounded-xl p-4 text-center transition group"
                    >
                        <div className="text-2xl mb-2">{action.icon}</div>
                        <p className="text-gray-400 group-hover:text-white text-xs font-medium transition">
                            {action.label}
                        </p>
                    </a>
                ))}
            </div>

        </div>
    );
}