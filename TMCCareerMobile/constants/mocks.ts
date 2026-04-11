export const MOCK_STUDENT = {
    student_id: 1,
    name: "Guest Student",
    student_number: "2021-0001",
    program: "Bachelor of Science in Computer Science",
    year_level: 3,
    email: "guest@tmc.edu.ph",
    progress: {
        finishedSubjects: 32,
        totalSubjects: 45,
        percent: 71,
    },
    career_goal: {
        career_id: 1,
        title: "Software Engineer",
        icon: "💻",
        progress: { completed: 18, total: 24, percent: 75 },
        gap: {
            missing_subjects: [
                { subject_id: 101, subject_name: "Advanced Algorithms" },
                { subject_id: 102, subject_name: "Cloud Architecture" }
            ]
        }
    }
};

export const MOCK_RECOMMENDED_CAREERS = [
    {
        title: "Software Engineer",
        match: 92,
        description: "Design and build scalable software applications.",
        salaryRange: "₱45,000 – ₱85,000/mo",
        color: "indigo",
        icon: "💻",
        skills: ["React", "NestJS", "PostgreSQL"]
    },
];

export const MOCK_QUICK_ACTIONS = [
    { label: "View Pathways", href: "/pathway", icon: "🗺️" },
    { label: "Improve Skills", href: "/skills", icon: "⚡" },
    { label: "Internships", href: "/internships", icon: "💼" },
    { label: "Jobs", href: "/jobs", icon: "🧾" },
    { label: "Alumni Success", href: "/alumni", icon: "🎓" },
    { label: "Trends", href: "/trends", icon: "📈" },
    { label: "Resources", href: "/resources", icon: "📚" },
];

export const MOCK_PATHWAY_DATA = {
    target_career: {
        career_id: 1,
        title: "Software Engineer",
        icon: "💻",
        salary_range: { min: 45000, max: 85000 },
        skills: ["React", "NestJS", "Postgres", "Docker", "Algorithms"],
        demand_level: "High",
    },
    roadmap: [
        {
            year_level: 1,
            progress: { completed: 8, total: 8, percent: 100 },
            subjects: [
                { subject_id: 1, subject_name: "Intro to Computing", completed: true },
                { subject_id: 2, subject_name: "Programming 1", completed: true },
            ],
        },
    ],
};

export const MOCK_SKILLS_DATA = {
    categories: [
        { id: "web", label: "Web Dev", icon: "🌐" },
    ],
    skills: [
        { name: "React Navigation", category: "Web Dev", level: "Beginner", priority: "high", resource: "https://reactnavigation.org/" },
    ],
    stats: {
        total: 12,
        notStarted: 4,
        inProgress: 6,
        highPriority: 3
    }
};

export const MOCK_INTERNSHIPS = [
    {
        id: 1,
        role: "Software Engineering Intern",
        company: "Tech Solutions Inc.",
        location: "BGC, Taguig",
        type: "Hybrid",
        duration: "3-6 Months",
        deadline: "2024-06-30",
        description: "Work on real-world projects with our core platform team.",
        match: 85,
        matchedSubjects: 12,
        totalRequired: 14,
        missing: ["Cloud Computing", "System Analysis"],
        color: "indigo"
    },
];

export const MOCK_JOBS = [
    {
        id: 1,
        role: "Junior Software Engineer",
        company: "Global Systems Ltd",
        location: "Makati City",
        type: "On-site",
        employment: "Full-time",
        experience: "Entry-level",
        deadline: "2024-08-01",
        description: "Build and maintain enterprise-grade applications using C# and .NET.",
        match: 90,
        missing: ["Enterprise Patterns"],
        color: "cyan"
    },
];

export const MOCK_SAVED_ITEMS = {
    internships: [
        { id: 1, role: "UI/UX Intern", company: "Design Pro" },
    ],
    jobs: [
        { id: 1, role: "Backend Developer", company: "FinTech Ph" },
    ]
};

export const MOCK_SUBJECTS_CATALOG = [
    { subject_id: 1, subject_name: "Intro to Computing", year_level: 1, semester: 1 },
    { subject_id: 2, subject_name: "Programming 1", year_level: 1, semester: 1 },
    { subject_id: 4, subject_name: "Data Structures", year_level: 2, semester: 1 },
];

export const MOCK_ALUMNI_STATS = {
    total_alumni: 452,
    avg_months_to_land_job: 3.4,
    hired_in_6_months_percent: 88,
    companies: 126
};

export const MOCK_ALUMNI_CARDS = [
    {
        id: 1,
        name: "Juan Dela Cruz",
        program: "BSIT",
        batch: "2022",
        graduatedYear: 2022,
        currentRole: "Fullstack Developer",
        company: "Accenture",
        location: "Taguig City",
        salary: "₱45,000",
        monthsToLand: 2,
        favoriteSubjects: ["Web Development", "Database Systems"],
        skills: ["React", "Java", "SQL"],
        internships: [{ role_title: "Web Intern", company_name: "TMC Solutions", year: 2021 }],
        advice: "Focus on your logic and don't be afraid to fail. TMC's labs are great for practice!",
        color: "indigo"
    },
];

export const MOCK_TREND_SNAPSHOT = {
    year: 2024,
    active_trends: 8,
};

export const MOCK_TRENDS_DATA = [
    {
        id: 1,
        title: "Cybersecurity & InfoSec",
        icon: "🛡️",
        growth: "+45%",
        demandLevel: "Very High",
        salaryMin: 55000,
        salaryMax: 95000,
        description: "Protecting organizational assets from digital attacks and data breaches.",
        topRoles: ["Security Analyst", "Penetration Tester", "SOC Engineer"],
        topSkills: ["Cloud Security", "SIEM", "Python", "Ethical Hacking"],
        companies: ["Globe", "GCash", "Smart", "Trend Micro"],
        insight: "Cybersecurity demand is skyrocketing as Philippine companies digitize operations and prioritize data privacy compliance.",
        color: "red"
    },
];

export const MOCK_RESOURCES = [
    {
        resource_id: 1,
        type: "Certification",
        title: "AWS Certified Cloud Practitioner",
        provider: "Amazon Web Services",
        url: "https://aws.amazon.com/",
        description: "Foundational cloud certification covering core services and security.",
        difficulty: "Beginner",
        cost_type: "Paid",
        certificate_offered: true,
        color: "indigo"
    },
    {
        resource_id: 2,
        type: "Course",
        title: "React Native: The Practical Guide",
        provider: "Udemy",
        url: "https://www.udemy.com/",
        description: "Learn to build cross-platform mobile apps with React Native.",
        difficulty: "Intermediate",
        cost_type: "Paid",
        certificate_offered: true,
        color: "violet"
    },
    {
        resource_id: 3,
        type: "Roadmap",
        title: "Fullstack Developer Roadmap",
        provider: "Roadmap.sh",
        url: "https://roadmap.sh/",
        description: "Step-by-step guide to becoming a modern fullstack developer.",
        difficulty: "Beginner",
        cost_type: "Free",
        certificate_offered: false,
        color: "blue"
    }
];
