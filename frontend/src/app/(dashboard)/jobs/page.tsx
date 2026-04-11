"use client";

import { useEffect, useMemo, useState } from "react";

type ApiJob = {
  job_id: number;
  company_name: string;
  role_title: string;
  location: string | null;
  work_type: "On-site" | "Hybrid" | "Remote" | null;
  employment_type: "Full-time" | "Part-time" | "Contract";
  experience_level: "Entry-level" | "Junior" | "Mid" | "Senior";
  description: string | null;
  required_subject_ids?: number[] | null;
  apply_url: string | null;
  deadline: string | null;
  posted_at?: string;
};

type MySubjectsResponse = {
  finished_subjects: Array<{ subject_id: number; subject_name: string }>;
  liked_subjects: Array<{ subject_id: number; subject_name: string }>;
};

const colorMap: Record<string, { badge: string; border: string; tag: string }> = {
  indigo: {
    badge: "bg-indigo-500/20 text-indigo-300",
    border: "border-indigo-500/40",
    tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  },
  violet: {
    badge: "bg-violet-500/20 text-violet-300",
    border: "border-violet-500/40",
    tag: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  },
  blue: {
    badge: "bg-blue-500/20 text-blue-300",
    border: "border-blue-500/40",
    tag: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  cyan: {
    badge: "bg-cyan-500/20 text-cyan-300",
    border: "border-cyan-500/40",
    tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
};

const typeColors: Record<string, string> = {
  "On-site": "bg-green-500/10 text-green-400 border-green-500/20",
  Hybrid: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Remote: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function JobsPage() {
  const [typeFilter, setTypeFilter] = useState<"All" | "On-site" | "Hybrid" | "Remote">("All");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [mySubjects, setMySubjects] = useState<MySubjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (typeFilter !== "All") params.set("work_type", typeFilter);
      const res = await fetch(`${apiBaseUrl}/jobs?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load jobs");
      setJobs(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSaved = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setSaved([]);
        return;
      }
      const res = await fetch(`${apiBaseUrl}/jobs/me/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return;
      const ids = (Array.isArray(json) ? json : [])
        .map((r: any) => Number(r.job_id))
        .filter((n: number) => Number.isFinite(n));
      setSaved(ids);
    } catch {
      // ignore
    }
  };

  const loadMySubjects = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setMySubjects(null);
        return;
      }
      const res = await fetch(`${apiBaseUrl}/students/me/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return;
      setMySubjects(json);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadJobs();
    loadSaved();
    loadMySubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadJobs();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter]);

  const filtered = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    return list;
  }, [jobs]);

  const toggleSave = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // fallback to local-only save for guests
      setSaved((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/jobs/${id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save job");
      setSaved((prev) => (json.saved ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
    } catch {
      // ignore
    }
  };

  const finishedSet = useMemo(() => new Set((mySubjects?.finished_subjects ?? []).map((s) => s.subject_id)), [mySubjects]);
  const subjectNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of mySubjects?.finished_subjects ?? []) m.set(s.subject_id, s.subject_name);
    for (const s of mySubjects?.liked_subjects ?? []) m.set(s.subject_id, s.subject_name);
    return m;
  }, [mySubjects]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Job Listings</h2>
        <p className="text-gray-400 text-sm mt-1">Roles aligned to your program and progress.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, companies..."
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
          />
          {(["All", "On-site", "Hybrid", "Remote"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border
                ${typeFilter === t ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="min-h-[25vh] flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading jobs...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-600 text-sm border border-gray-800 rounded-2xl bg-gray-900">
            No jobs found yet.
          </div>
        )}
        {!loading && filtered.map((job) => {
          const palette = ["indigo", "violet", "blue", "cyan"] as const;
          const c = colorMap[palette[job.job_id % palette.length]];
          const isSaved = saved.includes(job.job_id);
          const requiredIds = Array.isArray(job.required_subject_ids) ? job.required_subject_ids : [];
          const matched = requiredIds.filter((id) => finishedSet.has(Number(id)));
          const missing = requiredIds.filter((id) => !finishedSet.has(Number(id)));
          const reqPct = requiredIds.length > 0 ? Math.round((matched.length / requiredIds.length) * 100) : null;
          return (
            <div
              key={job.job_id}
              className={`bg-gray-900 border rounded-2xl p-5 hover:border-gray-700 transition ${isSaved ? c.border : "border-gray-800"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Logo */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${c.tag}`}>
                  🧾
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="text-white font-semibold">{job.role_title}</h4>
                      <p className="text-gray-400 text-sm">{job.company_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{job.work_type ?? "—"}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 my-3">
                    {job.work_type && (
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColors[job.work_type]}`}>
                        {job.work_type}
                      </span>
                    )}
                    <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">📍 {job.location ?? "—"}</span>
                    <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">🧾 {job.employment_type}</span>
                  </div>

                  <p className="text-gray-500 text-xs mb-3">{job.description ?? "—"}</p>

                  {/* Course ↔ Job requirements mapping */}
                  {mySubjects && requiredIds.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-500 text-xs">Subject requirements</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {reqPct}% match ({matched.length}/{requiredIds.length})
                        </span>
                      </div>
                      {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {missing.slice(0, 6).map((id) => (
                            <span
                              key={id}
                              className="bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] px-2 py-0.5 rounded-full"
                            >
                              Missing: {subjectNameById.get(Number(id)) ?? `Subject #${id}`}
                            </span>
                          ))}
                          {missing.length > 6 && (
                            <span className="bg-gray-800 border border-gray-700 text-gray-400 text-[11px] px-2 py-0.5 rounded-full">
                              +{missing.length - 6} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] px-3 py-2 rounded-xl">
                          You’ve completed all mapped subjects for this job.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave(job.job_id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition font-medium
                          ${isSaved ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
                      >
                        {isSaved ? "⭐ Saved" : "☆ Save"}
                      </button>
                      <a
                        href={job.apply_url ?? "#"}
                        className="text-xs px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                      >
                        Apply Now →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

