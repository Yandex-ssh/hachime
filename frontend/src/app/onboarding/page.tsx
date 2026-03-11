"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── SUBJECTS DATABASE ────────────────────────────────────────────────────────
const subjectsByProgram: Record<string, Record<string, string[]>> = {
    BSIT: {
        "1st Year": [
            "Computer Concepts and Fundamentals",
            "Computer Programming 1",
            "Application and Productivity Tools",
            "HTML and Internet Fundamentals",
            "Computer Programming 2",
            "Human-Computer Interaction",
            "Mathematics in the Modern World",
            "Advanced Algebra with Trigonometry",
            "Purposive Communication",
            "Understanding the Self",
            "Ethics",
            "The Contemporary World",
            "Art Appreciation",
            "Readings in Philippine History",
        ],
        "2nd Year": [
            "Data Structures and Algorithms",
            "Object-Oriented Programming 1",
            "Object-Oriented Programming 2",
            "Operating System",
            "Database System",
            "System Analysis and Design",
            "Discrete Math",
            "Advanced Statistics",
            "Prof. Ethics in IT w/ Quality Consciousness",
            "Technical Writing and Presentation Skills in IT",
            "Computer-Mediated Communication",
            "Science Technology and Society",
            "Life and Works of Rizal",
            "The Entrepreneurial Mind",
            "Environmental Science",
            "Gender and Society",
        ],
        "3rd Year": [
            "Web Information System",
            "ICT Trends",
            "C#.Net Programming",
            "VB.Net Programming",
            "Project Management for IT",
            "Applications Development and Emerging Technologies",
            "Data Communication & Networking",
            "System Management Administration",
            "Multimedia Concepts",
            "Software Engineering",
            "Advanced Physics",
            "Principles of Management w/ Personnel & Human Resource",
            "IT Elective 1",
            "IT Elective 2",
            "Methodology",
        ],
        "4th Year": [
            "Computer Graphics Design",
            "Video Editing",
            "Advanced Networking",
            "Capstone Project 1",
            "Capstone Project 2",
            "Practicum 1",
            "Practicum 2",
            "IT Elective 3",
            "IT Elective 4",
            "Free Elective 1",
            "Free Elective 2",
            "Free Elective 3",
        ],
    },
    BSCRIM: {
        "1st Year": [
            "Criminology 1 - Introduction to Criminology",
            "CLJ 1 - Introduction to Philippine Criminal Justice System",
            "GE 1 - Purposive Communication",
            "GE 2 - Readings in Philippine History",
            "GE 3 - Mathematics in the Modern World",
            "GE 4 - Art Appreciation",
            "GE 5 - Understanding the Self",
            "GE 6 - Ethics",
            "GE 7 - The Contemporary World",
            "GE 8 - Science, Technology and Society",
            "GE Elec 1 - Gender and Society",
            "GE Elec 2 - Environmental Science",
            "IT 100 - Intro to Computer with Word Processing",
            "PES 1 - Review of TMC Student Manual",
            "PES 2 - Peace and Values Education",
        ],
        "2nd Year": [
            "Criminology 2 - Theories of Crime Causation",
            "Criminology 3 - Human Behavior and Victimology",
            "CA 1 - Institutional Corrections",
            "CDI 1 - Fundamentals of Criminal Investigation",
            "CDI 2 - Specialized Crime Investigation 1 with Legal Medicine",
            "CFLM 1 - Character Formation 1 (Nationalism and Patriotism)",
            "LEA 1 - Law Enforcement Organization and Administration",
            "LEA 2 - Comparative Models in Policing",
            "LEA 3 - Introduction to Industrial Security Concepts",
            "Forensic 1 - Forensic Photography",
            "Forensic 2 - Personal Identification Techniques",
            "AdGe 1 - Logic (Deductive and Inductive Reasoning)",
            "AdGe 2 - General Chemistry (Organic)",
            "GE 9 - Life and Works of Rizal",
            "GE 10 - Komunikasyon sa Akademikong Filipino",
            "GE 11 - Masining na Pagpapahayag",
            "GE Elec 3 - The Entrepreneurial Mind",
        ],
        "3rd Year": [
            "Criminology 4 - Professional Conduct and Ethical Standards",
            "Criminology 5 - Juvenile Delinquency and Juvenile Justice System",
            "CCJS - Comparative Criminal Justice System",
            "CA 2 - Non-Institutional Corrections",
            "CDI 3 - Specialized Criminal Investigation 2",
            "CDI 4 - Traffic Management and Accident Investigation",
            "CDI 5 - Technical English 1 (Investigative Report Writing)",
            "CDI 6 - Fire Protection and Arson Investigation",
            "CFLM 2 - Character Formation 2 (Leadership)",
            "CLJ 2 - Human Rights Education",
            "CLJ 3 - Criminal Law (Book 1)",
            "CLJ 4 - Criminal Law (Book 2)",
            "CMM - Crime Mapping and Measurement",
            "Forensic 3 - Forensic Chemistry and Toxicology",
            "Forensic 4 - Questioned Document Examination",
            "Forensic 5 - Lie Detection Techniques",
            "LEA 4 - Law Enforcement Operations and Planning",
        ],
        "4th Year": [
            "Criminology 6 - Dispute Resolution and Crises/Incidents Management",
            "Criminology 7 - Criminological Research 1",
            "Criminology 8 - Criminological Research 2 (Thesis)",
            "CA 3 - Therapeutic Modalities",
            "CDI 7 - Vice and Drug Education and Control",
            "CDI 8 - Technical English 2 (Legal Forms)",
            "CDI 9 - Introduction to Cybercrime and Environmental Laws",
            "CLJ 5 - Evidence",
            "CLJ 6 - Criminal Procedure and Court Testimony",
            "CP 1 - Internship (On-the-Job Training 1)",
            "CP 2 - Internship (On-the-Job Training 2)",
            "Forensic 6 - Forensic Ballistics",
        ],
    },
    BSED: {
        "1st Year": [
            "Introduction to Education",
            "Child and Adolescent Development",
            "Purposive Communication",
            "Mathematics in the Modern World",
            "Understanding the Self",
            "Readings in Philippine History",
            "Art Appreciation",
            // TODO: Replace with actual BSED subjects
        ],
        "2nd Year": [
            "Foundations of Education",
            "The Teaching Profession",
            "Curriculum Development",
            "Assessment in Learning 1",
            "Life and Works of Rizal",
            "Ethics",
            // TODO: Replace with actual BSED subjects
        ],
        "3rd Year": [
            "Field Study 1",
            "Field Study 2",
            "Assessment in Learning 2",
            "Instructional Materials Development",
            "Educational Technology",
            // TODO: Replace with actual BSED subjects
        ],
        "4th Year": [
            "Student Teaching (Practice Teaching)",
            "Research in Education",
            "School Management",
            // TODO: Replace with actual BSED subjects
        ],
    },
    BSOA: {
        "1st Year": [
            "Business Communication 1",
            "Office Systems and Procedures",
            "Keyboarding and Document Processing",
            "Mathematics in the Modern World",
            "Purposive Communication",
            // TODO: Replace with actual BSOA subjects
        ],
        "2nd Year": [
            "Business Communication 2",
            "Records Management",
            "Office Management",
            "Accounting for Business",
            "Human Resource Management",
            // TODO: Replace with actual BSOA subjects
        ],
        "3rd Year": [
            "Legal Office Procedures",
            "Medical Office Procedures",
            "Executive Secretarial Duties",
            "Desktop Publishing",
            // TODO: Replace with actual BSOA subjects
        ],
        "4th Year": [
            "Practicum / On-the-Job Training",
            "Research Methods",
            "Capstone Project",
            // TODO: Replace with actual BSOA subjects
        ],
    },
    "BSPOL.SCI": {
        "1st Year": [
            "Introduction to Political Science",
            "Philippine Government and Constitution",
            "Purposive Communication",
            "Mathematics in the Modern World",
            "Readings in Philippine History",
            // TODO: Replace with actual BSPOL.SCI subjects
        ],
        "2nd Year": [
            "Comparative Politics",
            "Political Theory",
            "International Relations",
            "Public Administration",
            "Life and Works of Rizal",
            // TODO: Replace with actual BSPOL.SCI subjects
        ],
        "3rd Year": [
            "Philippine Political Parties",
            "Local Government and Administration",
            "Public Policy Analysis",
            "Political Economy",
            // TODO: Replace with actual BSPOL.SCI subjects
        ],
        "4th Year": [
            "Research in Political Science",
            "Internship / Practicum",
            "Capstone / Thesis Writing",
            // TODO: Replace with actual BSPOL.SCI subjects
        ],
    },
};

