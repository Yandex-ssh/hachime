import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSaved } from '@/context/SavedContext';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/api';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

const colorMap: Record<string, string> = {
    indigo: "#6366f1",
    violet: "#8b5cf6",
    blue: "#3b82f6",
    cyan: "#06b6d4"
};

const palette = ["indigo", "violet", "blue", "cyan"] as const;

const typeIcons: Record<string, string> = {
    "Certification": "🎓",
    "Course": "📚",
    "Roadmap": "🗺️",
    "Article": "📄",
    "Bootcamp": "🚀"
};

export default function ResourcesScreen() {
    const [query, setQuery] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token } = useAuth();
    const { savedResourceIds, toggleResource, refreshSaved } = useSaved();

    const fetchResources = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const params: any = {};
            if (query.trim()) params.q = query.trim();
            if (activeType !== "All") params.type = activeType;

            const res = await axios.get(`${API_URL}/resources`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });

            const mapped = res.data.map((item: any) => {
                const color = palette[item.resource_id % palette.length];
                return {
                    resource_id: item.resource_id,
                    title: item.title,
                    provider: item.provider || "Unknown",
                    type: item.type || "Course",
                    difficulty: item.difficulty || "Beginner",
                    cost_type: item.cost_type || "Free",
                    description: item.description || "",
                    certificate_offered: !!item.certificate_offered,
                    url: item.url || "#",
                    color: color
                };
            });
            setResources(mapped);
        } catch (err: any) {
            console.error("Error fetching resources:", err);
            setError("Failed to load resources");
        } finally {
            setLoading(false);
        }
    }, [token, query, activeType]);

    useFocusEffect(
        useCallback(() => {
            fetchResources();
            refreshSaved();
        }, [fetchResources, refreshSaved])
    );

    const filtered = resources;

    const toggleSave = (id: number) => {
        toggleResource(id);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Development Resources</Text>
                    <Text style={styles.pageSubtitle}>
                        Courses and certifications to build the skills you need next.
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    {[
                        { label: "Available", value: resources.length, color: "#fff", bg: "#1f2937" },
                        { label: "Certs", value: resources.filter(x => x.type === "Certification").length, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
                        { label: "Free Items", value: resources.filter(x => x.cost_type === "Free").length, color: "#a5b4fc", bg: "rgba(99, 102, 241, 0.1)" },
                        { label: "Saved", value: savedResourceIds.length, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
                    ].map((stat, i) => (
                        <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Search & Filters */}
                <View style={styles.filterSection}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={16} color="#4b5563" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search resources, providers..."
                            placeholderTextColor="#4b5563"
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
                        {["All", "Course", "Certification", "Roadmap"].map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setActiveType(t)}
                                style={[styles.filterBtn, activeType === t && styles.activeFilter]}
                            >
                                <Text style={[styles.filterText, activeType === t && styles.activeFilterText]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Resource List */}
                <View style={styles.listContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 20 }} />
                    ) : error ? (
                        <Text style={{ color: '#f87171', textAlign: 'center', marginTop: 20 }}>{error}</Text>
                    ) : filtered.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No resources found yet.</Text>
                        </View>
                    ) : filtered.map((item) => {
                        const isSaved = savedResourceIds.includes(item.resource_id);
                        const themeColor = colorMap[item.color as keyof typeof colorMap] || colorMap.indigo;

                        return (
                            <View key={item.resource_id} style={[styles.resourceCard, isSaved && { borderColor: themeColor, borderWidth: 1 }]}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: `${themeColor}20`, borderColor: `${themeColor}40` }]}>
                                        <Text style={styles.icon}>{typeIcons[item.type] || '📚'}</Text>
                                    </View>
                                    <View style={styles.headerInfo}>
                                        <Text style={styles.resourceTitle}>{item.title}</Text>
                                        <Text style={styles.resourceProvider}>{item.provider}</Text>
                                    </View>
                                </View>

                                {/* Badges Row */}
                                <View style={styles.badgeRow}>
                                    <View style={styles.pills}>
                                        <View style={[styles.pill, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }]}>
                                            <Text style={[styles.pillText, { color: themeColor }]}>{item.type}</Text>
                                        </View>
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>⚡ {item.difficulty}</Text>
                                        </View>
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>💳 {item.cost_type}</Text>
                                        </View>
                                        {item.certificate_offered && (
                                            <View style={[styles.pill, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                                <Text style={[styles.pillText, { color: '#10b981' }]}>✅ Certificate</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <Text style={styles.resourceDesc} numberOfLines={3}>{item.description}</Text>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.footerTip}>Tip: save resources to finish later.</Text>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            onPress={() => toggleSave(item.resource_id)}
                                            style={[styles.saveBtn, isSaved && styles.isSavedBtn]}
                                        >
                                            <Ionicons name={isSaved ? "star" : "star-outline"} size={14} color={isSaved ? "#fbbf24" : "#6b7280"} />
                                            <Text style={[styles.saveBtnText, isSaved && styles.isSavedBtnText]}>{isSaved ? "Saved" : "Save"}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.openBtn}>
                                            <Text style={styles.openBtnText}>Open →</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
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
    filterSection: {
        marginBottom: 24,
        gap: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        height: 44,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    horizontalFilters: {
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
    resourceCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 24,
    },
    headerInfo: {
        flex: 1,
    },
    resourceTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    resourceProvider: {
        color: '#9ca3af',
        fontSize: 12,
    },
    badgeRow: {
        marginBottom: 16,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    pill: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pillText: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: 'bold',
    },
    resourceDesc: {
        color: '#9ca3af',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 16,
    },
    cardFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerTip: {
        color: '#4b5563',
        fontSize: 10,
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#374151',
        gap: 6,
    },
    isSavedBtn: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderColor: 'rgba(251, 191, 36, 0.2)',
    },
    saveBtnText: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 'bold',
    },
    isSavedBtnText: {
        color: '#fbbf24',
    },
    openBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    openBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
