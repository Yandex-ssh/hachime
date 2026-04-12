'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSkillsPage() {
  const [skills, setSkills] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [allPrograms, setAllPrograms] = React.useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Add Skill Form State
  const [formData, setFormData] = React.useState({
    skill_name: '',
    category: '',
    description: '',
    learning_resource_url: '',
    program_ids: [] as number[],
    expanded_skills: [] as {name: string, url: string}[]
  });

  // Edit Skill Modal State
  const [editingSkill, setEditingSkill] = React.useState<any>(null);
  const [editFormData, setEditFormData] = React.useState({
    skill_name: '',
    category: '',
    description: '',
    learning_resource_url: '',
    program_ids: [] as number[],
    expanded_skills: [] as {name: string, url: string}[]
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchSkills();
    fetchAllPrograms();
  }, []);

  const fetchAllPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/programs`);
      if (res.ok) {
        setAllPrograms(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch skills');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.skill_name) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          expanded_skills: formData.expanded_skills.filter(s => s.name.trim() !== '')
        })
      });

      if (res.ok) {
        setFormData({ 
          skill_name: '', category: '', description: '', 
          learning_resource_url: '', program_ids: [], 
          expanded_skills: [] 
        });
        fetchSkills();
      } else {
        alert('Failed to add skill');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSkills();
      } else {
        alert('Failed to delete skill');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (skill: any) => {
    setEditingSkill(skill);
    setEditFormData({
      skill_name: skill.skill_name || '',
      category: skill.category || '',
      description: skill.description || '',
      learning_resource_url: skill.learning_resource_url || '',
      program_ids: skill.program_ids || [],
      expanded_skills: Array.isArray(skill.expanded_skills) ? skill.expanded_skills : (typeof skill.expanded_skills === 'string' && skill.expanded_skills ? skill.expanded_skills.split(',').map((s:string)=>({name: s.trim(), url: ''})) : [])
    });
  };

  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...editFormData,
        program_ids: editFormData.program_ids,
        expanded_skills: editFormData.expanded_skills.filter(s => s.name.trim() !== '')
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills/${editingSkill.skill_id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingSkill(null);
        fetchSkills();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.message || 'Failed to update skill');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update skill');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-latte-text tracking-tight">Skill <span className="text-indigo-400">Registry</span></h1>
          <p className="text-latte-overlay1 text-sm mt-1">Catalog and classify competency requirements for the career matrix.</p>
        </div>
      </div>

      {/* ── STATISTICS OVERVIEW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-latte-surface0/50 backdrop-blur-xl border border-latte-crust/50 rounded-2xl p-5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest">Total Skills</span>
            <span className="text-indigo-400 text-lg">📊</span>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-black text-latte-text">{skills.length}</span>
            <span className="text-[10px] text-latte-overlay0 mb-1.5 font-bold uppercase">Competencies</span>
          </div>
          <div className="h-1 w-full bg-latte-surface1 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        
        {allPrograms.slice(0, 3).map((prog, idx) => {
          const skillCount = skills.filter(s => s.program_ids?.includes(prog.program_id)).length;
          const colors = ['text-cyan-400', 'text-amber-400', 'text-rose-400'];
          const borders = ['group-hover:border-cyan-500/30', 'group-hover:border-amber-500/30', 'group-hover:border-rose-500/30'];
          const bgBars = ['bg-cyan-500', 'bg-amber-500', 'bg-rose-500'];
          
          return (
            <div key={prog.program_id} className={`bg-latte-surface0/50 backdrop-blur-xl border border-latte-crust/50 rounded-2xl p-5 flex flex-col justify-between group transition-all ${borders[idx % 3]}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-latte-overlay1 uppercase tracking-widest">{prog.program_code} Track</span>
                <span className={`${colors[idx % 3]} text-lg font-bold`}>⚡</span>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-black text-latte-text">{skillCount}</span>
                <span className="text-[10px] text-latte-overlay0 mb-1.5 font-bold uppercase">Mapped</span>
              </div>
              <div className="h-1 w-full bg-latte-surface1 rounded-full mt-4 overflow-hidden">
                <div className={`h-full ${bgBars[idx % 3]} rounded-full`} style={{ width: `${(skillCount / (skills.length || 1)) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="bg-latte-base/50 backdrop-blur-md border border-latte-crust rounded-2xl p-2 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-latte-overlay1 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search competencies by name, category, or description..."
            className="w-full bg-latte-surface0/50 border-none text-latte-text rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${
            selectedProgramId === null
              ? 'bg-indigo-600 text-latte-text border-indigo-500 shadow-lg shadow-indigo-600/20'
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
                ? 'bg-indigo-600 text-latte-text border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-latte-surface0 text-latte-overlay1 border-latte-crust hover:border-latte-mantle hover:text-latte-subtext0'
            }`}
          >
            {p.program_code} Track
          </button>
        ))}
      </div>

      {/* ── ADD NEW SKILL FORM ── */}
      <div className="bg-latte-surface0 border border-latte-crust rounded-2xl shadow-xl overflow-hidden active-scale-hover transition-all">
        <div className="px-7 py-5 bg-latte-base/30 border-b border-latte-crust">
           <h2 className="text-md font-bold text-latte-text flex items-center gap-2">
             <span className="text-indigo-400">🛠️</span> Register Core Competency
           </h2>
        </div>
        <form onSubmit={handleAddSkill} className="p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Skill Identity *</label>
              <input 
                type="text" required
                placeholder="e.g. Distributed Systems"
                className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.skill_name}
                onChange={(e) => setFormData({...formData, skill_name: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Classification</label>
              <input 
                type="text" 
                placeholder="e.g. Architectural, Frontend, Soft Skill"
                className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Conceptual Overview</label>
              <input 
                type="text" 
                placeholder="Briefly define the skill or its application..."
                className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1 text-indigo-400">Knowledge Base URL</label>
              <input 
                type="url" 
                placeholder="https://documentation.resource/link"
                className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.learning_resource_url}
                onChange={(e) => setFormData({...formData, learning_resource_url: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6 pt-6 border-t border-latte-crust/50">
            <div className="group">
              <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-3 ml-1 text-indigo-400 flex justify-between items-center">
                <span>Expanded Tech Stack / Specific Tools</span>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, expanded_skills: [...formData.expanded_skills, {name: '', url: ''}]})}
                  className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-latte-text px-2 py-1 rounded border border-indigo-500/20 text-[9px] transition-colors"
                >
                  + Add Tool Link
                </button>
              </label>
              <div className="space-y-2">
                {formData.expanded_skills.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text" placeholder="Name (e.g. GitHub)" 
                      className="w-1/3 bg-latte-base border border-latte-crust text-latte-text rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      value={sub.name}
                      onChange={e => {
                        const newSkills = [...formData.expanded_skills];
                        newSkills[idx].name = e.target.value;
                        setFormData({...formData, expanded_skills: newSkills});
                      }}
                    />
                    <input 
                      type="url" placeholder="Resource URL (https://...)" 
                      className="flex-1 bg-latte-base border border-latte-crust text-latte-text rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      value={sub.url}
                      onChange={e => {
                        const newSkills = [...formData.expanded_skills];
                        newSkills[idx].url = e.target.value;
                        setFormData({...formData, expanded_skills: newSkills});
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newSkills = formData.expanded_skills.filter((_, i) => i !== idx);
                        setFormData({...formData, expanded_skills: newSkills});
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-latte-surface0 border border-latte-crust hover:bg-rose-500 hover:border-rose-500 text-latte-overlay1 hover:text-latte-text rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.expanded_skills.length === 0 && (
                  <div className="text-xs text-latte-overlay0 italic px-2 py-3 border border-dashed border-latte-crust rounded-lg text-center">No specific tools mapped. Click "Add Tool Link" to create one.</div>
                )}
              </div>
            </div>
          </div>

          <div className="group mt-4">
            <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1 text-cyan-500/70">Associated Academic Tracks (Flexible)</label>
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
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all ${
                    formData.program_ids.includes(p.program_id)
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'bg-latte-base border-latte-crust text-latte-overlay0 hover:border-latte-mantle hover:text-latte-subtext0'
                  }`}
                >
                  {p.program_code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-latte-text px-10 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
              Secure Registry Entry
            </button>
          </div>
        </form>
      </div>

      {/* ── SKILLS LIST ── */}
      <div className="bg-latte-surface0 border border-latte-crust rounded-2xl shadow-xl overflow-hidden relative active-scale-hover transition-all">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <div className="text-latte-overlay1 font-medium animate-pulse">Syncing competency map...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-latte-base/50 border-b border-latte-crust">
                  <th className="px-6 py-5 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest">Skill Identity</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest">Classification</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest">Core Concept</th>
                  <th className="px-6 py-5 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest w-24 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {(() => {
                  const filteredSkills = skills.filter(s => {
                    const matchesProgram = selectedProgramId === null || (s.program_ids && Array.isArray(s.program_ids) && s.program_ids.includes(selectedProgramId));
                    const matchesSearch = !searchTerm || 
                      s.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesProgram && matchesSearch;
                  });

                  if (filteredSkills.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="text-3xl mb-4 grayscale opacity-20">⚒️</div>
                          <div className="text-latte-subtext0 font-medium">Registry is dormant.</div>
                          <p className="text-latte-overlay0 text-xs mt-1">Start by defining the first competency above.</p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredSkills.map((skill) => (
                    <tr key={skill.skill_id} className="hover:bg-latte-surface1/30 transition-colors group">
                      <td className="px-6 py-5">
                         <div className="text-sm font-bold text-latte-text group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                           {skill.skill_name}
                         </div>
                         <div className="flex flex-wrap gap-1 mt-1.5">
                           {skill.program_ids?.map((pid: number) => {
                             const prog = allPrograms.find(p => p.program_id === pid);
                             return (
                               <span key={pid} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-latte-base text-latte-overlay1 border border-latte-crust uppercase">
                                 {prog?.program_code}
                               </span>
                             );
                           })}
                         </div>
                      </td>
                      <td className="px-6 py-5 flex flex-col gap-1 items-start">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                          {skill.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[12px] text-latte-subtext0 line-clamp-2 max-w-sm leading-relaxed">{skill.description || 'Global industry standard competency.'}</p>
                        
                        {skill.expanded_skills && Array.isArray(skill.expanded_skills) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {skill.expanded_skills.map((s: any, i: number) => (
                              s.url ? (
                                <a 
                                  key={i} href={s.url} target="_blank" rel="noreferrer" 
                                  className="bg-indigo-500/5 hover:bg-indigo-500/20 text-[9px] text-indigo-300 hover:text-latte-text px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-black transition-colors flex items-center gap-1"
                                >
                                  {s.name} <span>↗</span>
                                </a>
                              ) : (
                                <span key={i} className="bg-latte-base text-[9px] text-latte-overlay1 px-1.5 py-0.5 rounded border border-latte-crust uppercase font-black">
                                  {s.name}
                                </span>
                              )
                            ))}
                          </div>
                        )}



                        {skill.learning_resource_url && (
                          <a 
                            href={skill.learning_resource_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-widest mt-2 group/link"
                          >
                            Documentation <span>↗</span>
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(skill)}
                            className="w-8 h-8 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 flex items-center justify-center p-0 m-0"
                            title="Edit Skill"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.skill_id)}
                            className="w-8 h-8 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-bold text-lg transition-colors border border-rose-500/20 flex items-center justify-center p-0 m-0 leading-none"
                            title="Purge Skill"
                          >
                            ×
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

      {/* ── EDIT SKILL MODAL ── */}
      {editingSkill && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(15,23,42,0.55)' }}
          onClick={() => setEditingSkill(null)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ 
              background: 'rgba(23, 31, 47, 0.95)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-latte-crust/50">
              <h2 className="text-lg font-bold text-latte-text flex items-center gap-3">
                <span className="text-indigo-400">📝</span> Edit Competency
              </h2>
              <button 
                onClick={() => setEditingSkill(null)}
                className="text-latte-overlay1 hover:text-latte-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateSkill} className="p-7 space-y-6 flex-1 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Skill Identity</label>
                  <input 
                    type="text" required
                    className="w-full bg-latte-base/50 border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700"
                    value={editFormData.skill_name}
                    onChange={(e) => setEditFormData({...editFormData, skill_name: e.target.value})}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Classification</label>
                  <input 
                    type="text" 
                    className="w-full bg-latte-base/50 border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Conceptual Overview</label>
                <textarea 
                  rows={3}
                  className="w-full bg-latte-base/50 border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700 resize-none"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1 text-indigo-400">Knowledge Base URL</label>
                <input 
                  type="url" 
                  className="w-full bg-latte-base/50 border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  value={editFormData.learning_resource_url}
                  onChange={(e) => setEditFormData({...editFormData, learning_resource_url: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 mt-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-3 ml-1 text-indigo-400 flex justify-between items-center">
                    <span>Expanded Tech Stack / Specific Tools</span>
                    <button 
                      type="button"
                      onClick={() => setEditFormData({...editFormData, expanded_skills: [...editFormData.expanded_skills, {name: '', url: ''}]})}
                      className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-latte-text px-2 py-1 rounded border border-indigo-500/20 text-[9px] transition-colors"
                    >
                      + Add Tool Link
                    </button>
                  </label>
                  <div className="space-y-2">
                    {editFormData.expanded_skills.map((sub, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" placeholder="Name" 
                          className="w-1/3 bg-latte-base/50 border border-latte-crust text-latte-text rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={sub.name}
                          onChange={e => {
                            const newSkills = [...editFormData.expanded_skills];
                            newSkills[idx].name = e.target.value;
                            setEditFormData({...editFormData, expanded_skills: newSkills});
                          }}
                        />
                        <input 
                          type="url" placeholder="URL" 
                          className="flex-1 bg-latte-base/50 border border-latte-crust text-latte-text rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={sub.url}
                          onChange={e => {
                            const newSkills = [...editFormData.expanded_skills];
                            newSkills[idx].url = e.target.value;
                            setEditFormData({...editFormData, expanded_skills: newSkills});
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newSkills = editFormData.expanded_skills.filter((_, i) => i !== idx);
                            setEditFormData({...editFormData, expanded_skills: newSkills});
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-latte-surface0 border border-latte-crust hover:bg-rose-500 hover:border-rose-500 text-latte-overlay1 hover:text-latte-text rounded-lg transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-2 ml-1 text-cyan-500/70">Associated Academic Tracks (Flexible)</label>
                <div className="flex flex-wrap gap-2">
                  {allPrograms.map(p => (
                    <button
                      key={p.program_id}
                      type="button"
                      onClick={() => {
                        const ids = editFormData.program_ids.includes(p.program_id)
                          ? editFormData.program_ids.filter(id => id !== p.program_id)
                          : [...editFormData.program_ids, p.program_id];
                        setEditFormData({ ...editFormData, program_ids: ids });
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        editFormData.program_ids.includes(p.program_id)
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : 'bg-latte-base/50 border-latte-crust text-latte-overlay0 hover:border-latte-mantle hover:text-latte-subtext0'
                      }`}
                    >
                      {p.program_code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-latte-crust/50">
                <button 
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-latte-subtext0 hover:text-latte-text transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-latte-text px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
                >
                  Update Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
