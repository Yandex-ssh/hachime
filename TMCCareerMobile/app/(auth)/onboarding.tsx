import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { subjectsByProgram, yearLevels } from '@/constants/subjects';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/constants/api';
import axios from 'axios';
import { useEffect } from 'react';

type Program = {
    program_id: number;
    program_code: string;
    program_name: string;
};

type Subject = {
    subject_id: number;
    subject_code: string;
    subject_name: string;
};

export default function OnboardingScreen() {
    const { student, token, completeOnboarding, updateStudent, isOnboarded } = useAuth();
    const [step, setStep] = useState(1);
    const [programId, setProgramId] = useState<number | null>(null);
    const [programsList, setProgramsList] = useState<Program[]>([]);
    const [yearLevel, setYearLevel] = useState("");
    const [semester, setSemester] = useState<number | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [finishedSubjects, setFinishedSubjects] = useState<string[]>([]);
    const [likedSubjects, setLikedSubjects] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    useEffect(() => {
        if (isOnboarded) {
            router.replace('/(drawer)' as any);
        }
    }, [isOnboarded]);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await axios.get(`${API_URL}/programs`);
                setProgramsList(res.data);
            } catch (err) {
                console.error("Error fetching programs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (programId && yearLevel && semester && programsList.length > 0) {
            const programCode = programsList.find(p => p.program_id === programId)?.program_code;
            if (!programCode) return;

            const programSubjects = subjectsByProgram[programCode] || {};
            const yearIndex = yearLevels.indexOf(yearLevel);
            
            let subjects: string[] = [];
            
            // 1) Add all subjects from previous years (both semesters)
            yearLevels.slice(0, yearIndex).forEach((year) => {
                const yearData = programSubjects[year] || {};
                subjects = [...subjects, ...(yearData[1] || []), ...(yearData[2] || [])];
            });

            // 2) Add subjects from current year up to selected semester
            const currentYearData = programSubjects[yearLevel] || {};
            if (semester >= 1) {
                subjects = [...subjects, ...(currentYearData[1] || [])];
            }
            if (semester >= 2) {
                subjects = [...subjects, ...(currentYearData[2] || [])];
            }
            
            setAvailableSubjects(
                subjects.map((name, index) => ({
                    subject_id: index, // Temporary ID for React keys
                    subject_code: "", 
                    subject_name: name
                }))
            );
        }
    }, [programId, yearLevel, semester, programsList]);

    const toggleFinished = (subjectName: string) => {
        setFinishedSubjects((prev) =>
            prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
        );
        if (likedSubjects.includes(subjectName)) {
            setLikedSubjects((prev) => prev.filter((s) => s !== subjectName));
        }
    };

    const toggleLiked = (subjectName: string) => {
        if (likedSubjects.includes(subjectName)) {
            setLikedSubjects((prev) => prev.filter((s) => s !== subjectName));
        } else if (likedSubjects.length < 5) {
            setLikedSubjects((prev) => [...prev, subjectName]);
        }
    };

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            setSaving(true);
            try {
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };

                // 1) Update profile with program and year
                const yearIdx = yearLevels.indexOf(yearLevel) + 1;
                await axios.patch(`${API_URL}/students/me`, {
                    program_id: programId,
                    year_level: yearIdx,
                    semester: semester
                }, authHeader);

                // 2) Save subjects
                await axios.post(`${API_URL}/students/subjects/by-names`, {
                    finished_subject_names: finishedSubjects,
                    liked_subject_names: likedSubjects
                }, authHeader);

                // 3) Refetch the student profile to update context so the dashboard renders actual totalSubjects
                const profileRes = await axios.get(`${API_URL}/students/me`, authHeader);
                await updateStudent(profileRes.data);

                await completeOnboarding();
                router.replace('/(drawer)' as any);
            } catch (error) {
                console.error("Error saving onboarding data:", error);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceed = () => {
        if (step === 1) return programId !== null;
        if (step === 2) return yearLevel !== "";
        if (step === 3) return semester !== null;
        if (step === 4) return finishedSubjects.length > 0;
        if (step === 5) return likedSubjects.length > 0;
        return false;
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <View style={styles.header}>
                    <View style={styles.brandRow}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoSymbol}>✦</Text>
                        </View>
                        <Text style={styles.brandName}>TMC Career Pathway</Text>
                    </View>
                    <Text style={styles.stepIndicator}>Step {step} of {totalSteps}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.stepLabels}>
                        <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Program</Text>
                        <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Year</Text>
                        <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Sem</Text>
                        <Text style={[styles.stepLabel, step >= 4 && styles.stepLabelActive]}>Done</Text>
                        <Text style={[styles.stepLabel, step >= 5 && styles.stepLabelActive]}>Likes</Text>
                    </View>
                </View>

                <View style={[styles.card, (step === 3 || step === 4 || step === 5) && { flex: 1, marginBottom: 20 }]}>
                    {step === 1 && (
                        <View>
                            <Text style={styles.title}>What's your program?</Text>
                            <Text style={styles.subtitle}>Select your current academic program.</Text>
                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                {programsList.map((p) => (
                                    <TouchableOpacity
                                        key={p.program_id}
                                        onPress={() => setProgramId(p.program_id)}
                                        style={[styles.optionItem, programId === p.program_id && styles.optionItemActive]}
                                    >
                                        <Text style={[styles.optionTitle, programId === p.program_id && styles.optionTextActive]}>{p.program_code}</Text>
                                        <Text style={styles.optionSub}>{p.program_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            <Text style={styles.title}>What year are you in?</Text>
                            <Text style={styles.subtitle}>This helps us show relevant subjects.</Text>
                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                {yearLevels.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        onPress={() => setYearLevel(y)}
                                        style={[styles.optionItem, yearLevel === y && styles.optionItemActive]}
                                    >
                                        <Text style={[styles.optionTitle, yearLevel === y && styles.optionTextActive]}>{y}</Text>
                                        <Text style={styles.optionSub}>{getYearDescription(y)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            <Text style={styles.title}>Which semester?</Text>
                            <Text style={styles.subtitle}>Select your current semester.</Text>
                            <View style={styles.optionsList}>
                                {[1, 2].map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => setSemester(s)}
                                        style={[styles.optionItem, semester === s && styles.optionItemActive]}
                                    >
                                        <Text style={[styles.optionTitle, semester === s && styles.optionTextActive]}>
                                            {s === 1 ? "1st Semester" : "2nd Semester"}
                                        </Text>
                                        <Text style={styles.optionSub}>
                                            {s === 1 ? "First half of the year" : "Second half of the year"}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Subjects finished?</Text>
                            <Text style={styles.subtitle}>Check all subjects you've completed.</Text>
                            <View style={styles.selectionStats}>
                                <Text style={styles.statsText}>{finishedSubjects.length} subjects selected</Text>
                                <TouchableOpacity onPress={() => { setFinishedSubjects([]); setLikedSubjects([]); }}>
                                    <Text style={styles.bulkActionText}>Clear all</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.subjectsList} showsVerticalScrollIndicator={true}>
                                {yearLevels.map((year) => {
                                    // Get program code for subject lookup
                                    const programCode = programsList.find(p => p.program_id === programId)?.program_code;
                                    if (!programCode) return null;

                                    const programSubjects = subjectsByProgram[programCode] || {};
                                    const yearData = programSubjects[year] || {};
                                    const yearSubjects = [...(yearData[1] || []), ...(yearData[2] || [])]
                                        .filter(name => availableSubjects.some(s => s.subject_name === name));

                                    if (yearSubjects.length === 0) return null;

                                    const allChecked = yearSubjects.every(name => finishedSubjects.includes(name));

                                    const toggleYear = () => {
                                        if (allChecked) {
                                            setFinishedSubjects(prev => prev.filter(s => !yearSubjects.includes(s)));
                                            setLikedSubjects(prev => prev.filter(s => !yearSubjects.includes(s)));
                                        } else {
                                            setFinishedSubjects(prev => {
                                                const others = prev.filter(s => !yearSubjects.includes(s));
                                                return [...others, ...yearSubjects];
                                            });
                                        }
                                    };

                                    return (
                                        <View key={year} style={styles.yearSection}>
                                            <View style={styles.yearHeader}>
                                                <Text style={styles.yearHeaderText}>{year}</Text>
                                                <TouchableOpacity onPress={toggleYear} style={styles.yearSelectBtn}>
                                                    <Text style={styles.yearSelectBtnText}>
                                                        {allChecked ? "Unselect Year" : "Select Year"}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            {yearSubjects.map((subjectName) => (
                                                <TouchableOpacity
                                                    key={subjectName}
                                                    onPress={() => toggleFinished(subjectName)}
                                                    style={[styles.subjectItem, finishedSubjects.includes(subjectName) && styles.subjectItemActive]}
                                                >
                                                    <View style={[styles.checkbox, finishedSubjects.includes(subjectName) && styles.checkboxActive]}>
                                                        {finishedSubjects.includes(subjectName) && <Text style={styles.checkMark}>✓</Text>}
                                                    </View>
                                                    <Text style={[styles.subjectText, finishedSubjects.includes(subjectName) && styles.subjectTextActive]}>
                                                        {subjectName}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {step === 5 && (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Subjects you enjoy?</Text>
                            <Text style={styles.subtitle}>Pick between 1 to 5 subjects you enjoy most.</Text>
                            <Text style={styles.statsText}>{likedSubjects.length}/5 selected</Text>
                            <ScrollView style={styles.subjectsList} showsVerticalScrollIndicator={true}>
                                {finishedSubjects.map((subjectName) => (
                                    <TouchableOpacity
                                        key={subjectName}
                                        onPress={() => toggleLiked(subjectName)}
                                        disabled={!likedSubjects.includes(subjectName) && likedSubjects.length >= 5}
                                        style={[
                                            styles.subjectItem,
                                            likedSubjects.includes(subjectName) && styles.subjectItemActiveLiked,
                                            !likedSubjects.includes(subjectName) && likedSubjects.length >= 5 && styles.subjectItemDisabled
                                        ]}
                                    >
                                        <View style={styles.heartIcon}>
                                            <Text style={[styles.heartSymbol, likedSubjects.includes(subjectName) && styles.heartSymbolActive]}>
                                                {likedSubjects.includes(subjectName) ? "♥" : "♡"}
                                            </Text>
                                        </View>
                                        <Text style={[styles.subjectText, likedSubjects.includes(subjectName) && styles.subjectTextActive]}>
                                            {subjectName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.navRow}>
                        {step > 1 && (
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleNext}
                            disabled={!canProceed() || saving}
                            style={[styles.nextButton, (!canProceed() || saving) && styles.buttonDisabled]}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.nextButtonText}>
                                    {step === totalSteps ? "Finish →" : "Continue →"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.footerNote}>You can update your profile later from the dashboard.</Text>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

function getProgramFullName(p: string) {
    if (p === "BSIT") return "Bachelor of Science in Information Technology";
    if (p === "BSCRIM") return "Bachelor of Science in Criminology";
    if (p === "BSED") return "Bachelor of Science in Education";
    if (p === "BSOA") return "Bachelor of Science in Office Administration";
    if (p === "BSPOL.SCI") return "Bachelor of Science in Political Science";
    return "";
}

function getYearDescription(y: string) {
    if (y === "1st Year") return "Just getting started";
    if (y === "2nd Year") return "Building foundations";
    if (y === "3rd Year") return "Deepening expertise";
    if (y === "4th Year") return "Almost there!";
    return "";
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712',
    },
    keyboardView: {
        flex: 1,
        padding: 16,
        paddingTop: 40,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    logoBox: {
        width: 32,
        height: 32,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoSymbol: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    brandName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepIndicator: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 8,
    },
    progressBarBg: {
        width: '100%',
        height: 6,
        backgroundColor: '#1f2937',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: 6,
        backgroundColor: '#6366f1',
        borderRadius: 3,
    },
    stepLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    stepLabel: {
        fontSize: 10,
        color: '#4b5563',
    },
    stepLabelActive: {
        color: '#818cf8',
    },
    card: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 20,
    },
    optionsList: {
        maxHeight: 300,
    },
    optionItem: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#374151',
    },
    optionItemActive: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: '#4f46e5',
    },
    optionTitle: {
        color: '#d1d5db',
        fontSize: 15,
        fontWeight: 'bold',
    },
    optionTextActive: {
        color: '#a5b4fc',
    },
    optionSub: {
        color: '#6b7280',
        fontSize: 11,
        marginTop: 2,
    },
    selectionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsText: {
        color: '#818cf8',
        fontSize: 12,
        fontWeight: '600',
    },
    bulkActions: {
        flexDirection: 'row',
        gap: 6,
    },
    bulkActionText: {
        color: '#6b7280',
        fontSize: 12,
    },
    bulkActionSep: {
        color: '#4b5563',
        fontSize: 12,
    },
    subjectsList: {
        flex: 1,
    },
    subjectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#374151',
    },
    subjectItemActive: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: '#4f46e5',
    },
    subjectItemActiveLiked: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: '#ef4444',
    },
    subjectItemDisabled: {
        opacity: 0.5,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#4b5563',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    checkMark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    heartIcon: {
        marginRight: 12,
    },
    heartSymbol: {
        fontSize: 18,
        color: '#4b5563',
    },
    heartSymbolActive: {
        color: '#ef4444',
    },
    subjectText: {
        color: '#d1d5db',
        fontSize: 14,
        flex: 1,
    },
    subjectTextActive: {
        color: '#fff',
    },
    navRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    backButtonText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#1f2937',
        opacity: 0.5,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    yearSection: {
        marginBottom: 20,
    },
    yearHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
        marginBottom: 10,
    },
    yearHeaderText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: 'bold',
    },
    yearSelectBtn: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    yearSelectBtnText: {
        color: '#818cf8',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footerNote: {
        color: '#4b5563',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 16,
    },
});
