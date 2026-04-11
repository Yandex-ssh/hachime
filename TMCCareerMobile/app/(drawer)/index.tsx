import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Modal, FlatList } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MOCK_STUDENT, MOCK_QUICK_ACTIONS } from '@/constants/mocks';
import { useSaved } from '@/context/SavedContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/api';
import axios from 'axios';

const { width } = Dimensions.get('window');

const matchColors: Record<string, string> = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  rose: "#f43f5e",
};

export default function DashboardScreen() {
  const { student, token, updateStudent, refreshStudent } = useAuth(); // Kept token and updateStudent as they are used
  const { refreshSaved } = useSaved(); // Added useSaved hook

  // Refresh data when screen focuses
  useFocusEffect(
    useCallback(() => {
      refreshStudent();
      refreshSaved(); // Added refreshSaved
    }, [refreshStudent, refreshSaved]) // Added refreshSaved to dependencies
  );
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState<any[]>([]);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [savingCareerGoal, setSavingCareerGoal] = useState(false);
  const [careerError, setCareerError] = useState("");

  useEffect(() => {
    // Fetch generic careers list
    axios.get(`${API_URL}/careers`)
      .then(res => setCareers(res.data))
      .catch(err => console.error("Error fetching careers:", err));

    if (student) {
      const fetchMatches = async () => {
        try {
          const res = await axios.get(`${API_URL}/careers/matches/${student.student_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMatches(res.data);
        } catch (err) {
          console.error("Error fetching career matches:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [student, token]);

  const handleSaveCareerGoal = async (careerId: number | null) => {
    setCareerError("");
    try {
      setSavingCareerGoal(true);
      const res = await axios.patch(
        `${API_URL}/students/me/career-goal`,
        { target_career_id: careerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await updateStudent(res.data);
      setShowCareerModal(false);
    } catch (err: any) {
      setCareerError(err.response?.data?.message || err.message || "Failed to set career goal");
    } finally {
      setSavingCareerGoal(false);
    }
  };

  // Use mock data if student is not loaded (Auth bypass mode)
  const currentStudent = student || MOCK_STUDENT;

  const finishedCount = currentStudent.progress?.finishedSubjects ?? 0;
  const totalCount = currentStudent.progress?.totalSubjects ?? 0;
  const progPercent = totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getYearSuffix = (year: number) => {
    if (year === 1) return "st";
    if (year === 2) return "nd";
    if (year === 3) return "rd";
    return "th";
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── WELCOME BANNER ── */}
        <View style={styles.banner}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{currentStudent.name} 👋</Text>

          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentStudent.program}</Text>
            </View>
            <View style={styles.badgeSecondary}>
              <Text style={styles.badgeTextSecondary}>
                {currentStudent.year_level}{getYearSuffix(Number(currentStudent.year_level))} Year
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Academic Progress</Text>
              <Text style={styles.progressText}>
                {finishedCount} / {totalCount} subjects
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progPercent}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progPercent}% complete</Text>
          </View>
        </View>

        {/* ── CAREER GOAL & GAP ANALYSIS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Career Goal</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.cardTitle}>Set Your Target</Text>
                <Text style={styles.cardSubtitle}>Track your progress and see what's missing.</Text>
              </View>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => setShowCareerModal(true)}
                disabled={savingCareerGoal}
              >
                {savingCareerGoal ? (
                  <ActivityIndicator size="small" color="#9ca3af" />
                ) : (
                  <>
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {currentStudent.career_goal ? `${currentStudent.career_goal.icon || '💼'} ${currentStudent.career_goal.title}` : "Select"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {careerError ? <Text style={styles.errorText}>{careerError}</Text> : null}

            {currentStudent.career_goal && (
              <View style={styles.careerGoalGrid}>
                {/* Progress Card */}
                <View style={styles.subCard}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalIcon}>{currentStudent.career_goal.icon || '💼'}</Text>
                    <Text style={styles.goalTitle}>{currentStudent.career_goal.title}</Text>
                  </View>
                  <View style={styles.progressHeader}>
                    <Text style={styles.subCardLabel}>Key subjects completed</Text>
                    <Text style={styles.subCardValue}>
                      {currentStudent.career_goal.progress.completed} / {currentStudent.career_goal.progress.total}
                    </Text>
                  </View>
                  <View style={styles.goalBarBg}>
                    <View style={[styles.goalBarFill, { width: `${currentStudent.career_goal.progress.percent}%` }]} />
                  </View>
                  <Text style={styles.goalSubtext}>
                    {currentStudent.career_goal.progress.percent}% toward this career
                  </Text>
                </View>

                {/* Gap Analysis Card */}
                <View style={[styles.subCard, styles.gapCard]}>
                  <Text style={styles.subCardTitle}>Gap analysis</Text>
                  {currentStudent.career_goal.progress.total === 0 ? (
                    <Text style={styles.gapMessage}>No key subjects are mapped for this career yet.</Text>
                  ) : (currentStudent.career_goal.gap?.missing_subjects?.length ?? 0) === 0 ? (
                    <Text style={[styles.gapMessage, { color: '#34d399' }]}>You've completed all mapped key subjects for this career.</Text>
                  ) : (
                    <>
                      <Text style={styles.gapMessage}>To fully match this career, you still need these key subjects:</Text>
                      <View style={styles.pillContainer}>
                        {currentStudent.career_goal.gap.missing_subjects.map((s: any) => (
                          <View key={s.subject_id} style={styles.pill}>
                            <Text style={styles.pillText}>{s.subject_name}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── RECOMMENDED CAREERS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderLine}>
            <Text style={styles.sectionHeading}>Recommended Careers</Text>
            <View style={styles.matchCountBadge}>
              <Text style={styles.matchCountText}>{matches.length} matches</Text>
            </View>
          </View>

          {matches.length === 0 && !loading && (
            <View style={styles.card}>
              <Text style={styles.careerDesc}>No specific matches found. Try finishing more subjects!</Text>
            </View>
          )}

          {matches.slice(0, 3).map((career, index) => (
            <TouchableOpacity
              key={career.career_id}
              style={[styles.careerCard, index === 0 && styles.featuredCard]}
              onPress={() => router.push({ pathname: '/(drawer)/pathway' as any, params: { careerId: career.career_id } })}
            >
              {index === 0 && (
                <View style={styles.bestMatchTag}>
                  <Text style={styles.bestMatchText}>⭐ Best Match</Text>
                </View>
              )}
              <View style={styles.careerHeader}>
                <View style={[styles.iconBox, { backgroundColor: `rgba(99, 102, 241, 0.1)`, borderColor: `rgba(99, 102, 241, 0.2)` }]}>
                  <Text style={styles.careerEmoji}>{career.icon || '💼'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.careerName}>{career.title}</Text>
                  <Text style={styles.careerSalary}>
                    {career.salary_min ? `₱${(career.salary_min / 1000).toFixed(0)}k - ₱${(career.salary_max / 1000).toFixed(0)}k` : 'Salary TBD'}
                  </Text>
                </View>
                <View style={[styles.matchBadge, { backgroundColor: `rgba(79, 70, 229, 0.1)` }]}>
                  <Text style={[styles.matchText, { color: '#818cf8' }]}>{career.match_score}% match</Text>
                </View>
              </View>
              <View style={styles.smallBarBg}>
                <View style={[styles.smallBarFill, { backgroundColor: '#6366f1', width: `${career.match_score}%` }]} />
              </View>
              <Text style={styles.careerDesc}>{career.description?.substring(0, 100)}...</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {MOCK_QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionItem}
                onPress={() => router.push(action.href as any)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* ── CAREER SELECTION MODAL ── */}
      <Modal visible={showCareerModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Career</Text>
              <TouchableOpacity onPress={() => setShowCareerModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ career_id: null, title: 'No target career', icon: '' }, ...careers]}
              keyExtractor={(item) => item.career_id ? item.career_id.toString() : 'none'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSaveCareerGoal(item.career_id)}
                >
                  <Text style={styles.modalItemIcon}>{item.icon || '💼'}</Text>
                  <Text style={styles.modalItemText}>{item.title}</Text>
                  {currentStudent.career_goal?.career_id === item.career_id && (
                    <Ionicons name="checkmark" size={20} color="#6366f1" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712', // gray-950
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#111827',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 24,
  },
  greeting: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  badgeTextSecondary: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressPercent: {
    color: '#6366f1',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  matchCountBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  matchCountText: {
    color: '#6b7280',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    maxWidth: 160,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 13,
    marginRight: 6,
    flexShrink: 1,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 8,
  },
  careerGoalGrid: {
    marginTop: 16,
    gap: 12,
  },
  subCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  gapCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderColor: 'rgba(55, 65, 81, 0.6)',
  },
  subCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  subCardLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  subCardValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gapMessage: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: '#e5e7eb',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  modalItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalItemText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalTitle: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '500',
  },
  goalBarBg: {
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  goalSubtext: {
    color: '#6366f1',
    fontSize: 11,
    marginTop: 6,
  },
  careerCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  featuredCard: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  bestMatchTag: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  bestMatchText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  careerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerEmoji: {
    fontSize: 24,
  },
  careerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  careerSalary: {
    color: '#9ca3af',
    fontSize: 12,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  smallBarBg: {
    height: 4,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  smallBarFill: {
    height: '100%',
  },
  careerDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: (width - 32 - 12) / 2, // 2 cols minus padding/gap
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
});
