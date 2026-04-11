import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Image, Linking, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useSaved } from '@/context/SavedContext';
import { useThemeContext } from '@/context/ThemeContext';
import { MOCK_INTERNSHIPS, MOCK_JOBS, MOCK_RESOURCES } from '@/constants/mocks';

type SubjectRow = { subject_id: number; subject_name: string; year_level: number | null; semester: number | null };
type SavedInternship = { internship_id: number; company_name: string; role_title: string; apply_url: string | null };
type SavedJob = { job_id: number; company_name: string; role_title: string; apply_url: string | null };
type SavedResource = { resource_id: number; title: string; provider: string | null; url: string };

export default function ProfileScreen() {
  const { student, token, updateStudent, logout, refreshStudent } = useAuth();
  const { savedJobIds, savedInternshipIds, savedResourceIds, refreshSaved } = useSaved();
  const { themeMode, colorScheme, setThemeMode } = useThemeContext();
  const isDark = colorScheme === 'dark';

  // Refresh data when screen focuses
  const refreshEverything = useCallback(() => {
    refreshStudent();
    refreshSaved();
    loadSavedDetails();
  }, [refreshStudent, refreshSaved]);

  useFocusEffect(
    useCallback(() => {
      refreshEverything();
    }, [refreshEverything])
  );

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Subjects
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [finishedIds, setFinishedIds] = useState<number[]>([]);
  const [savingSubjects, setSavingSubjects] = useState(false);

  // Bookmarks (live from API)
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // UI state
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEmail(student.email || '');
      setProfilePicture(student.profile_picture_url || null);
      loadSubjectsCatalog();
      loadMySubjects();
      // #15 – loadSavedDetails is called via refreshEverything in useFocusEffect;
      // calling it here too causes a double API call on initial mount.
    }
  }, [student]);

  const loadSubjectsCatalog = async () => {
    if (!student?.program_id) return;
    setLoadingSubjects(true);
    try {
      const params = new URLSearchParams();
      params.set('program_id', String(student.program_id));
      if (student.year_level) params.set('max_year_level', String(student.year_level));
      const res = await axios.get(`${API_URL}/subjects?${params.toString()}`);
      if (Array.isArray(res.data)) {
        setSubjects(res.data.map((s: any) => ({
          subject_id: Number(s.subject_id),
          subject_name: String(s.subject_name),
          year_level: s.year_level ?? null,
          semester: s.semester ?? null,
        })));
      }
    } catch { /* ignore */ } finally {
      setLoadingSubjects(false);
    }
  };

  const loadMySubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/students/me/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = (res.data?.finished_subjects ?? []).map((s: any) => Number(s.subject_id));
      setFinishedIds(ids);
    } catch { /* ignore */ }
  };

  const loadSavedDetails = async () => {
    if (!token) return;
    
    const fetchCategory = async (path: string, setter: (data: any[]) => void) => {
      try {
        const res = await axios.get(`${API_URL}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setter(res.data);
      } catch (err: any) {
        if (err.response?.status !== 403) {
          console.error(`Failed to load saved items from ${path}`, err);
        } else {
          setter([]);
        }
      }
    };

    await Promise.all([
      fetchCategory('/internships/me/saved', setSavedInternships),
      fetchCategory('/jobs/me/saved', setSavedJobs),
      fetchCategory('/resources/me/saved', setSavedResources),
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setProfilePicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setSavingProfile(true);
    try {
      const payload: any = { name, email };
      if (profilePicture) payload.profile_picture_url = profilePicture;
      const res = await axios.patch(`${API_URL}/students/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await updateStudent(res.data);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSubjects = async () => {
    setSavingSubjects(true);
    try {
      await axios.post(
        `${API_URL}/students/subjects`,
        { finished_subject_ids: finishedIds, liked_subject_ids: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadMySubjects();
      // Refresh student progress
      const res = await axios.get(`${API_URL}/students/me`, { headers: { Authorization: `Bearer ${token}` } });
      await updateStudent(res.data);
      Alert.alert('Success', 'Subjects updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save subjects.');
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await axios.patch(
        `${API_URL}/students/me/password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleSubject = (id: number) => {
    setFinishedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!student) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </ThemedView>
    );
  }

  const finishedCount = student.progress?.finishedSubjects || 0;
  const totalCount = student.progress?.totalSubjects || 1;
  const progressPercent = Math.round((finishedCount / totalCount) * 100);
  const remainingSubjects = subjects.filter(s => !finishedIds.includes(s.subject_id));

  const getYearSuffix = (y: number) => y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile & Settings</Text>
          <Text style={styles.pageSubtitle}>Manage your account and see your progress.</Text>
        </View>

        {/* ── ACCOUNT DETAILS ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Account details</Text>

          {/* Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{student.name?.[0]?.toUpperCase() || 'S'}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.avatarLabel}>Profile picture</Text>
              <Text style={styles.avatarHint}>Upload an image (JPG/PNG, max 10MB).</Text>
              <View style={styles.avatarBtns}>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                  <Text style={styles.uploadBtnText}>Upload image</Text>
                </TouchableOpacity>
                {profilePicture && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setProfilePicture(null)}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Student number</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={student.student_number} editable={false} />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#4b5563"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#4b5563" />
          </View>

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Program</Text>
              <Text style={styles.readOnly}>{student.program || '—'}</Text>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Year level</Text>
              <Text style={styles.readOnly}>
                {student.year_level ? `${student.year_level}${getYearSuffix(Number(student.year_level))} Year` : '—'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, savingProfile && { opacity: 0.6 }]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>Save changes</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── SUBJECTS ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <View style={styles.subjectsHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Subjects</Text>
              <Text style={styles.subjectsHint}>Update your completed subject list used for progress and matching.</Text>
            </View>
            <TouchableOpacity
              style={[styles.secondaryBtnSmall, savingSubjects && { opacity: 0.6 }]}
              onPress={handleSaveSubjects}
              disabled={savingSubjects}
            >
              {savingSubjects
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.secondaryBtnSmallText}>Save subjects</Text>
              }
            </TouchableOpacity>
          </View>

          {!student.program_id ? (
            <Text style={styles.dimText}>Set your Program first to load subjects.</Text>
          ) : loadingSubjects ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : subjects.length === 0 ? (
            <Text style={styles.dimText}>No subjects found for your program yet.</Text>
          ) : (
            <>
              {/* #14 – Use FlatList for virtualized rendering of potentially large subject lists */}
              <Text style={styles.subSectionLabel}>Completed ({finishedIds.length})</Text>
              <FlatList
                data={subjects}
                keyExtractor={(s) => String(s.subject_id)}
                scrollEnabled={false}
                style={styles.subjectPanel}
                renderItem={({ item: s }) => (
                  <TouchableOpacity style={styles.subjectRow} onPress={() => toggleSubject(s.subject_id)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, finishedIds.includes(s.subject_id) && styles.checkboxChecked]}>
                      {finishedIds.includes(s.subject_id) && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subjectName, finishedIds.includes(s.subject_id) && styles.subjectDone]}>
                        {s.subject_name}
                      </Text>
                      {s.year_level ? (
                        <Text style={styles.subjectMeta}>Y{s.year_level}{s.semester ? ` S${s.semester}` : ''}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                )}
              />

              {/* Remaining subjects */}
              <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>
                Remaining ({remainingSubjects.length})
              </Text>
              {remainingSubjects.length === 0 ? (
                <Text style={[styles.dimText, { color: '#34d399' }]}>All listed subjects are marked as completed.</Text>
              ) : (
                <FlatList
                  data={remainingSubjects}
                  keyExtractor={(s) => String(s.subject_id)}
                  scrollEnabled={false}
                  style={styles.subjectPanel}
                  renderItem={({ item: s }) => (
                    <View style={styles.remainingItem}>
                      <Text style={styles.subjectName}>{s.subject_name}</Text>
                      {s.year_level ? (
                        <Text style={styles.subjectMeta}>Y{s.year_level}{s.semester ? ` S${s.semester}` : ''}</Text>
                      ) : null}
                    </View>
                  )}
                />
              )}
            </>
          )}
        </View>

        {/* ── BOOKMARKED ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <View style={styles.bookmarkHeader}>
            <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Bookmarked</Text>
            <Text style={styles.dimText}>{savedInternships.length + savedJobs.length + savedResources.length} saved</Text>
          </View>

          {/* Internships */}
          <View style={styles.bookmarkSection}>
            <View style={styles.bookmarkSectionHeader}>
              <Text style={styles.bookmarkCategoryLabel}>Internships</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/internships' as any)}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            {savedInternships.length === 0
              ? <Text style={styles.dimText}>No saved internships yet.</Text>
              : savedInternships.slice(0, 3).map(item => (
                <TouchableOpacity
                  key={item.internship_id}
                  style={styles.bookmarkItem}
                  onPress={() => item.apply_url && Linking.openURL(item.apply_url)}
                >
                  <Text style={styles.bookmarkTitle}>{item.role_title}</Text>
                  <Text style={styles.bookmarkSub}>{item.company_name}</Text>
                </TouchableOpacity>
              ))
            }
          </View>

          {/* Jobs */}
          <View style={styles.bookmarkSection}>
            <View style={styles.bookmarkSectionHeader}>
              <Text style={[styles.bookmarkCategoryLabel, { color: '#c4b5fd' }]}>Job listings</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/jobs' as any)}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            {savedJobs.length === 0
              ? <Text style={styles.dimText}>No saved jobs yet.</Text>
              : savedJobs.slice(0, 3).map(item => (
                <TouchableOpacity
                  key={item.job_id}
                  style={styles.bookmarkItem}
                  onPress={() => item.apply_url && Linking.openURL(item.apply_url)}
                >
                  <Text style={styles.bookmarkTitle}>{item.role_title}</Text>
                  <Text style={styles.bookmarkSub}>{item.company_name}</Text>
                </TouchableOpacity>
              ))
            }
          </View>

          {/* Resources */}
          <View style={styles.bookmarkSection}>
            <View style={styles.bookmarkSectionHeader}>
              <Text style={[styles.bookmarkCategoryLabel, { color: '#67e8f9' }]}>Development resources</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/resources' as any)}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            {savedResources.length === 0
              ? <Text style={styles.dimText}>No saved resources yet.</Text>
              : savedResources.slice(0, 3).map(item => (
                <TouchableOpacity
                  key={item.resource_id}
                  style={styles.bookmarkItem}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.bookmarkTitle}>{item.title}</Text>
                  <Text style={styles.bookmarkSub}>{item.provider ?? 'Provider not specified'}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>

        {/* ── PROGRESS ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Your progress</Text>
          <Text style={styles.dimText}>Finished subjects help us recommend better career paths for you.</Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Academic progress</Text>
            <Text style={styles.progressValue}>{finishedCount} / {totalCount} subjects</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progressPercent}% complete</Text>
        </View>

        {/* ── CHANGE PASSWORD ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Change password</Text>
          <Text style={styles.dimText}>Keep your account secure by using a strong, unique password.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Current password"
              placeholderTextColor="#4b5563"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor="#4b5563"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Repeat new password"
              placeholderTextColor="#4b5563"
            />
          </View>

          <TouchableOpacity
            style={[styles.secondaryBtn, changingPassword && { opacity: 0.6 }]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.secondaryBtnText}>Update password</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── APP PREFERENCES ── */}
        <View style={[styles.card, !isDark && styles.cardLight]}>
          <Text style={[styles.cardHeading, !isDark && styles.textLight]}>Display settings</Text>
          <Text style={styles.dimText}>Adjust the app's appearance.</Text>
          
          <View style={[styles.themeToggleRow, !isDark && styles.themeToggleRowLight]}>
             {(['system', 'light', 'dark'] as const).map(mode => {
               const isActive = themeMode === mode;
               return (
                 <TouchableOpacity 
                   key={mode} 
                   onPress={() => setThemeMode(mode)}
                   style={[
                     styles.themeOption, 
                     isActive && (isDark ? styles.themeOptionActiveDark : styles.themeOptionActiveLight)
                   ]}
                 >
                   <Text style={[
                     styles.themeOptionText, 
                     isActive && (isDark ? styles.themeOptionTextActiveDark : styles.themeOptionTextActiveLight)
                   ]}>
                     {mode.charAt(0).toUpperCase() + mode.slice(1)}
                   </Text>
                 </TouchableOpacity>
               );
             })}
          </View>
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={18} color="#f87171" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  scrollContent: { padding: 16, paddingBottom: 48 },

  header: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#9ca3af' },

  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
    gap: 14,
  },
  cardHeading: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Avatar
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'center', backgroundColor: 'rgba(31,41,55,0.4)', borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', borderRadius: 14, padding: 14 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarInitial: { fontSize: 26, fontWeight: 'bold', color: '#a5b4fc' },
  avatarLabel: { color: '#fff', fontSize: 13, fontWeight: '500' },
  avatarHint: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  avatarBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  uploadBtn: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  removeBtn: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  removeBtnText: { color: '#fca5a5', fontSize: 12, fontWeight: '500' },

  // Form
  formRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1, gap: 6 },
  inputGroup: { gap: 6 },
  label: { color: '#6b7280', fontSize: 11, fontWeight: '500' },
  input: { backgroundColor: '#030712', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#374151', fontSize: 13 },
  inputDisabled: { backgroundColor: 'rgba(31,41,55,0.4)', color: '#6b7280' },
  readOnly: { color: '#d1d5db', fontSize: 13, fontWeight: '500', marginTop: 4 },

  saveBtn: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Subjects
  subjectsHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  subjectsHint: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  subSectionLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  subjectPanel: { backgroundColor: 'rgba(31,41,55,0.4)', borderWidth: 1, borderColor: 'rgba(55,65,81,0.6)', borderRadius: 12, padding: 12, gap: 10 },
  subjectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#374151', backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  subjectName: { color: '#d1d5db', fontSize: 13 },
  subjectDone: { color: '#6b7280', textDecorationLine: 'line-through' },
  subjectMeta: { color: '#6b7280', fontSize: 11, marginTop: 1 },
  remainingItem: { paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  dimText: { color: '#6b7280', fontSize: 12 },

  secondaryBtnSmall: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  secondaryBtnSmallText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Bookmarks
  bookmarkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookmarkSection: { gap: 8 },
  bookmarkSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookmarkCategoryLabel: { color: '#a5b4fc', fontSize: 12, fontWeight: '600' },
  viewAllText: { color: '#6b7280', fontSize: 11 },
  bookmarkItem: { backgroundColor: 'rgba(31,41,55,0.4)', borderWidth: 1, borderColor: '#1f2937', padding: 12, borderRadius: 12 },
  bookmarkTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bookmarkSub: { color: '#9ca3af', fontSize: 11, marginTop: 2 },

  // Progress
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressLabel: { color: '#9ca3af', fontSize: 12 },
  progressValue: { color: '#e5e7eb', fontSize: 12, fontWeight: '600' },
  progressBarBg: { height: 8, backgroundColor: '#1f2937', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  progressBarFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 4 },
  progressPercent: { color: '#818cf8', fontSize: 11, marginTop: 4 },

  // Password
  secondaryBtn: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, paddingVertical: 12, backgroundColor: 'rgba(239,68,68,0.05)', marginBottom: 8 },
  logoutText: { color: '#f87171', fontSize: 14, fontWeight: '600' },
  
  // Theme Overrides
  textLight: { color: '#111827' },
  cardLight: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  themeToggleRow: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 12, borderWidth: 1, borderColor: '#374151', padding: 4, marginTop: 8 },
  themeToggleRowLight: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  themeOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  themeOptionActiveDark: { backgroundColor: '#1f2937' },
  themeOptionActiveLight: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  themeOptionText: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
  themeOptionTextActiveDark: { color: '#fff', fontWeight: 'bold' },
  themeOptionTextActiveLight: { color: '#111827', fontWeight: 'bold' },
});
