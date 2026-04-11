import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MOCK_TRENDS_DATA, MOCK_TREND_SNAPSHOT } from '@/constants/mocks';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

const colorMap: Record<string, { badge: string; border: string; tag: string; bar: string }> = {
    indigo: { badge: "#6366f1", border: "rgba(99, 102, 241, 0.3)", tag: "rgba(99, 102, 241, 0.1)", bar: "#6366f1" },
    red: { badge: "#f43f5e", border: "rgba(244, 63, 94, 0.3)", tag: "rgba(244, 63, 94, 0.1)", bar: "#f43f5e" },
    blue: { badge: "#3b82f6", border: "rgba(59, 130, 246, 0.3)", tag: "rgba(59, 130, 246, 0.1)", bar: "#3b82f6" },
    violet: { badge: "#8b5cf6", border: "rgba(139, 92, 246, 0.3)", tag: "rgba(139, 92, 246, 0.1)", bar: "#8b5cf6" },
    cyan: { badge: "#06b6d4", border: "rgba(6, 182, 212, 0.3)", tag: "rgba(6, 182, 212, 0.1)", bar: "#06b6d4" },
};

const demandWidth: Record<string, number> = {
    "Very High": 1,
    "High": 0.75,
    "Medium": 0.5,
    "Low": 0.25,
};

