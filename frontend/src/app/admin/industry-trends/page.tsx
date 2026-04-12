'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTrendsPage() {
  const formatSalary = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return '';
    const num = val.toString().replace(/[^0-9.]/g, '');
    if (!num) return '';
    return '₱' + parseFloat(num).toLocaleString();
  };

  const unformatSalary = (val: string) => {
    return val.replace(/[^0-9.]/g, '');
  };

  const [trends, setTrends] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [viewingTrend, setViewingTrend] = React.useState<any>(null);
  const [allPrograms, setAllPrograms] = React.useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    growth_rate: '',
    demand_level: '',
    salary_min: '',
    salary_max: '',
    description: '',
    year: '',
    icon: '📌',
    top_roles: '',
    top_skills: '',
    top_companies: '',
    insight: '',
    is_active: true,
    program_ids: [] as number[]
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchTrends();
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

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/trends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch trends');
      const data = await res.json();
      setTrends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/trends/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/trends`;

      const payload = {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(unformatSalary(formData.salary_min)) : null,
        salary_max: formData.salary_max ? parseFloat(unformatSalary(formData.salary_max)) : null,
        year: formData.year ? parseInt(formData.year) : null,
        top_roles: formData.top_roles.split(',').map(s => s.trim()).filter(s => s !== ""),
        top_skills: formData.top_skills.split(',').map(s => s.trim()).filter(s => s !== ""),
        top_companies: formData.top_companies.split(',').map(s => s.trim()).filter(s => s !== ""),
        program_ids: formData.program_ids.length > 0 ? formData.program_ids : null
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
        fetchTrends();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} trend`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (trend: any) => {
    setIsEditing(true);
    setEditId(trend.id);
    setFormData({
      title: trend.title || '',
      growth_rate: trend.growth_rate || trend.growth || '',
      demand_level: trend.demand_level || trend.demandLevel || '',
      salary_min: formatSalary(trend.salary_min || trend.salaryMin),
      salary_max: formatSalary(trend.salary_max || trend.salaryMax),
      description: trend.description || '',
      year: trend.year || '',
      icon: trend.icon || '📌',
      top_roles: Array.isArray(trend.top_roles) ? trend.top_roles.join(', ') : (Array.isArray(trend.topRoles) ? trend.topRoles.join(', ') : ''),
      top_skills: Array.isArray(trend.top_skills) ? trend.top_skills.join(', ') : (Array.isArray(trend.topSkills) ? trend.topSkills.join(', ') : ''),
      top_companies: Array.isArray(trend.top_companies) ? trend.top_companies.join(', ') : (Array.isArray(trend.companies) ? trend.top_companies?.join(', ') || '' : ''),
      insight: trend.insight || '',
      is_active: trend.is_active !== undefined ? trend.is_active : true,
      program_ids: trend.program_ids || (trend.program_id ? [trend.program_id] : [])
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this trend?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/trends/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTrends();
      } else {
        alert('Failed to delete trend');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', growth_rate: '', demand_level: '', salary_min: '', salary_max: '', description: '', year: '', 
      icon: '📌', top_roles: '', top_skills: '', top_companies: '', insight: '', is_active: true,
      program_ids: selectedProgramId ? [selectedProgramId] : []
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-latte-text tracking-tight text-glow">Industry <span className="text-emerald-500">Trends</span></h1>
          <p className="text-latte-overlay1 text-sm mt-1 uppercase tracking-widest font-black text-[10px]">Market Growth & Demand Signals</p>
        </div>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
            selectedProgramId === null
              ? 'bg-emerald-600 text-latte-text border-emerald-500 shadow-lg shadow-emerald-600/20'
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
                ? 'bg-emerald-600 text-latte-text border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-latte-surface0 text-latte-overlay1 border-latte-crust hover:border-latte-mantle hover:text-latte-subtext0'
            }`}
          >
            {p.program_code} Insights
          </button>
        ))}
      </div>

      <div className="bg-latte-surface0 border border-latte-crust rounded-3xl shadow-xl overflow-hidden glass-card transition-all duration-500">
        <div className="px-8 py-6 border-b border-latte-crust bg-latte-surface1/40 flex items-center justify-between">
           <h2 className="text-sm font-black text-gray-800 text-latte-text uppercase tracking-[0.2em] flex items-center gap-3">
             <span className="text-xl">{isEditing ? '💎' : '✨'}</span>
             {isEditing ? 'Refine Market Trend' : 'Register New Trend'}
           </h2>
           {isEditing && (
             <button onClick={resetForm} className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors flex items-center gap-1">
               <span>✖</span> Abortion Edit
             </button>
           )}
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group md:col-span-2">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Trend Domain *</label>
              <input 
                type="text" required
                placeholder="e.g. Artificial Intelligence"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Icon (Emoji)</label>
              <input 
                type="text"
                placeholder="🚀"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Reference Year</label>
              <input 
                type="number"
                placeholder="2026"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Growth Index</label>
              <input 
                type="text"
                placeholder="e.g. +45%"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.growth_rate}
                onChange={(e) => setFormData({...formData, growth_rate: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Demand Level</label>
              <select 
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.demand_level}
                onChange={(e) => setFormData({...formData, demand_level: e.target.value})}
              >
                <option value="">Select Demand</option>
                <option value="Very High">Very High</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="group flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Salary Min</label>
                <input 
                  type="text"
                  placeholder="e.g. ₱50,000"
                  className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({...formData, salary_min: formatSalary(e.target.value)})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Salary Max</label>
                <input 
                  type="text"
                  placeholder="e.g. ₱100,000"
                  className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({...formData, salary_max: formatSalary(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Top Job Roles (comma separated)</label>
              <input 
                type="text"
                placeholder="Software Engineer, Data Scientist"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.top_roles}
                onChange={(e) => setFormData({...formData, top_roles: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">In-Demand Skills (comma separated)</label>
              <input 
                type="text"
                placeholder="React, TypeScript, Python"
                className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={formData.top_skills}
                onChange={(e) => setFormData({...formData, top_skills: e.target.value})}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-3 ml-1 text-emerald-400">Target Academic Tracks (Multi-Select)</label>
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
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-latte-base border-latte-crust text-latte-overlay0 hover:border-latte-mantle'
                  }`}
                >
                  {p.program_code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Companies Hiring (comma separated)</label>
                <input 
                    type="text"
                    placeholder="Google, Microsoft, Accenture"
                    className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    value={formData.top_companies}
                    onChange={(e) => setFormData({...formData, top_companies: e.target.value})}
                />
            </div>
            <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1 text-indigo-400">Industry Insight Snippet</label>
                <input 
                    type="text"
                    placeholder="Brief 1-sentence tip/insight"
                    className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    value={formData.insight}
                    onChange={(e) => setFormData({...formData, insight: e.target.value})}
                />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1">Full Market Insight / Description</label>
            <textarea 
              className="w-full bg-latte-surface1 border border-latte-crust text-latte-text rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none h-24"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-4 border-t border-latte-crust">
            <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-latte-text px-12 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 text-glow">
              {isEditing ? 'COMMIT UPDATES' : 'INITIALIZE TREND'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-latte-surface0 border border-latte-crust rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-32 text-center text-latte-overlay1">Syncing Matrix...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-latte-surface1/60 border-b border-latte-crust">
                  <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest">Domain</th>
                  <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest">Growth Index</th>
                  <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest">Compensation Matrix</th>
                  <th className="px-8 py-6 font-black text-[10px] text-latte-overlay1 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
                {(() => {
                  const filteredTrends = trends.filter(t => 
                    selectedProgramId === null ||
                    (t.program_ids && Array.isArray(t.program_ids) && t.program_ids.includes(selectedProgramId)) ||
                    (t.program_id === selectedProgramId)
                  );

                  if (filteredTrends.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                           <div className="text-4xl mb-4 grayscale opacity-20">📊</div>
                           <h4 className="text-latte-subtext0 font-black text-[10px] uppercase tracking-widest">No Sector Intelligence Available</h4>
                           <p className="text-latte-overlay0 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
                             The {selectedProgramId === null ? 'entire market' : allPrograms.find(p => p.program_id === selectedProgramId)?.program_code || 'current'} track doesn't have active trends tracked yet.
                           </p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredTrends.map((t) => (
                    <tr key={t.id} className="hover:bg-latte-mantle hover:bg-latte-surface2/40 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-latte-mantle bg-latte-surface1/50 flex items-center justify-center text-xl border border-latte-crust transition-transform group-hover:scale-110">
                              {t.icon || '📌'}
                          </div>
                          <div>
                              <div className="font-bold text-sm text-latte-text uppercase tracking-tight">{t.title}</div>
                              <div className="text-[10px] font-black text-latte-overlay1">{t.year || 'Current'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm">
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">{t.growth || 'N/A'}</span>
                        <span className="ml-2 text-xs text-latte-overlay1">{t.demandLevel}</span>
                      </td>
                      <td className="px-8 py-6 text-sm text-latte-overlay0 text-latte-subtext1 tabular-nums">
                        ₱{(t.salaryMin || t.salary_min || 0).toLocaleString()} – ₱{(t.salaryMax || t.salary_max || 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right flex items-center justify-end gap-4">
                        <button 
                          onClick={() => setViewingTrend(t)}
                          className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 group/view"
                        >
                          <span className="text-sm group-hover:scale-125 transition-transform">👁️</span> View
                        </button>
                        <button onClick={() => handleEdit(t)} className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 group/refine">
                          <span className="text-sm group-hover:rotate-12 transition-transform">💎</span> Refine
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 group/purge">
                          <span className="text-sm group-hover:scale-110 transition-transform">✖</span> Purge
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* ── TREND DETAIL CARD MODAL ── */}
      {viewingTrend && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(10,15,25,0.75)' }}
          onClick={() => setViewingTrend(null)}
        >
          <div 
            className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.6)] flex flex-col max-h-full"
            style={{ 
              background: 'rgba(23, 31, 47, 0.98)', 
              border: '1px solid rgba(255,255,255,0.12)', 
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glossy Header Area */}
            <div className="relative px-12 py-12 border-b border-latte-crust/50 bg-gradient-to-br from-indigo-500/10 to-transparent">
              <button 
                onClick={() => setViewingTrend(null)}
                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-latte-base/5 flex items-center justify-center text-latte-subtext0 hover:text-latte-text hover:bg-latte-base/10 transition-all border border-latte-crust active:scale-90 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center text-5xl shadow-inner border border-indigo-500/20 animate-pulse-slow">
                  {viewingTrend.icon || '📌'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-500/30 uppercase tracking-[0.2em]">
                      {viewingTrend.year || '2026 Alpha'}
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-indigo-500/30 uppercase tracking-[0.2em]">
                      {viewingTrend.demand_level || viewingTrend.demandLevel || 'High Demand'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-latte-text tracking-tighter uppercase">{viewingTrend.title}</h2>
                  <p className="text-latte-overlay1 font-bold text-xs mt-1 tracking-widest uppercase opacity-70">Strategic Market Intelligence Report</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-12 space-y-12 overflow-y-auto custom-scrollbar">
              {/* Stats & Demand Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-8 rounded-[2rem] bg-latte-base/5 border border-latte-crust/50 shadow-inner flex flex-col justify-center">
                  <p className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-3">Compounded Growth</p>
                  <p className="text-4xl font-black text-emerald-500 tracking-tight">{viewingTrend.growth_rate || viewingTrend.growth || 'No Data'}</p>
                </div>
                <div className="lg:col-span-2 p-8 rounded-[2rem] bg-latte-base/5 border border-latte-crust/50 shadow-inner">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1">Market Saturation Index</p>
                            <p className="text-xl font-black text-latte-text uppercase tracking-tight">{viewingTrend.demand_level || viewingTrend.demandLevel || 'Targeting'}</p>
                        </div>
                        <p className="text-emerald-500 font-black text-sm">₱{(viewingTrend.salary_min || viewingTrend.salaryMin || 0).toLocaleString()} <span className="text-latte-overlay0 text-xs">—</span> ₱{(viewingTrend.salary_max || viewingTrend.salaryMax || 0).toLocaleString()} <span className="text-[10px] text-latte-overlay1">/MO</span></p>
                    </div>
                    {/* Progress Bar logic matching dashboard */}
                    <div className="w-full bg-latte-base rounded-full h-3 p-1 border border-latte-crust/50">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                            style={{ 
                                width: (viewingTrend.demand_level || viewingTrend.demandLevel) === 'Very High' ? '100%' : 
                                       (viewingTrend.demand_level || viewingTrend.demandLevel) === 'High' ? '75%' : 
                                       (viewingTrend.demand_level || viewingTrend.demandLevel) === 'Medium' ? '50%' : '25%' 
                            }}
                        />
                    </div>
                </div>
              </div>

              {/* Roles & Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Top Roles */}
                <div>
                   <h3 className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        Key Professional Archetypes
                    </h3>
                    <div className="space-y-3">
                        {(Array.isArray(viewingTrend.top_roles) ? viewingTrend.top_roles : (Array.isArray(viewingTrend.topRoles) ? viewingTrend.topRoles : ['Pending Analysis'])).map((role: string) => (
                            <div key={role} className="flex items-center gap-3 bg-latte-base/5 rounded-2xl px-5 py-4 border border-latte-crust/50 transition-colors hover:bg-latte-base/10 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                                <span className="text-latte-subtext1 text-sm font-bold uppercase tracking-tight">{role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In-Demand Skills */}
                <div>
                    <h3 className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Technological Prerequisites
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {(Array.isArray(viewingTrend.top_skills) ? viewingTrend.top_skills : (Array.isArray(viewingTrend.topSkills) ? viewingTrend.topSkills : ['TBD'])).map((skill: string) => (
                            <span key={skill} className="text-[10px] font-black px-4 py-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 uppercase tracking-widest hover:border-indigo-500/50 transition-colors cursor-default">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mt-10 mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        Hiring Entities (PH Market)
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {(Array.isArray(viewingTrend.top_companies) ? viewingTrend.top_companies : (Array.isArray(viewingTrend.companies) ? viewingTrend.companies : ['Confidential'])).map((company: string) => (
                            <span key={company} className="text-[10px] font-bold px-4 py-2 bg-latte-base border border-latte-crust/50 text-latte-overlay1 rounded-xl hover:text-latte-subtext1 transition-colors">
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
              </div>

              {/* Industry Insight */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 flex gap-6 items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                    <span className="text-8xl">💡</span>
                </div>
                <span className="text-4xl">💡</span>
                <div className="relative">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Executive Insight</p>
                    <p className="text-gray-200 text-xl font-bold leading-snug tracking-tight italic">
                        "{viewingTrend.insight || 'Aggregated market data indicates a significant shift towards this domain. Early adoption is highly recommended.'}"
                    </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <button 
                   onClick={() => setViewingTrend(null)}
                   className="w-full border border-latte-crust text-latte-text hover:bg-latte-base/5 px-8 py-5 rounded-[1.8rem] font-black text-xs transition-all uppercase tracking-[0.3em] active:scale-[0.98]"
                >
                   Close Dossier
                </button>
                <button 
                   onClick={() => {
                        handleEdit(viewingTrend);
                        setViewingTrend(null);
                   }}
                   className="w-full bg-latte-base text-gray-950 hover:bg-gray-200 px-8 py-5 rounded-[1.8rem] font-black text-xs transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] active:scale-[0.98] shadow-2xl"
                >
                   💎 Finalize Adjustment 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
