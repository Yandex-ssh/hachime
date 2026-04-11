'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeProfiles: 0,
    totalSubjects: 0,
    totalCareers: 0,
    popularCareers: [] as any[],
    topSubjects: [] as any[],
    progression: [] as any[],
  });
  const [mockStats] = React.useState({
    industryTrends: [
      { name: "Artificial Intelligence", growth: "+45%", trend: "up" },
      { name: "Cloud Computing", growth: "+32%", trend: "up" },
      { name: "Cybersecurity", growth: "+28%", trend: "up" },
      { name: "Data Science", growth: "+25%", trend: "up" },
    ],
    developmentTracks: [
      { name: "Full-Stack Web Dev", enrolled: 1240 },
      { name: "Mobile App Eng", enrolled: 856 },
      { name: "DevOps & Cloud", enrolled: 642 },
      { name: "UX/UI Design", enrolled: 531 },
    ],
    jobListings: [
      { role: "Frontend Developer", company: "TechNova Inc.", type: "Full-time", location: "Remote" },
      { role: "Data Analyst Intern", company: "DataSync", type: "Internship", location: "New York" },
      { role: "Backend Engineer", company: "CloudScale", type: "Full-time", location: "San Francisco" },
      { role: "UI/UX Designer", company: "CreativeWorks", type: "Full-time", location: "Remote" },
    ]
  });
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await res.json();
      setStats({
        totalStudents: data.totalStudents || 0,
        activeProfiles: data.activeProfiles || 0,
        totalSubjects: data.totalSubjects || 0,
        totalCareers: data.totalCareers || 0,
        popularCareers: data.popularCareers || [],
        topSubjects: data.topSubjects || [],
        progression: data.progression || [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── WELCOME BANNER ── */}
      <div className="relative bg-gradient-to-br from-indigo-600/30 via-indigo-600/10 to-gray-900 border border-indigo-500/20 rounded-2xl p-8 overflow-hidden shadow-2xl shadow-indigo-900/10 active-scale-hover transition-all">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">System <span className="text-indigo-400">Overview</span></h2>
            <p className="text-gray-400 text-sm max-w-md">
              Manage student pathways, curriculum analytics, and career mapping from your central command center.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-xl px-5 py-3 shadow-xl">
               <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Status</div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-white font-semibold text-sm">All Systems Operational</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Students", value: stats.totalStudents, sub: `${stats.activeProfiles} Active`, color: "indigo", icon: "👥" },
          { label: "Total Subjects", value: stats.totalSubjects, sub: "Curriculum Units", color: "violet", icon: "📚" },
          { label: "Total Careers", value: stats.totalCareers, sub: "Mapped Paths", color: "blue", icon: "🎯" },
          { label: "Avg Engagement", value: "4.8", sub: "User Satisfaction", color: "emerald", icon: "⭐" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors shadow-xl group">
             <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-${item.color}-600/15 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live</div>
             </div>
             <h3 className="text-gray-400 text-xs font-medium mb-1">{item.label}</h3>
             <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold text-white">{item.value}</span>
               <span className="text-[10px] font-semibold text-indigo-400/80">{item.sub}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Careers */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
               <span className="text-indigo-400">🔥</span> Popular Career Goals
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trending</span>
          </div>
          <div className="space-y-5">
            {stats.popularCareers.length > 0 ? stats.popularCareers.map((c, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    {i+1}. {c.title}
                  </span>
                  <span className="text-xs font-bold text-indigo-400">{c.count} students</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out group-hover:from-indigo-500 group-hover:to-indigo-300" 
                    style={{ width: `${Math.min(100, (Number(c.count) / (stats.totalStudents || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : <p className="text-gray-500 text-sm italic">Gathering student data...</p>}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
               <span className="text-pink-400">💖</span> Student Favorites
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Based on Likes</span>
          </div>
          <div className="space-y-5">
            {stats.topSubjects.length > 0 ? stats.topSubjects.map((s, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    {i+1}. {s.name}
                  </span>
                  <span className="text-xs font-bold text-pink-400">{s.count} likes</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-800/50">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-600 to-rose-400 rounded-full transition-all duration-1000 ease-out group-hover:from-pink-500 group-hover:to-rose-300" 
                    style={{ width: `${Math.min(100, (Number(s.count) / (stats.totalStudents || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : <p className="text-gray-500 text-sm italic">Waiting for feedback...</p>}
          </div>
        </div>

        {/* Student Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
               <span className="text-indigo-400">📊</span> Academic Distribution
            </h3>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Students per Year</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-56 gap-6 px-4">
            {[1, 2, 3, 4].map(year => {
              const data = stats.progression.find(p => Number(p.year) === year);
              const count = data ? Number(data.studentCount) : 0;
              const height = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full flex flex-col justify-end items-center h-full relative">
                    <div 
                      className="w-full max-w-[60px] bg-indigo-600/20 border border-indigo-500/30 rounded-t-xl transition-all duration-700 hover:bg-indigo-600/40 hover:border-indigo-400/50 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      style={{ height: `${Math.max(8, height)}%` }}
                    >
                      {/* Gradient overlay inside bar */}
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent pointer-events-none" />
                      
                      <div className="hidden group-hover:flex absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in zoom-in-50 duration-200">
                        {count} Students
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-indigo-400 tracking-tighter uppercase mb-0.5 opacity-50 group-hover:opacity-100 transition-opacity">Level</span>
                    <span className="text-xs font-bold text-gray-400 tracking-wider">Year {year}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── NEW SECTIONS: TRENDS, TRACKS, JOBS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Industry Trends */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
               <span className="text-emerald-500 dark:text-emerald-400">📈</span> Industry Trends
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Q3 Growth</span>
          </div>
          <div className="space-y-4">
            {mockStats.industryTrends.map((trend, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                    #{i+1}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{trend.name}</span>
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                  {trend.growth}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Tracks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 shadow-xl transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
               <span className="text-violet-500 dark:text-violet-400">🗺️</span> Development Tracks
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Paths</span>
          </div>
          <div className="space-y-4">
            {mockStats.developmentTracks.map((track, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-violet-500/30 dark:hover:border-violet-500/30 transition-colors group">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{track.name}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{track.enrolled} Students Enrolled</span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-violet-500 dark:bg-violet-400 rounded-full group-hover:scale-150 transition-transform"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 shadow-xl transition-colors md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
               <span className="text-blue-500 dark:text-blue-400">💼</span> Recent Job Listings
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="space-y-4">
            {mockStats.jobListings.map((job, i) => (
              <div key={i} className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{job.role}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{job.type}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">{job.company}</span>
                  <span className="text-gray-400 dark:text-gray-600 flex items-center gap-1">📍 {job.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
