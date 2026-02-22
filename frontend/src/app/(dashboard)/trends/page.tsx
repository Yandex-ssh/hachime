"use client";

import { useState } from "react";

const trends = [
    {
        id: "ai-ml",
        title: "Artificial Intelligence & Machine Learning",
        icon: "🤖",
        color: "indigo",
        growth: "+35%",
        direction: "up",
        demandLevel: "Very High",
        salaryRange: "₱50,000 – ₱150,000/mo",
        description: "AI and ML continue to dominate the tech industry. From automation to generative AI, companies across all sectors are hiring AI talent.",
        topRoles: ["ML Engineer", "AI Researcher", "Data Scientist", "Prompt Engineer"],
        topSkills: ["Python", "TensorFlow", "PyTorch", "Statistics", "Data Modeling"],
        relatedSubjects: ["Advanced Statistics", "Data Structures", "Methodology", "Database System"],
        insight: "ChatGPT and similar tools have created entirely new roles like 'Prompt Engineer' and 'AI Product Manager'. The field is evolving fast.",
        companies: ["Google", "Microsoft", "Accenture", "IBM", "Sitel"],
    },
    {
        id: "cybersecurity",
        title: "Cybersecurity",
        icon: "🔐",
        color: "red",
        growth: "+28%",
        direction: "up",
        demandLevel: "Very High",
        salaryRange: "₱45,000 – ₱120,000/mo",
        description: "With increasing cyber threats, demand for cybersecurity professionals in the Philippines has surged — especially in banking and government sectors.",
        topRoles: ["Security Analyst", "Ethical Hacker", "SOC Analyst", "Security Engineer"],
        topSkills: ["Network Security", "Linux", "Penetration Testing", "Cryptography", "SIEM"],
        relatedSubjects: ["Data Communication & Networking", "Operating System", "Advanced Networking", "ICT Trends"],
        insight: "BSP (Bangko Sentral ng Pilipinas) mandates cybersecurity compliance for all banks — creating massive demand for security professionals in PH.",
        companies: ["BDO", "BPI", "Globe", "DOST", "DICT"],
    },
    {
        id: "cloud",
        title: "Cloud Computing",
        icon: "☁️",
        color: "blue",
        growth: "+22%",
        direction: "up",
        demandLevel: "High",
        salaryRange: "₱40,000 – ₱100,000/mo",
        description: "Philippine businesses are rapidly moving to cloud infrastructure, creating demand for AWS, Azure, and GCP professionals.",
        topRoles: ["Cloud Engineer", "DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"],
        topSkills: ["AWS / Azure / GCP", "Docker", "Kubernetes", "CI/CD", "Linux"],
        relatedSubjects: ["System Management Administration", "Advanced Networking", "Operating System", "Project Management"],
        insight: "Cloud certifications (AWS, Azure) significantly increase starting salaries — many entry-level cloud roles start at ₱50,000+.",
        companies: ["Amazon", "Microsoft", "Accenture", "Telus International", "Concentrix"],
    },
    {
        id: "web-mobile",
        title: "Web & Mobile Development",
        icon: "📱",
        color: "violet",
        growth: "+18%",
        direction: "up",
        demandLevel: "High",
        salaryRange: "₱25,000 – ₱80,000/mo",
        description: "Demand for web and mobile developers remains consistently high. React, Flutter, and mobile-first development are leading the market.",
        topRoles: ["React Developer", "Flutter Developer", "Full Stack Engineer", "Mobile Developer"],
        topSkills: ["React", "Flutter", "TypeScript", "REST APIs", "Firebase"],
        relatedSubjects: ["Web Information System", "OOP 1 & 2", "Database System", "Computer Graphics Design"],
        insight: "Freelancing is thriving — many Filipino web developers earn in USD by working for foreign clients on platforms like Upwork and Toptal.",
        companies: ["Exist Software", "Sprout Solutions", "Thinking Machines", "PayMongo", "Kumu"],
    },
    {
        id: "data-analytics",
        title: "Data Analytics & BI",
        icon: "📊",
        color: "cyan",
        growth: "+25%",
        direction: "up",
        demandLevel: "High",
        salaryRange: "₱30,000 – ₱75,000/mo",
        description: "Companies are investing heavily in data-driven decisions. Business Intelligence and analytics roles are growing across banking, retail, and government.",
        topRoles: ["Data Analyst", "BI Developer", "Business Analyst", "Data Engineer"],
        topSkills: ["SQL", "Power BI", "Tableau", "Python", "Excel"],
        relatedSubjects: ["Database System", "Advanced Statistics", "Methodology", "System Analysis and Design"],
        insight: "Power BI and Tableau are the most in-demand BI tools in PH right now. Learning either one makes you immediately hireable.",
        companies: ["UnionBank", "BDO", "SM Group", "Jollibee", "PLDT"],
    },
];

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

    const selectedTrend = trends.find((t) => t.id === selected);

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
                    <h3 className="text-white font-bold">Philippine IT Job Market Snapshot — 2025</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "IT Jobs Available", value: "120,000+", sub: "Nationwide" },
                        { label: "Avg IT Salary", value: "₱42,000", sub: "Entry level" },
                        { label: "Remote Jobs", value: "45%", sub: "Of IT roles" },
                        { label: "Growth vs 2024", value: "+23%", sub: "Year over year" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-900/60 rounded-xl p-3 border border-gray-800">
                            <p className="text-white font-bold text-lg">{stat.value}</p>
                            <p className="text-gray-400 text-xs">{stat.label}</p>
                            <p className="text-gray-600 text-xs">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trend cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trends.map((trend) => {
                    const c = colorMap[trend.color];
                    const isActive = selected === trend.id;
                    return (
                        <button
                            key={trend.id}
                            onClick={() => setSelected(isActive ? null : trend.id)}
                            className={`text-left bg-gray-900 border rounded-2xl p-5 transition-all hover:scale-[1.01]
                ${isActive ? `${c.border} ring-1 ring-inset` : "border-gray-800 hover:border-gray-700"}
              `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl ${c.tag}`}>
                                        {trend.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{trend.title}</h4>
                                        <p className="text-gray-500 text-xs">{trend.salaryRange}</p>
                                    </div>
                                </div>
                                <span className="text-green-400 font-bold text-sm">{trend.growth}</span>
                            </div>

                            {/* Demand bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500">Market Demand</span>
                                    <span className={`font-medium ${c.badge.split(" ")[1]}`}>{trend.demandLevel}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${c.bar} ${demandWidth[trend.demandLevel]}`} />
                                </div>
                            </div>

                            <p className="text-gray-400 text-xs">{trend.description}</p>

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
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${colorMap[selectedTrend.color].tag}`}>
                            {selectedTrend.icon}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-xl">{selectedTrend.title}</h3>
                            <p className="text-gray-400 text-sm">{selectedTrend.salaryRange} · <span className="text-green-400">{selectedTrend.growth} growth</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Roles */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">💼 Top Job Roles</h4>
                            <div className="flex flex-col gap-2">
                                {selectedTrend.topRoles.map((role) => (
                                    <div key={role} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${colorMap[selectedTrend.color].bar}`} />
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
                                    <span key={skill} className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[selectedTrend.color].tag}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Subjects */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-3">📚 Your Relevant Subjects</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedTrend.relatedSubjects.map((subject) => (
                                <span key={subject} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                                    {subject}
                                </span>
                            ))}
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
                            <p className="text-gray-300 text-sm">{selectedTrend.insight}</p>
                        </div>
                    </div>
                </div>
            )}

            {!selected && (
                <div className="text-center py-6 text-gray-600 text-sm">
                    👆 Click any trend card to see full details
                </div>
            )}
        </div>
    );
}