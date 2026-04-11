import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/api';
import axios from 'axios';

const { width } = Dimensions.get('window');

type SkillLevel = 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
type Priority = 'high' | 'medium' | 'low';

const levelColors: Record<SkillLevel, string> = {
    None: "#f87171",
    Beginner: "#fbbf24",
    Intermediate: "#3b82f6",
    Advanced: "#10b981",
};

const levelBar: Record<SkillLevel, string> = {
    None: "0%",
    Beginner: "25%",
    Intermediate: "50%",
    Advanced: "100%",
};

const priorityEmojis: Record<Priority, string> = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
};

export default function SkillsScreen() {
    const { student, token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await axios.get(`${API_URL}/students/me/skills`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error("Error fetching skills:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
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
                <Text style={styles.pageSubtitle}>Set a career goal to see your skill plan.</Text>
            </ThemedView>
        );
    }

    // Flatten skills for filtering logic
    const allSkills = data.categories.flatMap((cat: any) =>
        cat.skills.map((s: any) => ({ ...s, category: cat.label }))
    );

    const filteredSkills = allSkills.filter((skill: any) => {
        const catMatch = activeCategory === "all" || skill.category === data.categories.find((c: any) => c.id === activeCategory)?.label;
        const priorityMatch = priorityFilter === "all" || skill.priority === priorityFilter;
        return catMatch && priorityMatch;
    });

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Skills to Improve</Text>
                    <Text style={styles.pageSubtitle}>
                        Personalized for your goal: <Text style={styles.highlight}>{data.target_career.icon || '💻'} {data.target_career.title}</Text>
                    </Text>
                </View>

                {/* Summary Stats Cards */}
                <View style={styles.statsGrid}>
                    {[
                        { label: "Total Skills", value: allSkills.length, color: "#fff", bg: "#1f2937" },
                        { label: "Not Started", value: allSkills.filter((s: any) => s.level === 'None').length, color: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
                        { label: "In Progress", value: allSkills.filter((s: any) => s.level !== 'None' && s.level !== 'Advanced').length, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
                        { label: "High Priority", value: allSkills.filter((s: any) => s.priority === 'high').length, color: "#a5b4fc", bg: "rgba(99, 102, 241, 0.1)" },
                    ].map((stat, i) => (
                        <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Filters */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
                        <TouchableOpacity
                            onPress={() => setActiveCategory("all")}
                            style={[styles.filterBtn, activeCategory === "all" && styles.activeFilter]}
                        >
                            <Text style={[styles.filterText, activeCategory === "all" && styles.activeFilterText]}>All</Text>
                        </TouchableOpacity>
                        {data.categories.map((cat: any) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setActiveCategory(cat.id)}
                                style={[styles.filterBtn, activeCategory === cat.id && styles.activeFilter]}
                            >
                                <Text style={[styles.filterText, activeCategory === cat.id && styles.activeFilterText]}>{cat.icon} {cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
                        {['all', 'high', 'medium', 'low'].map(p => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setPriorityFilter(p)}
                                style={[styles.filterBtn, priorityFilter === p && styles.activeFilter]}
                            >
                                <Text style={[styles.filterText, priorityFilter === p && styles.activeFilterText]}>
                                    {p === "all" ? "All Priority" : `${priorityEmojis[p as Priority]} ${p}`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Skills List */}
                <View style={styles.skillsContainer}>
                    {filteredSkills.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No skills found matching your filters.</Text>
                        </View>
                    )}

                    {filteredSkills.map((skill: any, index: number) => (
                        <View key={index} style={styles.skillCard}>
                            <View style={styles.skillTop}>
                                <View>
                                    <Text style={styles.skillName}>{skill.name}</Text>
                                    <Text style={styles.skillCategory}>{skill.category}</Text>
                                </View>
                                <View style={styles.priorityBadge}>
                                    <Text style={styles.priorityText}>{skill.priority.toUpperCase()} PRIORITY</Text>
                                </View>
                            </View>

                            <View style={styles.levelSection}>
                                <View style={styles.levelLabel}>
                                    <Text style={styles.levelTitle}>Current Level</Text>
                                    <View style={[styles.levelBadge, { backgroundColor: `${levelColors[skill.level as SkillLevel]}20`, borderColor: `${levelColors[skill.level as SkillLevel]}40` }]}>
                                        <Text style={{ color: levelColors[skill.level as SkillLevel], fontSize: 10, fontWeight: 'bold' }}>{skill.level}</Text>
                                    </View>
                                </View>
                                <View style={styles.levelBarBg}>
                                    <View style={[styles.levelBarFill, { width: levelBar[skill.level as SkillLevel] as any, backgroundColor: levelColors[skill.level as SkillLevel] }]} />
                                </View>
                            </View>

                            {skill.resource && (
                                <TouchableOpacity style={styles.learnBtn}>
                                    <Ionicons name="book-outline" size={16} color="#a5b4fc" style={{ marginRight: 8 }} />
                                    <Text style={styles.learnBtnText}>Start Learning</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* Tip Box */}
                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.tipHeading}>Where to start?</Text>
                        <Text style={styles.tipText}>Focus on high priority skills first—especially ones marked as Not Started.</Text>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 32 - 8) / 2, // 2-col with gap
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#6b7280',
        fontSize: 11,
    },
    filterSection: {
        marginBottom: 20,
        gap: 12,
    },
    horizontalFilters: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    filterBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 8,
    },
    activeFilter: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    filterText: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#a5b4fc',
    },
    skillsContainer: {
        marginBottom: 24,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },
    skillCard: {
        backgroundColor: '#111827',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 12,
    },
    skillTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    skillName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    skillCategory: {
        color: '#6b7280',
        fontSize: 12,
    },
    priorityBadge: {
        backgroundColor: 'rgba(248, 113, 113, 0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityText: {
        color: '#f87171',
        fontSize: 9,
        fontWeight: 'bold',
    },
    levelSection: {
        marginBottom: 16,
    },
    levelLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelTitle: {
        color: '#9ca3af',
        fontSize: 12,
    },
    levelBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
    },
    levelBarBg: {
        height: 6,
        backgroundColor: '#1f2937',
        borderRadius: 3,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
    },
    learnBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    learnBtnText: {
        color: '#a5b4fc',
        fontSize: 13,
        fontWeight: '600',
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 20,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    tipIcon: {
        fontSize: 24,
    },
    tipHeading: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tipText: {
        color: '#9ca3af',
        fontSize: 13,
        lineHeight: 18,
    },
});
