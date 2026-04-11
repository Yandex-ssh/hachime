'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [allPrograms, setAllPrograms] = React.useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    fetchStudents();
    fetchAllPrograms();
  }, []);

  const fetchAllPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/programs`);
      if (res.ok) {
        const data = await res.json();
        setAllPrograms(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async (query = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/students${query ? `?search=${query}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) router.push('/dashboard');
        throw new Error('Failed to fetch students');
      }
      
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const handleDelete = async (student: any) => {
    if (!window.confirm(`⚠️ Permanently delete "${student.name}"?\n\nThis will remove all their data including subjects, bookmarks and career goal. This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/students/${student.student_id}/admin/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchStudents(search);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Failed to delete student');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete student');
    }
  };

  const pendingStudents = students.filter(s => !s.isActive && !s.last_login);
  const activeOrArchivedStudents = students.filter(s => s.isActive || s.last_login);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student <span className="text-indigo-400">Directory</span></h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage all registered student accounts.</p>
        </div>
        <button 
          onClick={async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/students`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'students_report.csv';
              a.click();
            } else {
              alert('Failed to export report');
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 group"
        >
          <span className="text-lg group-hover:rotate-12 transition-transform">📊</span>
          Export Reports
        </button>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search by name, student number, or email..."
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all border border-gray-700">
            Search
          </button>
        </form>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
            selectedProgramId === null
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
          }`}
        >
          🌐 Global View
        </button>
        {allPrograms.map((p) => (
          <button
            key={p.program_id}
            onClick={() => setSelectedProgramId(p.program_id)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
              selectedProgramId === p.program_id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
            }`}
          >
            {p.program_code} Track
          </button>
        ))}
      </div>

      {/* ── PENDING APPROVALS ── */}
      {!loading && pendingStudents.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-amber-400 font-bold text-lg">Pending Approvals</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
              {pendingStudents.length} requests
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/30 border-b border-gray-800/50">
                  <th className="px-6 py-4 font-bold text-[10px] text-amber-500/70 uppercase tracking-widest">Student Info</th>
                  <th className="px-6 py-4 font-bold text-[10px] text-amber-500/70 uppercase tracking-widest">Program</th>
                  <th className="px-6 py-4 font-bold text-[10px] text-amber-500/70 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {pendingStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">
                          {student.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{student.name}</div>
                          <div className="text-[11px] text-amber-200/50">{student.email} • {student.student_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 font-medium">
                        {student.program?.program_code || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/students/${student.student_id}`}
                          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xs transition-colors bg-amber-400/10 hover:bg-amber-400/20 px-4 py-2 rounded-lg border border-amber-400/20"
                        >
                          Review Account <span>→</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(student)}
                          className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold text-xs transition-colors bg-red-400/5 hover:bg-red-400/15 px-3 py-2 rounded-lg border border-red-400/20"
                          title="Permanently delete account"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DATA TABLE ── */}
      <h2 className="text-lg font-bold text-white mb-4">Student Directory</h2>
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative active-scale-hover transition-all">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <div className="text-gray-500 font-medium animate-pulse">Syncing student database...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/50 border-b border-gray-800">
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Student ID</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Identity</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Program Info</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {activeOrArchivedStudents.filter(s => selectedProgramId === null || s.program_id === selectedProgramId).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="text-3xl mb-4">📭</div>
                      <div className="text-gray-400 font-medium tracking-widest uppercase text-[10px] font-black">No Students Registered</div>
                      <p className="text-gray-600 text-[10px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                        The {selectedProgramId === null ? 'entire campus' : allPrograms.find(p => p.program_id === selectedProgramId)?.program_code || 'current'} track is currently empty.
                      </p>
                    </td>
                  </tr>
                ) : (
                  activeOrArchivedStudents
                    .filter(s => selectedProgramId === null || s.program_id === selectedProgramId)
                    .map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-5">
                         <span className="px-2 py-1 bg-gray-950 border border-gray-800 rounded text-[11px] font-mono font-bold text-indigo-400">
                           {student.student_number}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           {student.profile_picture_url ? (
                             <img 
                               src={student.profile_picture_url} 
                               alt={student.name} 
                               className="w-9 h-9 rounded-full object-cover border border-gray-800"
                             />
                           ) : (
                             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-800">
                               {student.name?.charAt(0) || '?'}
                             </div>
                           )}
                           <div>
                             <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{student.name}</div>
                             <div className="text-[11px] text-gray-500">{student.email || 'No email provided'}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-300 font-medium">
                          {student.program?.program_code || 'Unassigned'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {student.year_level ? `${student.year_level}${student.year_level === 1 ? 'st' : student.year_level === 2 ? 'nd' : student.year_level === 3 ? 'rd' : 'th'} Year` : 'Level unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {student.isActive ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 text-gray-500 border border-gray-700 text-[10px] font-bold uppercase tracking-wide">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            Archived
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/students/${student.student_id}`}
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-colors bg-indigo-400/5 hover:bg-indigo-400/10 px-3 py-1.5 rounded-lg border border-indigo-400/20"
                          >
                            View Details <span>→</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(student)}
                            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold text-xs transition-colors bg-red-400/5 hover:bg-red-400/15 px-3 py-1.5 rounded-lg border border-red-400/20"
                            title="Permanently delete account"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