const programs = ["BSIT", "BSCRIM", "BSED", "BSOA", "BSPOL.SCI"];
const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [program, setProgram] = useState("");
    const [yearLevel, setYearLevel] = useState("");
    const [finishedSubjects, setFinishedSubjects] = useState<string[]>([]);
    const [likedSubjects, setLikedSubjects] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    // Get subjects based on selected program and year level (all years up to selected)
    const getAvailableSubjects = () => {
        if (!program || !yearLevel) return [];
        const programSubjects = subjectsByProgram[program] || {};
        const yearIndex = yearLevels.indexOf(yearLevel);
        let subjects: string[] = [];
        yearLevels.slice(0, yearIndex + 1).forEach((year) => {
            subjects = [...subjects, ...(programSubjects[year] || [])];
        });
        return subjects;
    };

    const availableSubjects = getAvailableSubjects();

    const toggleFinished = (subject: string) => {
        setFinishedSubjects((prev) =>
            prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
        );
        // Also remove from liked if unchecked from finished
        if (likedSubjects.includes(subject)) {
            setLikedSubjects((prev) => prev.filter((s) => s !== subject));
        }
    };

    const toggleLiked = (subject: string) => {
        if (likedSubjects.includes(subject)) {
            setLikedSubjects((prev) => prev.filter((s) => s !== subject));
        } else if (likedSubjects.length < 5) {
            setLikedSubjects((prev) => [...prev, subject]);
        }
    };

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Final step - save to backend
            try {
                setSaving(true);

                const studentData = JSON.parse(localStorage.getItem("student") || "{}");

                const response = await fetch("http://localhost:4000/students/subjects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        student_id: studentData.student_id,
                        finished_subject_ids: finishedSubjects,
                        liked_subject_ids: likedSubjects,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to save subjects");
                }

                // Success - go to dashboard
                router.push("/dashboard");
            } catch (error) {
                console.error("Error saving subjects:", error);
                alert("Failed to save your selections. Please try again.");
            } finally {
                setSaving(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceed = () => {
        if (step === 1) return program !== "";
        if (step === 2) return yearLevel !== "";
        if (step === 3) return finishedSubjects.length > 0;
        if (step === 4) return likedSubjects.length > 0;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                            ✦
                        </div>
                        <span className="text-white font-bold text-lg">TMC Career Pathway</span>
                    </div>
                    <p className="text-gray-400 text-sm">Step {step} of {totalSteps}</p>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Step indicators */}
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span className={step >= 1 ? "text-indigo-400" : ""}>Program</span>
                        <span className={step >= 2 ? "text-indigo-400" : ""}>Year Level</span>
                        <span className={step >= 3 ? "text-indigo-400" : ""}>Subjects Done</span>
                        <span className={step >= 4 ? "text-indigo-400" : ""}>Favorites</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

                    {/* ── STEP 1: Program ── */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">What's your program?</h2>
                            <p className="text-gray-400 text-sm mb-6">Select your current academic program at TMC.</p>
                            <div className="flex flex-col gap-3">
                                {programs.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setProgram(p)}
                                        className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition
                      ${program === p
                                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500/50 hover:text-white"
                                            }`}
                                    >
                                        <span className="font-bold">{p}</span>
                                        <span className="ml-2 text-gray-500 font-normal text-xs">
                                            {p === "BSIT" && "— Bachelor of Science in Information Technology"}
                                            {p === "BSCRIM" && "— Bachelor of Science in Criminology"}
                                            {p === "BSED" && "— Bachelor of Science in Education"}
                                            {p === "BSOA" && "— Bachelor of Science in Office Administration"}
                                            {p === "BSPOL.SCI" && "— Bachelor of Science in Political Science"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Year Level ── */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">What year are you in?</h2>
                            <p className="text-gray-400 text-sm mb-6">This helps us show you the right subjects and career paths.</p>
                            <div className="flex flex-col gap-3">
                                {yearLevels.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setYearLevel(y)}
                                        className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition
                      ${yearLevel === y
                                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500/50 hover:text-white"
                                            }`}
                                    >
                                        <span className="font-bold">{y}</span>
                                        <span className="ml-2 text-gray-500 font-normal text-xs">
                                            {y === "1st Year" && "— Just getting started"}
                                            {y === "2nd Year" && "— Building foundations"}
                                            {y === "3rd Year" && "— Deepening expertise"}
                                            {y === "4th Year" && "— Almost there!"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Finished Subjects ── */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">What subjects have you finished?</h2>
                            <p className="text-gray-400 text-sm mb-2">Check all subjects you've already completed.</p>
                            <p className="text-indigo-400 text-xs mb-5">
                                {finishedSubjects.length} subject{finishedSubjects.length !== 1 ? "s" : ""} selected
                            </p>

                            {/* Select All */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setFinishedSubjects(availableSubjects)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                                >
                                    Select all
                                </button>
                                <span className="text-gray-600">·</span>
                                <button
                                    onClick={() => { setFinishedSubjects([]); setLikedSubjects([]); }}
                                    className="text-xs text-gray-500 hover:text-gray-300 transition"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                                {availableSubjects.map((subject) => (
                                    <button
                                        key={subject}
                                        onClick={() => toggleFinished(subject)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-center gap-3
                      ${finishedSubjects.includes(subject)
                                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition
                      ${finishedSubjects.includes(subject)
                                                ? "bg-indigo-500 border-indigo-500"
                                                : "border-gray-600"
                                            }`}>
                                            {finishedSubjects.includes(subject) && (
                                                <span className="text-white text-xs">✓</span>
                                            )}
                                        </div>
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Favorite Subjects ── */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Which subjects do you enjoy most?</h2>
                            <p className="text-gray-400 text-sm mb-2">
                                Pick up to <span className="text-indigo-400 font-semibold">5 subjects</span> you genuinely enjoy — this helps us find your best career match.
                            </p>
                            <p className="text-indigo-400 text-xs mb-5">
                                {likedSubjects.length}/5 selected
                            </p>

                            {finishedSubjects.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    Go back and select your finished subjects first.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                                    {finishedSubjects.map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => toggleLiked(subject)}
                                            disabled={!likedSubjects.includes(subject) && likedSubjects.length >= 5}
                                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-center gap-3
                        ${likedSubjects.includes(subject)
                                                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                                    : !likedSubjects.includes(subject) && likedSubjects.length >= 5
                                                        ? "bg-gray-800/50 border-gray-800 text-gray-600 cursor-not-allowed"
                                                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition
                        ${likedSubjects.includes(subject)
                                                    ? "bg-indigo-500 border-indigo-500"
                                                    : "border-gray-600"
                                                }`}>
                                                {likedSubjects.includes(subject) && (
                                                    <span className="text-white text-xs">♥</span>
                                                )}
                                            </div>
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-7">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl py-2.5 text-sm transition border border-gray-700"
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!canProceed() || saving}
                            className={`flex-1 font-semibold rounded-xl py-2.5 text-sm transition
                ${canProceed() && !saving
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                    : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                                }`}
                        >
                            {saving
                                ? "Saving..."
                                : step === totalSteps
                                    ? "View My Career Paths →"
                                    : "Continue →"}
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-600 mt-5">
                    You can always update your profile later from your dashboard.
                </p>
            </div>
        </div>
    );
}