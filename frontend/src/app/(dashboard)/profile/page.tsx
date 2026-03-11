"use client";

import { useEffect, useState } from "react";

type ProfileResponse = {
  student_id: number;
  student_number: string;
  name: string;
  email?: string;
  program_id?: number;
  year_level?: number;
  program?: string;
  program_code?: string;
  progress: {
    finishedSubjects: number;
    totalSubjects: number;
  };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  useEffect(() => {
    loadProfile();
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

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Student number</label>
                <input
                  type="text"
                  value={profile?.student_number || ""}
                  disabled
                  className="bg-gray-800 border border-gray-700 text-gray-400 rounded-xl px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Full name</label>
              <input
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
        </div>

        {/* Progress + password */}
        <div className="space-y-5">
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
                  {profile?.progress.finishedSubjects || 0} /{" "}
                  {profile?.progress.totalSubjects || 0} subjects
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-indigo-400 text-[11px] mt-1.5">
                {progressPercent}% complete
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
                <label className="text-xs font-medium text-gray-400">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">
                  Confirm new password
                </label>
                <input
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

