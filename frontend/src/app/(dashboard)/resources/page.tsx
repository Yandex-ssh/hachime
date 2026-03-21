"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResource = {
  resource_id: number;
  type: "Course" | "Certification" | "Roadmap" | "Article" | "Bootcamp";
  title: string;
  provider: string | null;
  url: string;
  description: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  cost_type: "Free" | "Paid" | "Freemium";
  certificate_offered: boolean;
  created_at?: string;
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

const typePills: Record<string, string> = {
  Course: "bg-gray-800 border-gray-700 text-gray-300",
  Certification: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  Roadmap: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
  Article: "bg-gray-800 border-gray-700 text-gray-300",
  Bootcamp: "bg-gray-800 border-gray-700 text-gray-300",
};

export default function ResourcesPage() {
  const [typeFilter, setTypeFilter] = useState<"All" | "Course" | "Certification" | "Roadmap">("All");
  const [sortBy, setSortBy] = useState<"recent" | "difficulty">("recent");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

  const loadResources = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (typeFilter !== "All") params.set("type", typeFilter);
      const res = await fetch(`${apiBaseUrl}/resources?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load resources");
      setResources(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resources");
      setResources([]);
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
      const res = await fetch(`${apiBaseUrl}/resources/me/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return;
      const ids = (Array.isArray(json) ? json : [])
        .map((r) => {
          const row = (r ?? {}) as Record<string, unknown>;
          return Number(row.resource_id);
        })
        .filter((n: number) => Number.isFinite(n));
      setSaved(ids);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadResources();
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadResources();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter]);

  const filtered = useMemo(() => {
    const list = [...resources].filter((r) => typeFilter === "All" || r.type === typeFilter);
    if (sortBy === "difficulty") {
      const order = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
      list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
      return list;
    }
    list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    return list;
  }, [resources, typeFilter, sortBy]);

  const certCount = filtered.filter((r) => r.type === "Certification").length;
  const freeCount = filtered.filter((r) => r.cost_type === "Free").length;

  const toggleSave = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setSaved((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/resources/${id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save resource");
      setSaved((prev) => (json.saved ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Development Resources</h2>
        <p className="text-gray-400 text-sm mt-1">Courses and certifications to build the skills you need next.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Available", value: filtered.length, color: "text-white", bg: "bg-gray-800 border-gray-700" },
          { label: "Certifications", value: certCount, color: "text-emerald-300", bg: "bg-emerald-500/5 border-emerald-500/20" },
          { label: "Free resources", value: freeCount, color: "text-indigo-300", bg: "bg-indigo-500/5 border-indigo-500/20" },
          { label: "Saved", value: saved.length, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
          />
          {(["All", "Course", "Certification", "Roadmap"] as const).map((t) => (
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
        <select
          aria-label="Sort resources"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "difficulty")}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="recent">Sort by: Most Recent</option>
          <option value="difficulty">Sort by: Difficulty</option>
        </select>
      </div>

      {/* Resource Cards */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="min-h-[25vh] flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading resources...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-600 text-sm border border-gray-800 rounded-2xl bg-gray-900">
            No resources found yet.
          </div>
        )}
        {!loading && filtered.map((r) => {
          const palette = ["indigo", "violet", "blue", "cyan"] as const;
          const c = colorMap[palette[r.resource_id % palette.length]];
          const isSaved = saved.includes(r.resource_id);
          return (
            <div
              key={r.resource_id}
              className={`bg-gray-900 border rounded-2xl p-5 hover:border-gray-700 transition ${isSaved ? c.border : "border-gray-800"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${c.tag}`}>
                  {r.type === "Certification" ? "🎓" : r.type === "Course" ? "📚" : "🗺️"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="text-white font-semibold">{r.title}</h4>
                      <p className="text-gray-400 text-sm">{r.provider ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 my-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${typePills[r.type]}`}>{r.type}</span>
                    <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">⚡ {r.difficulty}</span>
                    <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">💳 {r.cost_type}</span>
                    {r.certificate_offered && (
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full">
                        ✅ Certificate
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-xs mb-3">{r.description ?? "—"}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-xs">
                      Tip: save resources you want to finish this month.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave(r.resource_id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition font-medium
                          ${isSaved ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}
                      >
                        {isSaved ? "⭐ Saved" : "☆ Save"}
                      </button>
                      <a
                        href={r.url}
                        className="text-xs px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                      >
                        Open →
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

