'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCareersPage() {
  const [careers, setCareers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);

  // Career Form State
  const [isCareerModalOpen, setIsCareerModalOpen] = React.useState(false);
  const [isEditingCareer, setIsEditingCareer] = React.useState(false);
  const [editCareerId, setEditCareerId] = React.useState<number | null>(null);
  const [careerFormData, setCareerFormData] = React.useState({
    title: '',
    icon: '',
    description: '',
    salary_min: '',
    salary_max: '',
    growth_rate: '',
    demand_level: 'Medium',
    program_ids: [] as number[]
  });

  // Subject Linking State
  const [activeCareer, setActiveCareer] = React.useState<any>(null);
  const [careerSubjects, setCareerSubjects] = React.useState<any[]>([]);
  const [allSubjects, setAllSubjects] = React.useState<any[]>([]);
  const [allPrograms, setAllPrograms] = React.useState<any[]>([]);
  const [linkForm, setLinkForm] = React.useState({ subjectId: '', weight: 1, isRequired: true });
  const [subjectSearchQuery, setSubjectSearchQuery] = React.useState('');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = React.useState(false);

  // Skill Linking State
  const [careerSkills, setCareerSkills] = React.useState<any[]>([]);
  const [allSkills, setAllSkills] = React.useState<any[]>([]);
  const [allSubjectSkills, setAllSubjectSkills] = React.useState<any[]>([]);
  const [skillLinkForm, setSkillLinkForm] = React.useState({ skillId: '', priority: 'medium' });
  const [skillSearchQuery, setSkillSearchQuery] = React.useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    fetchCareers();
    fetchAllSubjects();
    fetchAllSkills();
    fetchAllPrograms();
    fetchAllSubjectSkills();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch careers');
      const data = await res.json();
      setCareers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = isEditingCareer ? 'PATCH' : 'POST';
      const url = isEditingCareer
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${editCareerId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers`;

      const payload = {
        ...careerFormData,
        salary_min: careerFormData.salary_min ? parseFloat(careerFormData.salary_min) : null,
        salary_max: careerFormData.salary_max ? parseFloat(careerFormData.salary_max) : null,
        program_ids: careerFormData.program_ids.length > 0 ? careerFormData.program_ids : null
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
        setIsCareerModalOpen(false);
        resetCareerForm();
        fetchCareers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCareer = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchCareers();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditCareer = (e: React.MouseEvent, career: any) => {
    e.stopPropagation();
    setIsEditingCareer(true);
    setEditCareerId(career.career_id);
    setCareerFormData({
      title: career.title || '',
      icon: career.icon || '',
      description: career.description || '',
      salary_min: career.salary_min || '',
      salary_max: career.salary_max || '',
      growth_rate: career.growth_rate || '',
      demand_level: career.demand_level || 'Medium',
      program_ids: career.program_ids || []
    });
    setIsCareerModalOpen(true);
  };

  const resetCareerForm = () => {
    setCareerFormData({
      title: '', icon: '', description: '',
      salary_min: '', salary_max: '', growth_rate: '',
      demand_level: 'Medium', program_ids: []
    });
    setIsEditingCareer(false);
    setEditCareerId(null);
  };

  const fetchAllSubjects = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects`);
    if (res.ok) setAllSubjects(await res.json());
  };

  const fetchAllPrograms = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/programs`);
    if (res.ok) setAllPrograms(await res.json());
  };

  const fetchAllSkills = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setAllSkills(await res.json());
  };

  const fetchAllSubjectSkills = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/all-skills`);
    if (res.ok) setAllSubjectSkills(await res.json());
  };

  const openCareerDetails = async (career: any) => {
    setActiveCareer(career);
    fetchCareerSubjects(career.career_id);
    fetchCareerSkills(career.career_id);
  };

  const fetchCareerSubjects = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${id}/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setCareerSubjects(await res.json());
  };

  const fetchCareerSkills = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${id}/skills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCareerSkills(data.map((cs: any) => ({
        ...cs,
        expanded_skills: typeof cs.expanded_skills === 'string' ? JSON.parse(cs.expanded_skills) : cs.expanded_skills
      })));
    }
  };

  const handleLinkSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.subjectId || !activeCareer) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${activeCareer.career_id}/subjects/${linkForm.subjectId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: Number(linkForm.weight), is_required: linkForm.isRequired })
    });
    if (res.ok) {
      setLinkForm({ subjectId: '', weight: 1, isRequired: true });
      setSubjectSearchQuery('');
      fetchCareerSubjects(activeCareer.career_id);
    }
  };

  const handleUnlinkSubject = async (sid: number) => {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${activeCareer.career_id}/subjects/${sid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCareerSubjects(activeCareer.career_id);
  };

  const handleLinkSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillLinkForm.skillId || !activeCareer) return;
    const token = localStorage.getItem('token');
    const initialPriority = 'medium';

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${activeCareer.career_id}/skills/${skillLinkForm.skillId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: initialPriority })
    });
    if (res.ok) {
      setSkillLinkForm({ skillId: '', priority: 'medium' });
      setSkillSearchQuery('');
      fetchCareerSkills(activeCareer.career_id);
    }
  };

  const handleUnlinkSkill = async (sid: number) => {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/careers/${activeCareer.career_id}/skills/${sid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCareerSkills(activeCareer.career_id);
  };

  const renderSkillItem = (cs: any) => {
    return (
      <div key={cs.skill_id} className="flex flex-col p-4 border border-gray-800 rounded-3xl bg-gray-950/40 hover:bg-gray-800/30 transition-all group relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <div>
              <p className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight flex items-center gap-2">
                {cs.skill_name}
              </p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                {cs.category || 'Competency'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => handleUnlinkSkill(cs.skill_id)}
                className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-sm hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Remove Skill Mapping"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {cs.expanded_skills && Array.isArray(cs.expanded_skills) && (
          <div className="flex flex-wrap gap-1 mt-2 pl-6">
            {cs.expanded_skills.map((sub: any, idx: number) => (
              sub.url ? (
                <a
                  key={idx} href={sub.url} target="_blank" rel="noreferrer"
                  className="bg-indigo-500/5 hover:bg-indigo-500/20 text-[9px] text-indigo-300 hover:text-white px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter transition-colors flex items-center gap-1"
                >
                  {sub.name} <span>↗</span>
                </a>
              ) : (
                <span key={idx} className="bg-gray-900/50 text-[9px] text-gray-400 px-2 py-0.5 rounded border border-gray-800 uppercase tracking-tighter">
                  {sub.name}
                </span>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Career <span className="text-indigo-400">Architect</span></h1>
          <p className="text-gray-500 text-sm mt-1">Design career pathways and map them to curriculum requirements.</p>
        </div>
        <button
          onClick={() => { resetCareerForm(); setIsCareerModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 group"
        >
          <span className="text-xl">＋</span>
          Add New Career
        </button>
      </div>

      {/* ── PROGRAM TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => setSelectedProgramId(null)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${selectedProgramId === null
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
            }`}
        >
          🌐 Global View
        </button>
        {allPrograms.map((p) => (
          <button
            key={p.program_id}
            onClick={() => setSelectedProgramId(p.program_id)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap ${selectedProgramId === p.program_id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
              }`}
          >
            {p.program_code} Track
          </button>
        ))}
      </div>

      {/* ── CAREER CRUD MODAL ── */}
      {isCareerModalOpen && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{isEditingCareer ? 'Edit Career' : 'New Career'}</h2>
              <button onClick={() => setIsCareerModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleCareerSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-4 gap-5">
                <div className="col-span-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Title</label>
                  <input type="text" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" value={careerFormData.title} onChange={e => setCareerFormData({ ...careerFormData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Icon</label>
                  <input type="text" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm text-center" value={careerFormData.icon} onChange={e => setCareerFormData({ ...careerFormData, icon: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" value={careerFormData.description} onChange={e => setCareerFormData({ ...careerFormData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Min Salary</label>
                  <input type="number" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" value={careerFormData.salary_min} onChange={e => setCareerFormData({ ...careerFormData, salary_min: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Salary</label>
                  <input type="number" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" value={careerFormData.salary_max} onChange={e => setCareerFormData({ ...careerFormData, salary_max: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCareerModalOpen(false)} className="text-gray-500 text-xs font-bold uppercase">Discard</button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm">Save Career</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SPLIT VIEW ── */}
      <div className="grid grid-cols-12 gap-8 mt-6 items-start">
        {/* Left: Careers */}
        <div className="col-span-5 bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden flex flex-col h-[750px]">
          <div className="px-6 py-5 border-b border-gray-800 bg-gray-950/20">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest">Available Pathways</h3>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {careers.filter(c => selectedProgramId === null || (c.program_ids && c.program_ids.includes(selectedProgramId))).map(career => (
              <div
                key={career.career_id}
                className={`px-6 py-5 border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition-all ${activeCareer?.career_id === career.career_id ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : ''}`}
                onClick={() => openCareerDetails(career)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center text-xl border border-gray-800">{career.icon || '🎯'}</div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{career.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-black">{career.demand_level} Demand</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => openEditCareer(e, career)} className="text-gray-500 hover:text-indigo-400">✏️</button>
                    <button onClick={(e) => handleDeleteCareer(e, career.career_id)} className="text-gray-500 hover:text-rose-400">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="col-span-7 h-[750px] overflow-y-auto custom-scrollbar space-y-6">
          {activeCareer ? (
            <>
              <div className="bg-gradient-to-br from-indigo-900/40 to-gray-900 border border-indigo-500/20 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">{activeCareer.title}</h2>
                <p className="text-gray-400 text-sm">{activeCareer.description}</p>
              </div>

              {/* Subjects */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/20">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">📚 Curriculum Map</h3>
                </div>
                <div className="p-6 bg-indigo-600/5 border-b border-gray-800">
                  <form onSubmit={handleLinkSubject} className="flex gap-2 relative">
                    <div className="relative flex-1">
                      <input
                        type="text" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" placeholder="Search subject..."
                        value={subjectSearchQuery} onChange={(e) => { setSubjectSearchQuery(e.target.value); setIsSubjectDropdownOpen(true); }}
                      />
                      {isSubjectDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                          {allSubjects.filter(s => s.subject_name.toLowerCase().includes(subjectSearchQuery.toLowerCase())).slice(0, 5).map(s => (
                            <div key={s.subject_id} className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm text-gray-300" onClick={() => { setLinkForm({ ...linkForm, subjectId: s.subject_id.toString() }); setSubjectSearchQuery(s.subject_name); setIsSubjectDropdownOpen(false); }}>{s.subject_name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" className="w-16 bg-gray-950 border border-gray-800 text-white rounded-xl text-center text-sm" value={linkForm.weight} onChange={e => setLinkForm({ ...linkForm, weight: Number(e.target.value) })} />
                    <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-bold text-sm whitespace-nowrap">Link</button>
                  </form>
                </div>
                <div className="p-4 space-y-2">
                  {careerSubjects.map(cs => (
                    <div key={cs.subject_id} className="flex justify-between items-center p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                      <div>
                        <p className="text-white font-bold text-sm">{cs.subject_name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Weight: {cs.weight}</p>
                      </div>
                      <button onClick={() => handleUnlinkSubject(cs.subject_id)} className="text-gray-600 hover:text-rose-500">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/20">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">⚡ Competency Model</h3>
                </div>
                <div className="p-6 bg-amber-500/5 border-b border-gray-800">
                  <form onSubmit={handleLinkSkill} className="flex gap-2 relative">
                    <div className="relative flex-1">
                      <input
                        type="text" className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm" placeholder="Search skill..."
                        value={skillSearchQuery} onChange={(e) => { setSkillSearchQuery(e.target.value); setIsSkillDropdownOpen(true); }}
                      />
                      {isSkillDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                          {allSkills.filter(s => s.skill_name.toLowerCase().includes(skillSearchQuery.toLowerCase())).slice(0, 10).map(s => (
                            <div key={s.skill_id} className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm text-gray-300" onClick={() => { setSkillLinkForm({ ...skillLinkForm, skillId: s.skill_id.toString() }); setSkillSearchQuery(s.skill_name); setIsSkillDropdownOpen(false); }}>{s.skill_name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="submit" className="bg-amber-600 text-white px-8 rounded-xl font-bold text-sm whitespace-nowrap active:scale-95 transition-all">Link Skill</button>
                  </form>
                </div>
                <div className="p-6 space-y-3">
                  {careerSkills.length > 0 ? (
                    careerSkills.map(renderSkillItem)
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No skills mapped to this career yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center h-full">
              <span className="text-5xl mb-6 grayscale opacity-20">🏗️</span>
              <h3 className="text-white font-bold text-lg mb-2">Pathway Registry</h3>
              <p className="text-gray-500 text-sm max-w-xs">Select a career track to begin mapping the curriculum and industry requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
