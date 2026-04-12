'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminJobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  const [allPrograms, setAllPrograms] = React.useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState({
    company_name: '', 
    role_title: '', 
    location: '', 
    work_type: 'On-site' as 'On-site' | 'Hybrid' | 'Remote', 
    employment_type: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract', 
    experience_level: 'Entry-level' as 'Entry-level' | 'Junior' | 'Mid' | 'Senior', 
    apply_url: '',
    is_active: true,
    program_ids: [] as number[]
  });

  const router = useRouter();

  React.useEffect(() => { 
    fetchJobs(); 
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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.map((j: any) => ({
          ...j,
          program_ids: typeof j.program_ids === 'string' ? JSON.parse(j.program_ids) : j.program_ids
        })));
      }
    } catch (e) {} finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/jobs/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/jobs`;
      const payload = {
        ...formData,
        program_ids: formData.program_ids.length > 0 ? formData.program_ids : null
      };

      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { resetForm(); fetchJobs(); }
    } catch (e) {}
  };

  const handleEdit = (j: any) => {
    setIsEditing(true); setEditId(j.job_id);
    setFormData({
      company_name: j.company_name || '', role_title: j.role_title || '', location: j.location || '',
      work_type: j.work_type || 'On-site', employment_type: j.employment_type || 'Full-time',
      experience_level: j.experience_level || 'Entry-level', is_active: j.is_active !== false,
      apply_url: j.apply_url || '',
      program_ids: j.program_ids || (j.program_id ? [j.program_id] : [])
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete job listing?")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/jobs/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchJobs();
  };

  const resetForm = () => {
    setFormData({ 
      company_name: '', 
      role_title: '', 
      location: '', 
      work_type: 'On-site', 
      employment_type: 'Full-time', 
      experience_level: 'Entry-level', 
      apply_url: '',
      is_active: true,
      program_ids: selectedProgramId ? [selectedProgramId] : []
    });
    setIsEditing(false); setEditId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-latte-text tracking-tight text-glow">Job <span className="text-blue-500">Listings</span></h1>
          <p className="text-latte-overlay1 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">Partner Opportunities</p>
        </div>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
            selectedProgramId === null
              ? 'bg-blue-600 text-latte-text border-blue-500 shadow-lg shadow-blue-600/20'
              : 'bg-latte-surface0 text-latte-overlay1 border-latte-crust hover:border-latte-mantle hover:text-latte-subtext0'
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
                ? 'bg-blue-600 text-latte-text border-blue-500 shadow-lg shadow-blue-600/20'
                : 'bg-latte-surface0 text-latte-overlay1 border-latte-crust hover:border-latte-mantle hover:text-latte-subtext0'
            }`}
          >
            {p.program_code} Track
          </button>
        ))}
      </div>
      <div className="bg-latte-surface0 border border-latte-crust rounded-3xl shadow-xl overflow-hidden glass-card transition-all duration-500">
        <div className="px-8 py-6 border-b border-latte-crust bg-latte-surface1/40 flex items-center justify-between">
           <h2 className="text-sm font-black text-gray-800 text-latte-text uppercase tracking-[0.2em] flex items-center gap-3">
             <span className="text-xl">{isEditing ? '💎' : '✨'}</span>
             {isEditing ? 'Refine Listing' : 'Register New Listing'}
           </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Company *</label>
              <input type="text" required className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Role Title *</label>
              <input type="text" required className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.role_title} onChange={e => setFormData({...formData, role_title: e.target.value})} />
            </div>
            <div className="group md:col-span-2">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Application URL (Optional)</label>
              <input type="url" placeholder="https://..." className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.apply_url} onChange={e => setFormData({...formData, apply_url: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group md:col-span-2">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Location</label>
              <input type="text" className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Work Type</label>
              <select className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value as any})}>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Employment Type</label>
              <select className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.employment_type} onChange={e => setFormData({...formData, employment_type: e.target.value as any})}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-3 ml-1 text-blue-400">Target Academic Tracks (Flexible Selection)</label>
              <div className="flex flex-wrap gap-2">
                {allPrograms.map(p => (
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
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                        : 'bg-latte-base border-latte-crust text-latte-overlay0 hover:border-latte-mantle'
                    }`}
                  >
                    {p.program_code}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-latte-crust">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-latte-text px-12 py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-95 text-glow transition-all">
              {isEditing ? 'COMMIT UPDATES' : 'INITIALIZE LISTING'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-latte-surface0 border border-latte-crust rounded-3xl shadow-xl overflow-hidden">
        {loading ? ( <div className="p-32 text-center text-latte-overlay1">Syncing Opportunities...</div> ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-latte-surface1/60 border-b border-latte-crust">
                <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest">Opportunity</th>
                <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest">Setup</th>
                <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {(() => {
                const filteredJobs = jobs.filter(j => 
                   selectedProgramId === null ||
                   (j.program_ids && Array.isArray(j.program_ids) && j.program_ids.includes(selectedProgramId)) ||
                   (j.program_id === selectedProgramId)
                );

                if (filteredJobs.length === 0) {
                  return (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                         <div className="text-4xl mb-4 grayscale opacity-20">💼</div>
                         <h4 className="text-latte-subtext0 font-black text-[10px] uppercase tracking-widest">No Opportunities Found</h4>
                         <p className="text-latte-overlay0 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
                           The {selectedProgramId === null ? 'entire database' : allPrograms.find(p => p.program_id === selectedProgramId)?.program_code || 'current'} track doesn't have active listings yet.
                         </p>
                      </td>
                    </tr>
                  );
                }

                return filteredJobs.map(j => (
                  <tr key={j.job_id} className="hover:bg-latte-mantle hover:bg-latte-surface2/40 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-sm text-latte-text uppercase tracking-tight flex items-center gap-2">
                        {j.role_title}
                        {j.apply_url && (
                          <a href={j.apply_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 text-lg transition-colors" title="Open Job Link">🔗</a>
                        )}
                      </div>
                      <div className="text-[10px] font-black text-latte-overlay1">{j.company_name}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-latte-overlay0 text-latte-subtext1">
                      <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">{j.work_type as string}</span>
                      <span className="ml-2 text-[10px] text-latte-subtext0 uppercase tracking-widest">{j.employment_type as string}</span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button onClick={() => handleEdit(j)} className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Refine</button>
                      <button onClick={() => handleDelete(j.job_id)} className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:underline">Purge</button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