export default function TrendsScreen() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const selectedTrend = MOCK_TRENDS_DATA.find(t => t.id === selectedId);

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Industry Trends</Text>
                    <Text style={styles.pageSubtitle}>
                        Stay ahead — see what the tech industry is demanding right now in the Philippines.
                    </Text>
                </View>

                {/* Market Snapshot */}
                <View style={styles.snapshotCard}>
                    <View style={styles.snapshotTop}>
                        <Text style={styles.snapshotEmoji}>📈</Text>
                        <Text style={styles.snapshotTitle}>Market Snapshot — {MOCK_TREND_SNAPSHOT.year}</Text>
                    </View>
                    <View style={styles.snapshotGrid}>
                        {[
                            { label: "Active trends", value: MOCK_TREND_SNAPSHOT.active_trends, sub: "In database" },
                            { label: "Data source", value: "Internal", sub: "Managed" },
                            { label: "Updates", value: "Ongoing", sub: "Evolving" },
                            { label: "Coverage", value: "PH Market", sub: "General" },
                        ].map((s, i) => (
                            <View key={i} style={styles.snapBox}>
                                <Text style={styles.snapValue}>{s.value}</Text>
                                <Text style={styles.snapLabel}>{s.label}</Text>
                                <Text style={styles.snapSub}>{s.sub}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Trend List */}
                <View style={styles.listContainer}>
                    {MOCK_TRENDS_DATA.map((trend) => {
                        const isSelected = selectedId === trend.id;
                        const c = colorMap[trend.color as keyof typeof colorMap] || colorMap.indigo;
                        const salary = `₱${trend.salaryMin.toLocaleString()} – ₱${trend.salaryMax.toLocaleString()}/mo`;

                        return (
                            <TouchableOpacity
                                key={trend.id}
                                activeOpacity={0.8}
                                onPress={() => setSelectedId(isSelected ? null : trend.id)}
                                style={[styles.trendCard, isSelected && { borderColor: c.badge, borderWidth: 1 }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: c.tag, borderColor: c.border }]}>
                                            <Text style={styles.icon}>{trend.icon}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.trendTitle}>{trend.title}</Text>
                                            <Text style={styles.trendSalary}>{salary}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.growthText}>{trend.growth}</Text>
                                </View>

                                {/* Demand Bar */}
                                <View style={styles.demandSection}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.demandLabel}>Market Demand</Text>
                                        <Text style={[styles.demandValue, { color: c.badge }]}>{trend.demandLevel}</Text>
                                    </View>
                                    <View style={styles.barBg}>
                                        <View style={[styles.barFill, { backgroundColor: c.bar, width: `${demandWidth[trend.demandLevel] * 100}%` }]} />
                                    </View>
                                </View>

                                <Text style={styles.trendDesc}>{trend.description}</Text>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.footerAction}>{isSelected ? "▲ Hide details" : "▼ See details"}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Selected Detail Panel */}
                {selectedTrend && (
                    <View style={styles.detailPanel}>
                        <View style={styles.detailHeader}>
                            <View style={[styles.detailIconBox, { backgroundColor: colorMap[selectedTrend.color as keyof typeof colorMap].tag }]}>
                                <Text style={styles.detailIcon}>{selectedTrend.icon}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailTitle}>{selectedTrend.title}</Text>
                                <View style={styles.detailMeta}>
                                    <Text style={styles.detailSalary}>₱{selectedTrend.salaryMin.toLocaleString()} – ₱{selectedTrend.salaryMax.toLocaleString()}/mo</Text>
                                    <Text style={styles.detailGrowth}> · {selectedTrend.growth} growth</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.gridRow}>
                            <View style={styles.infoCol}>
                                <Text style={styles.panelHeading}>💼 Top Job Roles</Text>
                                <View style={styles.roleList}>
                                    {selectedTrend.topRoles.map(role => (
                                        <View key={role} style={styles.roleItem}>
                                            <View style={[styles.dot, { backgroundColor: colorMap[selectedTrend.color as keyof typeof colorMap].bar }]} />
                                            <Text style={styles.roleText}>{role}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.infoCol}>
                                <Text style={styles.panelHeading}>⚡ In-Demand Skills</Text>
                                <View style={styles.skillCloud}>
                                    {selectedTrend.topSkills.map(skill => (
                                        <View key={skill} style={[styles.skillBadge, { backgroundColor: colorMap[selectedTrend.color as keyof typeof colorMap].tag, borderColor: colorMap[selectedTrend.color as keyof typeof colorMap].border }]}>
                                            <Text style={[styles.skillBadgeText, { color: colorMap[selectedTrend.color as keyof typeof colorMap].badge }]}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionMargin}>
                            <Text style={styles.panelHeading}>🏢 Companies Hiring in PH</Text>
                            <View style={styles.skillCloud}>
                                {selectedTrend.companies.map(c => (
                                    <View key={c} style={styles.companyBadge}>
                                        <Text style={styles.companyText}>{c}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.insightBox, { backgroundColor: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }]}>
                            <Text style={styles.insightEmoji}>💡</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.insightLabel}>Industry Insight</Text>
                                <Text style={styles.insightText}>{selectedTrend.insight}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {!selectedId && (
                    <Text style={styles.prompt}>👆 Tap any trend card to see full details</Text>
                )}

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
    snapshotCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        marginBottom: 24,
    },
    snapshotTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    snapshotEmoji: {
        fontSize: 24,
    },
    snapshotTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    snapshotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    snapBox: {
        width: (width - 40 - 32 - 8) / 2,
        backgroundColor: '#111827',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    snapValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    snapLabel: {
        color: '#9ca3af',
        fontSize: 10,
    },
    snapSub: {
        color: '#4b5563',
        fontSize: 10,
        marginTop: 2,
    },
    listContainer: {
        gap: 16,
        marginBottom: 24,
    },
    trendCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardLeft: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 22,
    },
    trendTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    trendSalary: {
        color: '#6b7280',
        fontSize: 11,
    },
    growthText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 14,
    },
    demandSection: {
        marginBottom: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    demandLabel: {
        color: '#4b5563',
        fontSize: 11,
    },
    demandValue: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    barBg: {
        height: 6,
        backgroundColor: '#1f2937',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    trendDesc: {
        color: '#9ca3af',
        fontSize: 12,
        lineHeight: 18,
    },
    cardFooter: {
        marginTop: 12,
        alignItems: 'flex-end',
    },
    footerAction: {
        color: '#4b5563',
        fontSize: 10,
    },
    detailPanel: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        marginBottom: 24,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
        marginBottom: 20,
    },
    detailIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailIcon: {
        fontSize: 28,
    },
    detailTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailSalary: {
        color: '#9ca3af',
        fontSize: 12,
    },
    detailGrowth: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    gridRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    infoCol: {
        flex: 1,
    },
    panelHeading: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    roleList: {
        gap: 8,
    },
    roleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    roleText: {
        color: '#d1d5db',
        fontSize: 12,
    },
    skillCloud: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    skillBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionMargin: {
        marginBottom: 24,
    },
    companyBadge: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    companyText: {
        color: '#9ca3af',
        fontSize: 10,
    },
    insightBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    insightEmoji: {
        fontSize: 20,
    },
    insightLabel: {
        color: '#a5b4fc',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    insightText: {
        color: '#d1d5db',
        fontSize: 12,
        lineHeight: 18,
    },
    prompt: {
        textAlign: 'center',
        color: '#4b5563',
        fontSize: 12,
        marginBottom: 32,
    },
});
