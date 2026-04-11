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

const typeColors: Record<string, string> = {
    "On-site": "#10b981",
    "Hybrid": "#f59e0b",
    "Remote": "#3b82f6",
};

export default function InternshipsScreen() {
    const [query, setQuery] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [internships, setInternships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const { token, student } = useAuth();
    const { savedInternshipIds, toggleInternship, refreshSaved } = useSaved();

    const fetchInternships = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const params: any = {};
            if (query.trim()) params.q = query.trim();
            if (activeType !== "All") params.work_type = activeType;

            const res = await axios.get(`${API_URL}/internships`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });

            // Map API data to UI format
            const mapped = res.data.map((item: any) => {
                const color = palette[item.internship_id % palette.length];
                return {
                    id: item.internship_id,
                    role: item.role_title,
                    company: item.company_name,
                    type: item.work_type || "On-site",
                    location: item.location || "Philippines",
                    description: item.description || "",
                    match: 0, // In a real app, this would be calculated or returned by API
                    missing: [], // Same as above
                    deadline: item.deadline || "TBA",
                    color: color
                };
            });
            setInternships(mapped);
        } catch (err: any) {
            console.error("Error fetching internships:", err);
            setError("Failed to load internships");
        } finally {
            setLoading(false);
        }
    }, [token, query, activeType]);

    useFocusEffect(
        useCallback(() => {
            fetchInternships();
            refreshSaved();
        }, [fetchInternships, refreshSaved])
    );

    const filteredInternships = internships;

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.section}>
                    <Text style={styles.pageTitle}>Internships</Text>
                    <Text style={styles.pageSubtitle}>
                        Opportunities matched to your career path and skills.
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    {[
                        { label: "Available", value: internships.length, color: "#fff", bg: "#1f2937" },
                        { label: "Saved", value: savedInternshipIds.length, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
                        { label: "Closing", value: "3", color: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
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
                            placeholder="Search companies, roles..."
                            placeholderTextColor="#4b5563"
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
                        {["All", "On-site", "Hybrid", "Remote"].map(t => (
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

                {/* Internship List */}
                <View style={styles.listContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 20 }} />
                    ) : error ? (
                        <Text style={{ color: '#f87171', textAlign: 'center', marginTop: 20 }}>{error}</Text>
                    ) : filteredInternships.length === 0 ? (
                        <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>No internships found.</Text>
                    ) : filteredInternships.map((job, idx) => (
                        <TouchableOpacity key={idx} style={styles.jobCard}>
                            <View style={styles.jobTop}>
                                {/* Logo Placeholder */}
                                <View style={[styles.logoPlaceholder, { backgroundColor: `${colorMap[job.color]}20`, borderColor: `${colorMap[job.color]}40` }]}>
                                    <Ionicons name="briefcase" size={24} color={colorMap[job.color]} />
                                </View>
                                <View style={styles.jobMeta}>
                                    <Text style={styles.jobRole}>{job.role}</Text>
                                    <Text style={styles.jobCompany}>{job.company}</Text>

                                    <View style={styles.badgeLine}>
                                        <View style={[styles.typeBadge, { backgroundColor: `${typeColors[job.type] || '#9ca3af'}20`, borderColor: `${typeColors[job.type] || '#9ca3af'}40` }]}>
                                            <Text style={[styles.typeText, { color: typeColors[job.type] || '#9ca3af' }]}>{job.type}</Text>
                                        </View>
                                        <View style={styles.locationBadge}>
                                            <Ionicons name="location-outline" size={10} color="#9ca3af" />
                                            <Text style={styles.locationText}>{job.location}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => toggleInternship(job.id)}>
                                    <Ionicons
                                        name={savedInternshipIds.includes(job.id) ? "bookmark" : "bookmark-outline"}
                                        size={20}
                                        color={savedInternshipIds.includes(job.id) ? "#fbbf24" : "#9ca3af"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.jobDesc} numberOfLines={3}>{job.description}</Text>

                            {/* Match Section (Optional/Simplified) */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.deadline}>Deadline: <Text style={{ color: '#9ca3af' }}>{job.deadline}</Text></Text>
                                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colorMap[job.color] }]}>
                                    <Text style={styles.applyBtnText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
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
        gap: 8,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
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
    jobCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    jobTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    logoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    jobMeta: {
        flex: 1,
    },
    jobRole: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    jobCompany: {
        color: '#9ca3af',
        fontSize: 13,
        marginBottom: 8,
    },
    badgeLine: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#374151',
    },
    locationText: {
        color: '#9ca3af',
        fontSize: 10,
        marginLeft: 4,
    },
    jobDesc: {
        color: '#9ca3af',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 16,
    },
    matchArea: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    matchTitle: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '600',
    },
    matchBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    matchBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    missingList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    missingTag: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    missingText: {
        color: '#f87171',
        fontSize: 9,
    },
    fullMatch: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    fullMatchText: {
        color: '#10b981',
        fontSize: 10,
        textAlign: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
    },
    deadline: {
        fontSize: 11,
        color: '#6b7280',
    },
    applyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
