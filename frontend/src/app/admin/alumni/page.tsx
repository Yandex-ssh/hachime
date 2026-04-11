'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAlumniPage() {
  const [alumni, setAlumni] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [viewingAlumni, setViewingAlumni] = React.useState<any>(null);
  
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null); // Global default
  
  const [formData, setFormData] = React.useState({
    name: '',
    program_id: '',
    program_ids: [] as number[],
    batch_year: '',
    graduated_year: '',
    current_job_title: '',
    current_company: '',
    location: '',
    salary_range: '',
    months_to_land_job: '',
    advice: '',
    linkedin_url: '',
    is_visible: true
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchAlumni();
    fetchPrograms();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/alumni?admin=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch alumni');
      const data = await res.json();
      setAlumni(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/alumni/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/alumni`;

      const payload = {
        ...formData,
        program_id: formData.program_ids.length > 0 ? formData.program_ids[0] : (formData.program_id ? parseInt(formData.program_id) : null),
        program_ids: formData.program_ids,
        batch_year: formData.batch_year ? parseInt(formData.batch_year) : null,
        graduated_year: formData.graduated_year ? parseInt(formData.graduated_year) : null,
        months_to_land_job: formData.months_to_land_job ? parseInt(formData.months_to_land_job) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetForm();
        fetchAlumni();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} alumni`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (alumniMember: any) => {
    setIsEditing(true);
    setEditId(alumniMember.id);
    setFormData({
      name: alumniMember.name || '',
      program_id: programs.find(p => p.program_code === alumniMember.program)?.program_id || '',
      program_ids: alumniMember.program_ids || (alumniMember.program_id ? [alumniMember.program_id] : []),
      batch_year: alumniMember.batch || alumniMember.batchYear || alumniMember.batch_year || '',
      graduated_year: alumniMember.graduatedYear || alumniMember.graduated_year || '',
      current_job_title: alumniMember.currentRole || '',
      current_company: alumniMember.company || '',
      location: alumniMember.location || '',
      salary_range: alumniMember.salary || '',
      months_to_land_job: alumniMember.monthsToLand || '',
      advice: alumniMember.advice || '',
      linkedin_url: alumniMember.linkedin || '',
      is_visible: alumniMember.is_visible !== undefined ? alumniMember.is_visible : true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this alumni profile?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/alumni/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAlumni();
      } else {
        alert('Failed to delete alumni');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      program_id: '',
      program_ids: selectedProgramId ? [selectedProgramId] : [],
      batch_year: '',
      graduated_year: '',
      current_job_title: '',
      current_company: '',
      location: '',
      salary_range: '',
      months_to_land_job: '',
      advice: '',
      linkedin_url: '',
      is_visible: true
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-glow">Alumni <span className="text-indigo-400">Network</span></h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">Registry of Graduate Success & Career Trajectories</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/alumni`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'alumni_report.csv';
                a.click();
              } else {
                alert('Failed to export report');
              }
            }}
            className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 group shadow-lg active:scale-95"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform">📊</span>
            Export Global Report (CSV)
          </button>
        </div>
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
        {programs.map((p) => (
          <button
            key={p.program_id}
            onClick={() => setSelectedProgramId(p.program_id)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
              selectedProgramId === p.program_id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
            }`}
          >
            {p.program_code} Alumni
          </button>
        ))}
      </div>

      {/* ── FORM SECTION ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden glass-card transition-all duration-500">
        <div className="px-8 py-6 border-b border-gray-800 bg-gray-950/40 flex items-center justify-between">
           <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
             <span className="text-xl">{isEditing ? '💎' : '✨'}</span>
             {isEditing ? 'Refining Success Profile' : 'Register New Achievement'}
           </h2>
           {isEditing && (
             <button onClick={resetForm} className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors flex items-center gap-1">
               <span>✖</span> Abortion Edit
             </button>
           )}
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Identity *</label>
              <input 
                type="text" required
                placeholder="e.g. John Doe, M.Sc."
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="group md:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 text-indigo-400">Affiliated Academic Tracks (Multi-Select)</label>
              <div className="flex flex-wrap gap-2">
                {programs.map(p => (
                  <button
                    key={p.program_id}
                    type="button"
                    onClick={() => {
                      const ids = formData.program_ids.includes(p.program_id)
                        ? formData.program_ids.filter(id => id !== p.program_id)
                        : [...formData.program_ids, p.program_id];
                      setFormData({ ...formData, program_ids: ids });
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.program_ids.includes(p.program_id)
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : 'bg-gray-950 border-gray-800 text-gray-600 hover:border-gray-700'
                    }`}
                  >
                    {p.program_code}
                  </button>
                ))}
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Inaugural Batch</label>
              <input 
                type="number"
                placeholder="2020"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.batch_year}
                onChange={(e) => setFormData({...formData, batch_year: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Professional Designation</label>
              <input 
                type="text"
                placeholder="e.g. Senior Software Architect"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.current_job_title}
                onChange={(e) => setFormData({...formData, current_job_title: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Current Enterprise</label>
              <input 
                type="text"
                placeholder="e.g. Meta, Open AI"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.current_company}
                onChange={(e) => setFormData({...formData, current_company: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Base Location</label>
              <input 
                type="text"
                placeholder="e.g. San Francisco, US"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 text-emerald-400">Compensation Tier</label>
              <input 
                type="text"
                placeholder="e.g. $150k - $200k"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-gray-800 font-medium"
                value={formData.salary_range}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Market Entry Velocity</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="3"
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                  value={formData.months_to_land_job}
                  onChange={(e) => setFormData({...formData, months_to_land_job: e.target.value})}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600 uppercase">Months</span>
              </div>
            </div>
            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 text-indigo-400">LinkedIn Nexus</label>
              <input 
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Strategic Story for Student Cohort</label>
            <textarea 
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800 min-h-[120px] resize-none"
              placeholder="What success story or wisdom would you share with students?"
              value={formData.advice}
              onChange={(e) => setFormData({...formData, advice: e.target.value})}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-800/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                <div className="w-10 h-5 bg-gray-800 rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                Public Signal Broadcast (Visible Profile)
              </span>
            </label>
            
            <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-glow">
              {isEditing ? 'COMMIT UPDATES' : 'INITIALIZE PROFILE'}
            </button>
          </div>
        </form>
      </div>

      {/* ── ALUMNI LIST ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden relative group/list active-scale-hover transition-all duration-300">
        {loading ? (
          <div className="p-32 text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
            <div className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Global Network...</div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/60 border-b border-gray-800">
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Alumni Identity</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Designation & Entity</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Academic Origins</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Public Status</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {(() => {
                  const filteredAlumni = alumni.filter(a => 
                    selectedProgramId === null ||
                    (a.program_ids && Array.isArray(a.program_ids) && a.program_ids.includes(selectedProgramId)) ||
                    (a.program_id === selectedProgramId) ||
                    (programs.find(p => p.program_code === a.program)?.program_id === selectedProgramId)
                  );

                  if (filteredAlumni.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                           <span className="text-5xl mb-6 block filter grayscale opacity-20 group-hover/list:grayscale-0 group-hover/list:opacity-100 transition-all duration-1000">🎓</span>
                           <h4 className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Network Dormant</h4>
                           <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
                             Modernizing paths for {selectedProgramId === null ? 'the entire institution' : programs.find(p => p.program_id === selectedProgramId)?.program_code || 'this'} track. <br/>
                             No alumni success profiles registered here yet.
                           </p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredAlumni.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/40 transition-all group/row">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-sm text-white group-hover/row:text-indigo-400 transition-colors uppercase tracking-tight">{member.name}</div>
                          {(member.linkedin || member.linkedin_url) && (
                            <a 
                              href={member.linkedin || member.linkedin_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest"
                            >
                              LinkedIn Profile <span className="opacity-50">↗</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="text-[12px] font-bold text-gray-200">{member.currentRole || member.current_job_title || 'In Transition'}</div>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{member.company || member.current_company || 'Autonomous'}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5 items-start">
                          {member.program_ids && Array.isArray(member.program_ids) ? (
                            member.program_ids.map((pid: number) => {
                              const prog = programs.find(p => p.program_id === pid);
                              return (
                                <span key={pid} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                  {prog?.program_code || pid}
                                </span>
                              );
                            })
                          ) : (
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                              {member.program || 'Global'}
                            </span>
                          )}
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter w-full">Batch {member.batch || member.batchYear || member.batch_year || 'XXXX'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${member.is_visible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                          <div className={`w-1 h-1 rounded-full animate-pulse ${member.is_visible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {member.is_visible ? 'Active Signal' : 'Signal Shadow'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover/row:opacity-100 transition-all">
                          <button
                            onClick={() => setViewingAlumni(member)}
                            className="bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 group/view"
                          >
                            <span className="text-sm group-hover/view:scale-125 transition-transform">👁️</span> View
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="bg-gray-800 hover:bg-emerald-600 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 group/refine"
                          >
                            <span className="text-sm group-hover/refine:rotate-12 transition-transform">💎</span> Refine
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="bg-gray-800 hover:bg-rose-600 text-gray-600 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 group/purge"
                          >
                             <span className="text-sm group-hover/purge:scale-110 transition-transform">✖</span> Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ALUMNI DETAIL CARD MODAL ── */}
      {viewingAlumni && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(10,15,25,0.75)' }}
          onClick={() => setViewingAlumni(null)}
        >
          <div 
            className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.6)] flex flex-col max-h-full"
            style={{ 
              background: 'rgba(15, 23, 42, 0.98)', 
              border: '1px solid rgba(255,255,255,0.12)', 
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glossy Header Area */}
            <div className="relative px-12 py-12 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
              <button 
                onClick={() => setViewingAlumni(null)}
                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10 active:scale-90 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center text-5xl shadow-inner border border-indigo-500/20">
                  🎓
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-indigo-500/30 uppercase tracking-[0.2em]">
                      Batch {viewingAlumni.batch || viewingAlumni.batch_year || 'XXXX'}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-500/30 uppercase tracking-[0.2em]">
                      {viewingAlumni.program || 'Global Track'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{viewingAlumni.name}</h2>
                  <p className="text-gray-500 font-bold text-xs mt-1 tracking-widest uppercase opacity-70 italic">Verified Alumni Success Profile</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-12 space-y-12 overflow-y-auto custom-scrollbar">
              {/* Career Path Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-inner">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        Professional Trajectory
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl mt-1">💼</span>
                            <div>
                                <p className="text-white font-black text-lg leading-tight uppercase tracking-tight">{viewingAlumni.currentRole || viewingAlumni.current_job_title || 'Designation Pending'}</p>
                                <p className="text-indigo-400 text-sm font-bold">{viewingAlumni.company || viewingAlumni.current_company || 'Autonomous Enterprise'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <span className="text-xl opacity-50">📍</span>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{viewingAlumni.location || 'Distributed Node'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-inner">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Market Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Compensation Tier</p>
                            <p className="text-xl font-black text-emerald-400">{viewingAlumni.salary || viewingAlumni.salary_range || 'Confidential'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Market Speed</p>
                            <p className="text-xl font-black text-white">{viewingAlumni.monthsToLand || viewingAlumni.months_to_land_job || '—'} <span className="text-[10px] text-gray-500">Months to Hire</span></p>
                        </div>
                    </div>
                    {viewingAlumni.linkedin && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <a 
                                href={viewingAlumni.linkedin || viewingAlumni.linkedin_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-6 py-4 rounded-2xl font-black text-[10px] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] border border-indigo-500/20"
                            >
                                🔗 Synchronize via LinkedIn
                            </a>
                        </div>
                    )}
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-10 flex gap-8 items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                    <span className="text-8xl italic font-black text-white">"</span>
                </div>
                <span className="text-5xl mt-1 rotate-12 group-hover:rotate-0 transition-transform duration-500">🏆</span>
                <div className="relative">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                         <span className="w-4 h-[1px] bg-indigo-500" />
                         Strategic Story for Students
                    </p>
                    <p className="text-gray-200 text-xl font-bold leading-relaxed tracking-tight italic">
                        "{viewingAlumni.advice || 'No strategic advice provided yet. This alumni is leading by example through their professional trajectory.'}"
                    </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <button 
                   onClick={() => setViewingAlumni(null)}
                   className="w-full border border-white/10 text-white hover:bg-white/5 px-8 py-5 rounded-[1.8rem] font-black text-xs transition-all uppercase tracking-[0.3em] active:scale-[0.98]"
                >
                   Return to Network
                </button>
                <button 
                   onClick={() => {
                        handleEdit(viewingAlumni);
                        setViewingAlumni(null);
                   }}
                   className="w-full bg-white text-gray-950 hover:bg-gray-200 px-8 py-5 rounded-[1.8rem] font-black text-xs transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] active:scale-[0.98] shadow-2xl"
                >
                   💎 Refine Achievement Profile 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
