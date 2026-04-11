import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MOCK_ALUMNI_STATS, MOCK_ALUMNI_CARDS } from '@/constants/mocks';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

const colorMap: Record<string, string> = {
    indigo: "#6366f1",
    cyan: "#06b6d4",
    blue: "#3b82f6",
    violet: "#8b5cf6",
};

export default function AlumniScreen() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const programs = ["All", "BSIT", "BSCRIM", "BSED", "BSOA", "BSPOL.SCI"];

    const filteredAlumni = MOCK_ALUMNI_CARDS.filter(p =>
        activeFilter === "All" || p.program === activeFilter
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Alumni Success</Text>
                    <Text style={styles.pageSubtitle}>
                        Real career journeys of TMC graduates — see where your path could lead.
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {[
                        { label: "TMC Alumni", value: MOCK_ALUMNI_STATS.total_alumni, color: "#fff", bg: "#1f2937" },
                        { label: "Avg. Hire Time", value: `${MOCK_ALUMNI_STATS.avg_months_to_land_job} mos`, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
                        { label: "Hired < 6 mos", value: `${MOCK_ALUMNI_STATS.hired_in_6_months_percent}%`, color: "#a5b4fc", bg: "rgba(99, 102, 241, 0.1)" },
                        { label: "Partner Cos.", value: MOCK_ALUMNI_STATS.companies, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)" },
                    ].map((stat, i) => (
                        <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                    {programs.map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setActiveFilter(p)}
                            style={[styles.filterBtn, activeFilter === p && styles.activeFilter]}
                        >
                            <Text style={[styles.filterText, activeFilter === p && styles.activeFilterText]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Alumni List */}
                <View style={styles.listContainer}>
                    {filteredAlumni.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No alumni found for this program yet.</Text>
                        </View>
                    )}

                    {filteredAlumni.map((person, idx) => {
                        const isExpanded = expandedId === person.id;
                        const themeColor = colorMap[person.color as keyof typeof colorMap] || colorMap.indigo;

                        return (
                            <View key={person.id} style={[styles.alumniCard, isExpanded && { borderColor: themeColor }]}>
                                {/* Header Info */}
                                <View style={styles.cardTop}>
                                    <View style={[styles.avatar, { backgroundColor: themeColor }]}>
                                        <Text style={styles.avatarText}>
                                            {person.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.headerMeta}>
                                        <View style={styles.rowBetween}>
                                            <Text style={styles.alumniName}>{person.name}</Text>
                                            <View style={[styles.programBadge, { backgroundColor: `${themeColor}20` }]}>
                                                <Text style={[styles.programText, { color: themeColor }]}>
                                                    {person.program} '{person.batch.slice(-2)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.alumniRole}>{person.currentRole} · {person.company}</Text>
                                    </View>
                                </View>

                                {/* Tags Row */}
                                <View style={styles.tagsRow}>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>📍 {person.location}</Text>
                                    </View>
                                    <View style={[styles.tag, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <Text style={[styles.tagText, { color: '#10b981' }]}>💰 {person.salary}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>⚡ {person.monthsToLand} mo to hire</Text>
                                    </View>
                                </View>

                                {/* Collapsible Section */}
                                {isExpanded && (
                                    <View style={styles.expandArea}>
                                        <View style={styles.expandDivider} />

                                        <View style={styles.gridRow}>
                                            <View style={styles.infoBox}>
                                                <Text style={styles.infoLabel}>🎓 Graduated</Text>
                                                <Text style={styles.infoValue}>{person.graduatedYear}</Text>
                                            </View>
                                            <View style={styles.infoBox}>
                                                <Text style={styles.infoLabel}>🧑‍💼 Internships</Text>
                                                {person.internships.map((it, i) => (
                                                    <Text key={i} style={styles.infoValueSmall}>{it.role_title} @ {it.company_name}</Text>
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.infoSection}>
                                            <Text style={styles.infoLabel}>Skills they use daily:</Text>
                                            <View style={styles.skillTags}>
                                                {person.skills.map(skill => (
                                                    <View key={skill} style={[styles.skillTag, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }]}>
                                                        <Text style={[styles.skillTagText, { color: themeColor }]}>{skill}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.adviceBox}>
                                            <Text style={styles.infoLabel}>💬 Story from this alumni:</Text>
                                            <Text style={styles.adviceText}>"{person.advice}"</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.expandBtn}
                                    onPress={() => setExpandedId(isExpanded ? null : person.id)}
                                >
                                    <Text style={styles.expandBtnText}>{isExpanded ? "Show less" : "See full story"}</Text>
                                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 32 - 8) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#6b7280',
        fontSize: 11,
    },
    filterBar: {
        marginBottom: 24,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
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
    listContainer: {
        gap: 16,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },
    alumniCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    cardTop: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    headerMeta: {
        flex: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    alumniName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    programBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    programText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    alumniRole: {
        color: '#9ca3af',
        fontSize: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#9ca3af',
        fontSize: 10,
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        gap: 6,
    },
    expandBtnText: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
    },
    expandArea: {
        marginTop: 0,
    },
    expandDivider: {
        height: 1,
        backgroundColor: '#1f2937',
        marginBottom: 16,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    infoBox: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.4)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    infoLabel: {
        color: '#6b7280',
        fontSize: 10,
        marginBottom: 6,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    infoValue: {
        color: '#fff',
        fontSize: 13,
    },
    infoValueSmall: {
        color: '#9ca3af',
        fontSize: 11,
        marginBottom: 2,
    },
    infoSection: {
        marginBottom: 16,
    },
    skillTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    skillTagText: {
        fontSize: 10,
        fontWeight: '500',
    },
    adviceBox: {
        backgroundColor: 'rgba(31, 41, 55, 0.4)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    adviceText: {
        color: '#d1d5db',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 20,
    },
});
