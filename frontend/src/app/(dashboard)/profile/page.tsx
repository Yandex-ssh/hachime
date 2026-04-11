"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CareerGoal = {
  career_id: number;
  title: string;
  icon: string | null;
  progress: { completed: number; total: number; percent: number };
  gap?: { missing_subjects: { subject_id: number; subject_name: string }[] };
};

type ProfileResponse = {
  student_id: number;
  student_number: string;
  name: string;
  email?: string;
  profile_picture_url?: string | null;
  program_id?: number;
  year_level?: number;
  semester?: number;
  program?: string;
  program_code?: string;
  progress: {
    finishedSubjects: number;
    totalSubjects: number;
    semesterLabel?: string | null;
  };
  career_goal?: CareerGoal | null;
};

type SubjectRow = { subject_id: number; subject_name: string; year_level: number | null; semester: number | null };
type MySubjectsResponse = {
  finished_subjects: Array<{ subject_id: number; subject_name: string }>;
  liked_subjects: Array<{ subject_id: number; subject_name: string }>;
};
type SavedInternship = {
  internship_id: number;
  company_name: string;
  role_title: string;
  apply_url: string | null;
};
type SavedJob = {
  job_id: number;
  company_name: string;
  role_title: string;
  apply_url: string | null;
};
type SavedResource = {
  resource_id: number;
  title: string;
  provider: string | null;
  url: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [finishedSubjectIds, setFinishedSubjectIds] = useState<number[]>([]);
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

  const loadProfile = async () => {
    try {
      setError("");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(`${apiBaseUrl}/students/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setProfilePictureUrl(data.profile_picture_url || "");
      await loadSubjectsCatalog(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsCatalog = async (profileData?: ProfileResponse | null) => {
    try {
      const pid = profileData?.program_id;
      if (!pid) {
        setSubjects([]);
        return;
      }
      const params = new URLSearchParams();
      params.set("program_id", String(pid));
      if (profileData?.year_level) params.set("max_year_level", String(profileData.year_level));
      const res = await fetch(`${apiBaseUrl}/subjects?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setSubjects(
          (data as unknown[]).map((row) => {
            const s = (row ?? {}) as Record<string, unknown>;
            return {
              subject_id: Number(s.subject_id),
              subject_name: String(s.subject_name),
              year_level: (s.year_level as number | null) ?? null,
              semester: (s.semester as number | null) ?? null,
            };
          }),
        );
      }
    } catch {
      // ignore
    }
  };

  const loadMySubjects = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await fetch(`${apiBaseUrl}/students/me/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: MySubjectsResponse = await res.json();
      if (!res.ok) return;
      setFinishedSubjectIds((data.finished_subjects ?? []).map((s) => Number(s.subject_id)).filter((n) => Number.isFinite(n)));
    } catch {
      // ignore
    }
  };

  const loadSavedBookmarks = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const [internshipsRes, jobsRes, resourcesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/internships/me/saved`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/jobs/me/saved`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/resources/me/saved`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const internshipsData = await internshipsRes.json().catch(() => []);
      const jobsData = await jobsRes.json().catch(() => []);
      const resourcesData = await resourcesRes.json().catch(() => []);

      if (internshipsRes.ok && Array.isArray(internshipsData)) {
        const parsed = internshipsData
          .map((row) => {
            const item = (row ?? {}) as Record<string, unknown>;
            return {
              internship_id: Number(item.internship_id),
              company_name: String(item.company_name ?? "Unknown company"),
              role_title: String(item.role_title ?? "Internship"),
              apply_url: typeof item.apply_url === "string" ? item.apply_url : null,
            };
          })
          .filter((item) => Number.isFinite(item.internship_id));
        setSavedInternships(parsed);
      }

      if (jobsRes.ok && Array.isArray(jobsData)) {
        const parsed = jobsData
          .map((row) => {
            const item = (row ?? {}) as Record<string, unknown>;
            return {
              job_id: Number(item.job_id),
              company_name: String(item.company_name ?? "Unknown company"),
              role_title: String(item.role_title ?? "Job listing"),
              apply_url: typeof item.apply_url === "string" ? item.apply_url : null,
            };
          })
          .filter((item) => Number.isFinite(item.job_id));
        setSavedJobs(parsed);
      }

      if (resourcesRes.ok && Array.isArray(resourcesData)) {
        const parsed = resourcesData
          .map((row) => {
            const item = (row ?? {}) as Record<string, unknown>;
            return {
              resource_id: Number(item.resource_id),
              title: String(item.title ?? "Development resource"),
              provider: typeof item.provider === "string" ? item.provider : null,
              url: String(item.url ?? "#"),
            };
          })
          .filter((item) => Number.isFinite(item.resource_id));
        setSavedResources(parsed);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    (async () => {
      await loadProfile();
      await loadMySubjects();
      await loadSavedBookmarks();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Not authenticated");
      }

      setSavingProfile(true);

      const body: Record<string, unknown> = {
        name,
        email: email || undefined,
        profile_picture_url: profilePictureUrl || null,
      };

      const res = await fetch(`${apiBaseUrl}/students/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile(data);
      setSuccess("Profile updated successfully");

      // Also keep localStorage student in sync (if present)
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("student");
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            parsed.name = data.name;
            parsed.year_level = data.year_level;
            parsed.program = data.program;
            parsed.profile_picture_url = data.profile_picture_url ?? null;
            localStorage.setItem("student", JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfilePictureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("Image is too large. Please use an image up to 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setProfilePictureUrl(result);
      }
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const handleSaveSubjects = async () => {
    setError("");
    setSuccess("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const likedFiltered: number[] = [];

      setSavingSubjects(true);
      const res = await fetch(`${apiBaseUrl}/students/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          finished_subject_ids: finishedSubjectIds,
          liked_subject_ids: likedFiltered,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save subjects");

      setSuccess("Subjects updated");
      await loadMySubjects();
      await loadProfile();
      setIsEditingSubjects(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save subjects");
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Not authenticated");
      }

      setChangingPassword(true);

      const res = await fetch(`${apiBaseUrl}/students/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const progressPercent =
    profile && profile.progress.totalSubjects > 0
      ? Math.round(
        (profile.progress.finishedSubjects / profile.progress.totalSubjects) * 100,
      )
      : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>
          <p className="text-gray-400 text-sm">
            Manage your account details and see your progress.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile form */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold text-base">Account details</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-800/40 border border-gray-700/60 rounded-xl p-4">
            <div className="w-20 h-20 rounded-full border border-indigo-500/40 bg-indigo-600/20 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePictureUrl} alt="Profile picture preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-300 text-2xl font-bold">
                  {(name?.trim()?.[0] ?? profile?.name?.trim()?.[0] ?? "S").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Profile picture</p>
              <p className="text-gray-400 text-xs mt-1">Upload an image (JPG/PNG/WebP, max 10MB).</p>
              <div className="flex items-center gap-2 mt-3">
                <label className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium rounded-lg px-3 py-2 cursor-pointer transition">
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureFileChange}
                    className="hidden"
                  />
                </label>
                {profilePictureUrl && (
                  <button
                    type="button"
                    onClick={() => setProfilePictureUrl("")}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium rounded-lg px-3 py-2 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="student_number" className="text-xs font-medium text-gray-400">Student number</label>
                <input
                  id="student_number"
                  type="text"
                  value={profile?.student_number || ""}
                  disabled
                  className="bg-gray-800 border border-gray-700 text-gray-400 rounded-xl px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-gray-400">Email (optional)</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-gray-400">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Program</label>
                <div className="text-sm text-gray-300">
                  {profile?.program || "—"}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Year level</label>
                <div className="text-sm text-gray-300">
                  {profile?.year_level
                    ? `${profile.year_level}${profile.year_level === 1 ? "st" : profile.year_level === 2 ? "nd" : profile.year_level === 3 ? "rd" : "th"} Year`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="semester" className="text-xs font-medium text-gray-400">Current semester</label>
              <select
                id="semester"
                defaultValue={profile?.semester ?? ""}
                onChange={async (e) => {
                  const val = e.target.value;
                  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                  if (!token || !val) return;
                  await fetch(`${apiBaseUrl}/students/me`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ semester: Number(val) }),
                  });
                  await loadProfile();
                }}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64"
              >
                <option value="">Select semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
              <p className="text-gray-500 text-xs">Used to calculate your academic progress goal.</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-2 text-sm transition"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          {/* Subjects editor */}
          <div className="pt-5 border-t border-gray-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold text-base">Subjects</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Update your completed subject list used for progress and matching.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSubjects(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition"
              >
                Edit subjects
              </button>
            </div>

            {!profile?.program_id ? (
              <div className="text-gray-500 text-sm">
                Set your Program first to load subjects.
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-gray-500 text-sm">No subjects found for your program yet.</div>
            ) : (
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-4 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold text-sm">Completed Subjects</p>
                  <span className="text-gray-500 text-xs">{finishedSubjectIds.length} completed</span>
                </div>
                {finishedSubjectIds.length === 0 ? (
                  <p className="text-gray-500 text-xs">No subjects marked as completed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subjects
                      .filter((s) => finishedSubjectIds.includes(s.subject_id))
                      .slice(0, 12)
                      .map((s) => (
                        <span key={s.subject_id} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1.5 rounded-lg">
                          {s.subject_name}
                        </span>
                      ))}
                    {finishedSubjectIds.length > 12 && (
                      <span className="bg-gray-800/50 text-gray-500 text-xs px-2.5 py-1.5 rounded-lg">
                        +{finishedSubjectIds.length - 12} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Glassmorphism Modal for Editing Subjects */}
            {isEditingSubjects && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-all duration-300">
                <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-gray-900/60 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">Edit Subjects</h3>
                      <p className="text-indigo-200/70 text-sm mt-0.5">Manage your academic progress.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingSubjects(false);
                          loadMySubjects();
                        }}
                        disabled={savingSubjects}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-sm font-medium rounded-xl px-5 py-2 text-sm transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSubjects}
                        disabled={savingSubjects}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.4)] rounded-xl px-5 py-2 text-sm transition-all disabled:opacity-50"
                      >
                        {savingSubjects ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Search */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-indigo-300/50 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-white placeholder-gray-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-md transition-all shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Completed Column */}
                      <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg h-[45vh] min-h-[300px]">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-white font-medium tracking-wide">Completed</p>
                          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            {finishedSubjectIds.length}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {subjects
                            .filter((s) => s.subject_name.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
                            .map((s) => {
                              const checked = finishedSubjectIds.includes(s.subject_id);
                              return (
                                <label key={s.subject_id} className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checked ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                                  <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const next = e.target.checked
                                          ? Array.from(new Set([...finishedSubjectIds, s.subject_id]))
                                          : finishedSubjectIds.filter((id) => id !== s.subject_id);
                                        setFinishedSubjectIds(next);
                                      }}
                                      className="peer appearance-none w-4 h-4 rounded-md border border-gray-500 checked:border-indigo-500 checked:bg-indigo-500 transition-colors cursor-pointer"
                                    />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <span className={`${checked ? 'text-indigo-100' : 'text-gray-300 group-hover:text-white'} text-sm font-medium transition-colors`}>
                                    {s.subject_name}
                                    {s.year_level && <span className="block text-indigo-300/60 text-xs font-normal mt-0.5">Year {s.year_level}{s.semester ? ` • Sem ${s.semester}` : ""}</span>}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      </div>

                      {/* Remaining Subject List */}
                      <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg h-[45vh] min-h-[300px]">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-white font-medium tracking-wide">Available</p>
                          <span className="bg-white/10 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                            {subjects.length - finishedSubjectIds.length}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {subjects
                            .filter((s) => !finishedSubjectIds.includes(s.subject_id) && s.subject_name.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
                            .map((s) => (
                              <div
                                key={s.subject_id}
                                className="w-full text-left p-3 rounded-xl bg-black/20 border border-white/5 text-sm text-gray-400 group"
                              >
                                <span className="text-gray-300 font-medium">{s.subject_name}</span>
                                {s.year_level && <span className="block text-gray-500 text-xs mt-0.5">Year {s.year_level}{s.semester ? ` • Sem ${s.semester}` : ""}</span>}
                              </div>
                            ))}
                          {subjects.length === finishedSubjectIds.length && subjectSearchQuery === "" && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-emerald-300 text-sm font-medium">All subjects completed!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress + password */}
        <div className="space-y-5">
          {/* Bookmarked */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-white font-semibold text-sm">Bookmarked</h3>
              <span className="text-xs text-gray-500">
                {savedInternships.length + savedJobs.length + savedResources.length} saved
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-indigo-300">Internships</p>
                <Link href="/internships" className="text-[11px] text-gray-400 hover:text-white transition">
                  View all
                </Link>
              </div>
              {savedInternships.slice(0, 3).map((item) => (
                <a
                  key={item.internship_id}
                  href={item.apply_url ?? "/internships"}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-gray-800 bg-gray-800/40 px-3 py-2 hover:border-gray-700 transition"
                >
                  <p className="text-sm text-white">{item.role_title}</p>
                  <p className="text-xs text-gray-400">{item.company_name}</p>
                </a>
              ))}
              {savedInternships.length === 0 && <p className="text-xs text-gray-500">No saved internships yet.</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-violet-300">Job listings</p>
                <Link href="/jobs" className="text-[11px] text-gray-400 hover:text-white transition">
                  View all
                </Link>
              </div>
              {savedJobs.slice(0, 3).map((item) => (
                <a
                  key={item.job_id}
                  href={item.apply_url ?? "/jobs"}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-gray-800 bg-gray-800/40 px-3 py-2 hover:border-gray-700 transition"
                >
                  <p className="text-sm text-white">{item.role_title}</p>
                  <p className="text-xs text-gray-400">{item.company_name}</p>
                </a>
              ))}
              {savedJobs.length === 0 && <p className="text-xs text-gray-500">No saved jobs yet.</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-cyan-300">Development resources</p>
                <Link href="/resources" className="text-[11px] text-gray-400 hover:text-white transition">
                  View all
                </Link>
              </div>
              {savedResources.slice(0, 3).map((item) => (
                <a
                  key={item.resource_id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-gray-800 bg-gray-800/40 px-3 py-2 hover:border-gray-700 transition"
                >
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.provider ?? "Provider not specified"}</p>
                </a>
              ))}
              {savedResources.length === 0 && <p className="text-xs text-gray-500">No saved resources yet.</p>}
            </div>
          </div>

          {/* Progress card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Your progress</h3>

            <p className="text-gray-400 text-xs mb-2">
              Finished subjects help us recommend better career paths for you.
            </p>

            <div className="mt-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-xs">Academic progress</span>
                <span className="text-gray-200 text-xs font-semibold">
                  {profile?.progress.finishedSubjects || 0} / {profile?.progress.totalSubjects || 0} subjects ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-indigo-400 text-[11px] mt-1.5">
                {profile?.progress.semesterLabel
                  ? `You've completed ${profile.progress.finishedSubjects || 0} subjects (goal: ${profile.progress.totalSubjects} by end of ${profile.progress.semesterLabel})`
                  : `${progressPercent}% complete`}
              </p>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Change password</h3>
            <p className="text-gray-400 text-xs">
              Keep your account secure by using a strong, unique password.
            </p>

            <form className="space-y-3" onSubmit={handleChangePassword}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="current_password" className="text-xs font-medium text-gray-400">
                  Current password
                </label>
                <input
                  id="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new_password" className="text-xs font-medium text-gray-400">
                  New password
                </label>
                <input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm_password" className="text-xs font-medium text-gray-400">
                  Confirm new password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-2 text-sm transition"
              >
                {changingPassword ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

