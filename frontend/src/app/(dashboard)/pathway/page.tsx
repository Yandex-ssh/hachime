"use client";

import { useState } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const careerPaths = [
    {
        id: "software-engineer",
        title: "Software Engineer",
        icon: "💻",
        color: "indigo",
        match: 95,
        salaryRange: "₱30,000 – ₱80,000/mo",
        salaryGrowth: "↑ 18% demand growth",
        description: "Design, build, and maintain software systems and applications used by businesses and consumers.",
        jobExamples: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer"],
        skills: ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "REST APIs", "OOP"],
        requiredSubjects: [
            "Computer Programming 1 & 2",
            "Data Structures and Algorithms",
            "Object-Oriented Programming 1 & 2",
            "Software Engineering",
            "Web Information System",
            "Database System",
        ],
        roadmap: [
            {
                year: "1st Year",
                title: "Build the Foundation",
                description: "Learn the basics of programming and computers.",
                subjects: ["Computer Programming 1 & 2", "Application and Productivity Tools", "Computer Concepts"],
                milestone: "Write your first working program",
            },
            {
                year: "2nd Year",
                title: "Core Engineering Concepts",
                description: "Dive into the building blocks of software development.",
                subjects: ["Data Structures and Algorithms", "OOP 1 & 2", "Database System", "Discrete Math"],
                milestone: "Build a fully working CRUD application",
            },
            {
                year: "3rd Year",
                title: "Specialize & Build",
                description: "Apply your skills to real-world projects.",
                subjects: ["Web Information System", "Software Engineering", "C#/.Net or VB.Net", "Project Management"],
                milestone: "Build and deploy a full web application",
            },
            {
                year: "4th Year",
                title: "Career Ready",
                description: "Finalize your portfolio and enter the industry.",
                subjects: ["Capstone Project 1 & 2", "Practicum 1 & 2", "Advanced Networking"],
                milestone: "Graduate with a capstone project + internship experience",
            },
        ],
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        icon: "📊",
        color: "cyan",
        match: 85,
        salaryRange: "₱25,000 – ₱60,000/mo",
        salaryGrowth: "↑ 25% demand growth",
        description: "Analyze data sets to find trends and insights that help organizations make better business decisions.",
        jobExamples: ["Business Analyst", "Data Scientist", "BI Analyst", "Research Analyst"],
        skills: ["SQL", "Excel", "Python", "Statistics", "Data Visualization", "Critical Thinking"],
        requiredSubjects: [
            "Database System",
            "Advanced Statistics",
            "Data Structures and Algorithms",
            "System Analysis and Design",
            "Methodology",
            "Research",
        ],
        roadmap: [
            {
                year: "1st Year",
                title: "Math & Logic Foundation",
                description: "Build strong analytical and mathematical thinking.",
                subjects: ["Mathematics in the Modern World", "Advanced Algebra with Trigonometry", "Computer Concepts"],
                milestone: "Understand core mathematical reasoning",
            },
            {
                year: "2nd Year",
                title: "Data Foundations",
                description: "Learn how data is stored, queried, and analyzed.",
                subjects: ["Database System", "Advanced Statistics", "Data Structures", "System Analysis and Design"],
                milestone: "Write complex SQL queries and basic data reports",
            },
            {
                year: "3rd Year",
                title: "Analysis & Research",
                description: "Apply analytical skills to real datasets.",
                subjects: ["Methodology", "ICT Trends", "Project Management", "System Management Administration"],
                milestone: "Complete a data analysis research project",
            },
            {
                year: "4th Year",
                title: "Industry Ready",
                description: "Build your portfolio with real-world data projects.",
                subjects: ["Capstone Project 1 & 2", "Practicum", "Research 1"],
                milestone: "Present a full data analysis capstone",
            },
        ],
    },
    {
        id: "web-developer",
        title: "Web Developer",
        icon: "🌐",
        color: "violet",
        match: 88,
        salaryRange: "₱25,000 – ₱70,000/mo",
        salaryGrowth: "↑ 15% demand growth",
        description: "Create and maintain websites and web applications for clients across all industries.",
        jobExamples: ["Frontend Developer", "UI/UX Developer", "WordPress Developer", "React Developer"],
        skills: ["HTML/CSS", "JavaScript", "React", "Responsive Design", "Git", "REST APIs"],
        requiredSubjects: [
            "HTML and Internet Fundamentals",
            "Web Information System",
            "Computer Programming 1 & 2",
            "Database System",
            "Computer Graphics Design",
            "Multimedia Concepts",
        ],
        roadmap: [
            {
                year: "1st Year",
                title: "Web Fundamentals",
                description: "Learn the building blocks of the web.",
                subjects: ["HTML and Internet Fundamentals", "Computer Programming 1 & 2", "App and Productivity Tools"],
                milestone: "Build your first static website",
            },
            {
                year: "2nd Year",
                title: "Dynamic Web Development",
                description: "Make websites interactive and data-driven.",
                subjects: ["OOP 1 & 2", "Database System", "System Analysis and Design", "Technical Writing"],
                milestone: "Build a dynamic website connected to a database",
            },
            {
                year: "3rd Year",
                title: "Modern Web Tech",
                description: "Learn modern frameworks and web technologies.",
                subjects: ["Web Information System", "Multimedia Concepts", "C#/.Net Programming", "ICT Trends"],
                milestone: "Build a full-stack web application",
            },
            {
                year: "4th Year",
                title: "Professional Portfolio",
                description: "Launch real projects for your portfolio.",
                subjects: ["Computer Graphics Design", "Video Editing", "Capstone 1 & 2", "Practicum"],
                milestone: "Launch 3+ live websites in your portfolio",
            },
        ],
    },
    {
        id: "network-engineer",
        title: "Network Engineer",
        icon: "🔌",
        color: "blue",
        match: 72,
        salaryRange: "₱30,000 – ₱75,000/mo",
        salaryGrowth: "↑ 10% demand growth",
        description: "Design, implement, and manage computer networks for organizations of all sizes.",
        jobExamples: ["Network Admin", "Systems Admin", "IT Infrastructure Engineer", "Cloud Engineer"],
        skills: ["Networking", "TCP/IP", "Cisco", "Security", "Linux", "Cloud Computing"],
        requiredSubjects: [
            "Data Communication & Networking",
            "Advanced Networking",
            "Operating System",
            "System Management Administration",
            "ICT Trends",
            "Advanced Physics",
        ],
        roadmap: [
            {
                year: "1st Year",
                title: "IT Fundamentals",
                description: "Understand how computers and systems work.",
                subjects: ["Computer Concepts and Fundamentals", "Computer Programming 1", "App and Productivity Tools"],
                milestone: "Understand basic IT infrastructure",
            },
            {
                year: "2nd Year",
                title: "Systems & OS",
                description: "Learn operating systems and system design.",
                subjects: ["Operating System", "Database System", "System Analysis and Design", "Advanced Physics"],
                milestone: "Set up and configure a local server",
            },
            {
                year: "3rd Year",
                title: "Networking Core",
                description: "Deep dive into networking technologies.",
                subjects: ["Data Communication & Networking", "System Management Administration", "ICT Trends", "Project Management"],
                milestone: "Configure a working network with routing and switching",
            },
            {
                year: "4th Year",
                title: "Advanced & Cloud",
                description: "Master advanced networking and cloud platforms.",
                subjects: ["Advanced Networking", "Capstone Project 1 & 2", "Practicum 1 & 2"],
                milestone: "Complete network infrastructure capstone",
            },
        ],
    },
];

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
    const [selected, setSelected] = useState<string | null>(null);

    const selectedCareer = careerPaths.find((c) => c.id === selected);

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Career Pathways</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Explore careers that match your subjects and interests. Click a career to see your full roadmap.
                </p>
            </div>

            {/* ── CAREER CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerPaths.map((career) => {
                    const c = colorMap[career.color];
                    const isActive = selected === career.id;
                    return (
                        <button
                            key={career.id}
                            onClick={() => setSelected(isActive ? null : career.id)}
                            className={`text-left bg-gray-900 border rounded-2xl p-5 transition-all hover:scale-[1.01]
                ${isActive ? c.card : "border-gray-800 hover:border-gray-700"}
              `}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl ${isActive ? c.tag : "bg-gray-800 border-gray-700"}`}>
                                        {career.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{career.title}</h3>
                                        <p className="text-gray-500 text-xs">{career.salaryRange}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                                    {career.match}% match
                                </span>
                            </div>

                            {/* Match bar */}
                            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                                <div
                                    className={`h-1.5 rounded-full ${c.bar}`}
                                    style={{ width: `${career.match}%` }}
                                />
                            </div>

                            <p className="text-gray-400 text-xs mb-3">{career.description}</p>

                            {/* Growth badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-green-400 text-xs font-medium">{career.salaryGrowth}</span>
                                <span className={`text-xs transition ${isActive ? "text-indigo-400" : "text-gray-600"}`}>
                                    {isActive ? "▲ Hide roadmap" : "▼ View roadmap"}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── DETAILED ROADMAP ── */}
            {selectedCareer && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-8">
                    {/* Career header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${colorMap[selectedCareer.color].tag}`}>
                                {selectedCareer.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">{selectedCareer.title}</h3>
                                <p className="text-gray-400 text-sm">{selectedCareer.salaryRange}</p>
                            </div>
                        </div>
                        <span className={`text-sm font-bold px-4 py-2 rounded-full self-start ${colorMap[selectedCareer.color].badge}`}>
                            {selectedCareer.match}% match for you
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
                                        className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[selectedCareer.color].tag}`}
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
                                {selectedCareer.jobExamples.map((job) => (
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

                    {/* Required Subjects */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-3">📚 Key Subjects for This Career</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedCareer.requiredSubjects.map((subject) => (
                                <span
                                    key={subject}
                                    className="text-xs px-3 py-1.5 rounded-full border bg-gray-800 border-gray-700 text-gray-300"
                                >
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Roadmap */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-6">🗺️ Your Year-by-Year Roadmap</h4>
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />

                            <div className="space-y-8">
                                {selectedCareer.roadmap.map((step, index) => (
                                    <div key={step.year} className="relative flex gap-6 pl-12">
                                        {/* Dot */}
                                        <div className={`absolute left-0 w-9 h-9 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${colorMap[selectedCareer.color].dot}`}>
                                            {index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 bg-gray-800/50 border rounded-xl p-4 ${index === 0 ? colorMap[selectedCareer.color].timeline : "border-gray-700/50"}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-semibold ${colorMap[selectedCareer.color].badge} px-2 py-0.5 rounded-full`}>
                                                    {step.year}
                                                </span>
                                            </div>
                                            <h5 className="text-white font-semibold mt-2 mb-1">{step.title}</h5>
                                            <p className="text-gray-400 text-xs mb-3">{step.description}</p>

                                            {/* Subjects */}
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {step.subjects.map((s) => (
                                                    <span key={s} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded-md border border-gray-700">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Milestone */}
                                            <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
                                                <span className="text-yellow-400 text-xs">🎯</span>
                                                <span className="text-gray-300 text-xs">{step.milestone}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!selected && (
                <div className="text-center py-10 text-gray-600 text-sm">
                    👆 Click any career card above to see your full roadmap
                </div>
            )}
        </div>
    );
}