'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDevTracksPage() {
  const [resources, setResources] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null); // Global default
  const [costFilter, setCostFilter] = React.useState<'All' | 'Free' | 'Paid' | 'Freemium'>('All');
  
  const [formData, setFormData] = React.useState({
    title: '', type: 'Course', provider: '', url: '', description: '', difficulty: 'Beginner', cost_type: 'Free', 
    program_id: '', program_ids: [] as number[],
    certificate_offered: false, is_active: true
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchResources();
    fetchPrograms();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setResources(await res.json());
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
      if (res.ok) setPrograms(await res.json());
    } catch (error) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/resources/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/resources`;

      const payload = { 
        ...formData, 
        program_id: formData.program_ids.length > 0 ? formData.program_ids[0] : (formData.program_id ? parseInt(formData.program_id) : null),
        program_ids: formData.program_ids
      };

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetForm();
        fetchResources();
      } else alert(`Failed to ${isEditing ? 'update' : 'add'} resource`);
    } catch (error) { console.error(error); }
  };

  const handleEdit = (r: any) => {
    setIsEditing(true);
    setEditId(r.resource_id);
    setFormData({
      title: r.title || '', type: r.type || 'Course', provider: r.provider || '', url: r.url || '',
      description: r.description || '', difficulty: r.difficulty || 'Beginner', cost_type: r.cost_type || 'Free',
      program_id: r.program_id || '', 
      program_ids: r.program_ids || (r.program_id ? [r.program_id] : []),
      certificate_offered: !!r.certificate_offered, is_active: r.is_active !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this track/resource?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/resources/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchResources();
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', type: 'Course', provider: '', url: '', description: '', difficulty: 'Beginner', cost_type: 'Free', 
      program_id: '', program_ids: selectedProgramId ? [selectedProgramId] : [],
      certificate_offered: false, is_active: true 
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight text-glow">Development <span className="text-violet-500">Tracks</span></h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">Resource Catalog & Pathing</p>
        </div>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
            selectedProgramId === null
              ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20'
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
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20'
                : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
            }`}
          >
            {p.program_code} Resources
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pb-4">
        {(["All", "Free", "Paid", "Freemium"] as const).map((c) => (
           <button
             key={c}
             onClick={() => setCostFilter(c)}
             className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
               costFilter === c
                 ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                 : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
             }`}
           >
             {c === "All" ? "All Costs" : c}
           </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden glass-card transition-all duration-500">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 flex items-center justify-between">
           <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
             <span className="text-xl">{isEditing ? '💎' : '✨'}</span>
             {isEditing ? 'Refine Track' : 'Register New Resource'}
           </h2>
           {isEditing && (
             <button onClick={resetForm} className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors flex items-center gap-1">
               <span>✖</span> Abortion Edit
             </button>
           )}
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Title *</label>
              <input type="text" required className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Type</label>
              <select className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Course">Course</option>
                <option value="Certification">Certification</option>
                <option value="Roadmap">Roadmap</option>
                <option value="Article">Article</option>
                <option value="Bootcamp">Bootcamp</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Cost Type</label>
              <select className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.cost_type} onChange={e => setFormData({...formData, cost_type: e.target.value as any})}>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
                <option value="Freemium">Freemium</option>
              </select>
            </div>
            <div className="group md:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 text-violet-400">Target Academic Tracks (Multi-Select)</label>
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
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                        : 'bg-gray-950 border-gray-800 text-gray-600 hover:border-gray-700'
                    }`}
                  >
                    {p.program_code}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Provider</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">URL Content</label>
              <input type="url" required className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Difficulty</label>
              <select className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-200 dark:border-gray-800 text-violet-600 focus:ring-violet-500/50 bg-gray-50 dark:bg-gray-950" checked={formData.certificate_offered} onChange={e => setFormData({...formData, certificate_offered: e.target.checked})} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400">Certificate Offered</span>
            </label>
             <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-200 dark:border-gray-800 text-violet-600 focus:ring-violet-500/50 bg-gray-50 dark:bg-gray-950" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400">Resource Active</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="submit" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white px-12 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 text-glow">
              {isEditing ? 'COMMIT UPDATES' : 'INITIALIZE TRACK'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-32 text-center text-gray-500">Syncing Catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Resource Identity</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Type & Source</th>
                  <th className="px-8 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
                {(() => {
                  const filteredResources = resources.filter(r => 
                    (costFilter === 'All' || r.cost_type === costFilter) &&
                    (selectedProgramId === null ||
                    (r.program_ids && Array.isArray(r.program_ids) && r.program_ids.includes(selectedProgramId)) ||
                    (r.program_id === selectedProgramId))
                  );

                  if (filteredResources.length === 0) {
                    return (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-gray-500">
                          <div className="text-4xl mb-4 grayscale opacity-20">📚</div>
                          <h4 className="font-black text-[10px] uppercase tracking-widest">No Domain-Specific Resources</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Initializing more learning paths for {selectedProgramId === null ? 'the entire institution' : programs.find(p => p.program_id === selectedProgramId)?.program_code || 'this track'} soon.</p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredResources.map((r) => (
                  <tr key={r.resource_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{r.title}</div>
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-violet-500 hover:text-violet-600 hover:underline">Link ↗</a>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-1 rounded text-[10px]">{r.type}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-[10px]">{r.cost_type || 'Free'}</span>
                        {!!r.certificate_offered && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded text-[10px]">CERT</span>
                        )}
                        <span className="text-xs text-gray-400 ml-1">{r.provider || '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button onClick={() => handleEdit(r)} className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest hover:underline">Refine</button>
                      <button onClick={() => handleDelete(r.resource_id)} className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:underline">Purge</button>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
