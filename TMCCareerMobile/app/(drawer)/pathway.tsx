import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/api';
import axios from 'axios';

const themeColor = "#6366f1"; // Indigo

export default function CareerPathwayScreen() {
    const { student, token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPathway = async () => {
            try {
                const res = await axios.get(`${API_URL}/students/me/pathway`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error("Error fetching pathway:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPathway();
    }, [token]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </ThemedView>
        );
    }

    if (!data || !data.target_career) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.pageTitle}>No Goal Set</Text>
                <Text style={styles.pageSubtitle}>Set a career goal to see your roadmap.</Text>
            </ThemedView>
        );
    }

    const career = data.target_career;

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Career Pathway</Text>
                    <Text style={styles.pageSubtitle}>
                        Your personalized roadmap for <Text style={styles.highlight}>{career.icon} {career.title}</Text>.
                    </Text>
                </View>

                {/* Career Header Card */}
                <View style={styles.careerCard}>
                    <View style={styles.careerHeader}>
                        <View style={styles.iconBox}>
                            <Text style={styles.careerEmoji}>{career.icon}</Text>
                        </View>
                        <View style={styles.careerMeta}>
                            <Text style={styles.careerTitle}>{career.title}</Text>
                            <Text style={styles.salaryText}>
                                ₱{(career.salary_range.min / 1000).toFixed(0)}k – ₱{(career.salary_range.max / 1000).toFixed(0)}k/mo
                            </Text>
                        </View>
                        <View style={styles.demandBadge}>
                            <Text style={styles.demandText}>{career.demand_level} Demand</Text>
                        </View>
                    </View>

                    {/* Skills */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoHeading}>⚡ Skills Needed</Text>
                            <View style={styles.tagContainer}>
                                {career.skills?.map((skill: string, i: number) => (
                                    <View key={i} style={styles.skillTag}>
                                        <Text style={styles.skillTagText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Roadmap Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>🗺️ Your Year-by-Year Roadmap</Text>
                    <View style={styles.timelineContainer}>
                        {/* Vertical Line */}
                        <View style={styles.timelineLine} />

                        {data.roadmap?.map((step: any, index: number) => (
                            <View key={index} style={styles.timelineStep}>
                                {/* Dot */}
                                <View style={styles.timelineDot}>
                                    <Text style={styles.dotText}>{index + 1}</Text>
                                </View>

                                {/* Content Card */}
                                <View style={[styles.stepCard, index === 0 && styles.activeStepCard]}>
                                    <View style={styles.stepHeader}>
                                        <View style={styles.yearBadge}>
                                            <Text style={styles.yearText}>Year {step.year_level}</Text>
                                        </View>
                                        <Text style={styles.progressCounter}>
                                            {step.progress?.completed}/{step.progress?.total}
                                        </Text>
                                    </View>

                                    <View style={styles.subjectList}>
                                        {step.subjects?.map((subject: any, sIdx: number) => (
                                            <View
                                                key={sIdx}
                                                style={[
                                                    styles.subjectTag,
                                                    subject.completed ? styles.completedTag : styles.pendingTag
                                                ]}
                                            >
                                                {subject.completed && <Ionicons name="checkmark-circle" size={12} color="#10b981" style={{ marginRight: 4 }} />}
                                                <Text style={[
                                                    styles.subjectText,
                                                    subject.completed ? styles.completedText : styles.pendingText
                                                ]}>
                                                    {subject.name}
                                                </Text>
                                            </View>
                                        ))}
                                        {index === data.roadmap.length - 1 && (
                                            <View style={styles.gapAdvice}>
                                                <Text style={styles.gapText}>🎯 Finish your thesis to close your gap.</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    highlight: {
        color: '#a5b4fc',
        fontWeight: '600',
    },
    careerCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 24,
    },
    careerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
        marginBottom: 20,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    careerEmoji: {
        fontSize: 32,
    },
    careerMeta: {
        flex: 1,
    },
    careerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    salaryText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    demandBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    demandText: {
        color: '#a5b4fc',
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoGrid: {
        flexDirection: 'row',
        marginTop: 0,
    },
    infoCol: {
        flex: 1,
    },
    infoHeading: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    skillTagText: {
        color: '#a5b4fc',
        fontSize: 12,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    timelineContainer: {
        paddingLeft: 4,
    },
    timelineLine: {
        position: 'absolute',
        left: 20,
        top: 20,
        bottom: 0,
        width: 1,
        backgroundColor: '#1f2937',
    },
    timelineStep: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timelineDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4f46e5',
        borderWidth: 4,
        borderColor: '#030712',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    dotText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepCard: {
        flex: 1,
        marginLeft: 16,
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    activeStepCard: {
        borderColor: 'rgba(99, 102, 241, 0.4)',
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    yearBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    yearText: {
        color: '#a5b4fc',
        fontSize: 11,
        fontWeight: 'bold',
    },
    progressCounter: {
        color: '#6b7280',
        fontSize: 11,
    },
    subjectList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    subjectTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    completedTag: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.15)',
    },
    pendingTag: {
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
        borderColor: 'rgba(75, 85, 99, 0.2)',
    },
    subjectText: {
        fontSize: 11,
    },
    completedText: {
        color: '#10b981',
    },
    pendingText: {
        color: '#9ca3af',
    },
    gapAdvice: {
        marginTop: 12,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
    },
    gapText: {
        color: '#9ca3af',
        fontSize: 11,
    },
});
