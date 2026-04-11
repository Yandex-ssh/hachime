'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [selectedProgramId, setSelectedProgramId] = React.useState<number | null>(null);
  const [isYearModalOpen, setIsYearModalOpen] = React.useState(false);
  const [selectedYearView, setSelectedYearView] = React.useState<number | null>(null);
  
  const [formData, setFormData] = React.useState({
    subject_code: '',
    subject_name: '',
    program_id: '',
    year_level: '',
    semester: '',
    category: '',
    description: ''
  });
  
  // Skill Mapping State
  const [isSkillModalOpen, setIsSkillModalOpen] = React.useState(false);
  const [activeSubject, setActiveSubject] = React.useState<any>(null);
  const [subjectSkills, setSubjectSkills] = React.useState<any[]>([]);
  const [allSkills, setAllSkills] = React.useState<any[]>([]);
  const [mappingForm, setMappingForm] = React.useState({ skillId: '', weight: 5 });

  const router = useRouter();

  React.useEffect(() => {
    fetchSubjects();
    fetchPrograms();
    fetchAllSkills();
  }, []);

  React.useEffect(() => {
    if (!isEditing && selectedProgramId) {
      setFormData(prev => ({ ...prev, program_id: selectedProgramId.toString() }));
    }
  }, [selectedProgramId, isEditing]);

  const fetchAllSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAllSkills(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/programs`);
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
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects`;

      const payload = {
        ...formData,
        program_id: formData.program_id ? parseInt(formData.program_id) : null,
        year_level: formData.year_level ? parseInt(formData.year_level) : null,
        semester: formData.semester ? parseInt(formData.semester) : null,
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
        fetchSubjects();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} subject`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (subject: any) => {
    setIsEditing(true);
    setEditId(subject.subject_id);
    setFormData({
      subject_code: subject.subject_code || '',
      subject_name: subject.subject_name || '',
      program_id: subject.program_id || '',
      year_level: subject.year_level || '',
      semester: subject.semester || '',
      category: subject.category || '',
      description: subject.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      program_id: selectedProgramId?.toString() || '',
      year_level: '',
      semester: '',
      category: '',
      description: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert('Subjects imported successfully!');
        fetchSubjects();
      } else {
        alert('Failed to import subjects.');
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSubjects();
      } else {
        alert('Failed to delete subject');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openSkillMapping = async (subject: any) => {
    setActiveSubject(subject);
    setIsSkillModalOpen(true);
    fetchSubjectSkills(subject.subject_id);
  };

  const fetchSubjectSkills = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/${id}/skills`);
      if (res.ok) setSubjectSkills(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingForm.skillId || !activeSubject) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/${activeSubject.subject_id}/skills/${mappingForm.skillId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weight: Number(mappingForm.weight) })
      });
      if (res.ok) {
        setMappingForm({ skillId: '', weight: 5 });
        fetchSubjectSkills(activeSubject.subject_id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlinkSkill = async (skillId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/subjects/${activeSubject.subject_id}/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchSubjectSkills(activeSubject.subject_id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Curriculum <span className="text-indigo-400">Management</span></h1>
          <p className="text-gray-500 text-sm mt-1">Configure academic subjects, programs, and mappings.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/subjects`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'subjects_report.csv';
                a.click();
              } else {
                alert('Failed to export report');
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all border border-gray-700 active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">📥</span>
            Export CSV
          </button>
          <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 flex items-center gap-2 group">
            <span className="text-lg group-hover:rotate-12 transition-transform">⚡</span>
            Bulk Import
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* ── ADD/EDIT FORM ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden active-scale-hover transition-all">
        <div className="px-7 py-5 bg-gray-950/30 border-b border-gray-800">
           <h2 className="text-md font-bold text-white flex items-center gap-2">
             <span className="text-indigo-400">{isEditing ? '✏️' : '➕'}</span>
             {isEditing ? 'Update Existing Subject' : 'Register New Subject'}
           </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Subject Code *</label>
              <input 
                type="text" required
                placeholder="e.g. CS101"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.subject_code}
                onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Descriptive Name *</label>
              <input 
                type="text" required
                placeholder="e.g. Introduction to Computer Science"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                value={formData.subject_name}
                onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Program</label>
              <select 
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                value={formData.program_id}
                onChange={(e) => setFormData({...formData, program_id: e.target.value})}
              >
                <option value="">Select Program</option>
                {programs.map(p => (
                  <option key={p.program_id} value={p.program_id}>{p.program_code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Year Level</label>
              <input 
                type="number"
                placeholder="1-4"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                value={formData.year_level}
                onChange={(e) => setFormData({...formData, year_level: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Semester</label>
              <input 
                type="number"
                placeholder="1-2"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
              <input 
                type="text"
                placeholder="Core, Professional, etc."
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-300 font-bold text-xs px-4 py-2.5 transition-colors"
              >
                Discard Changes
              </button>
            )}
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
              {isEditing ? 'Commit Changes' : 'Register Subject'}
            </button>
          </div>
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
            {p.program_code} Track
          </button>
        ))}
      </div>

      {/* ── YEAR LEVEL CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-0">
        {loading ? (
          <div className="col-span-full p-20 text-center bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
             <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
             <div className="text-gray-500 font-medium animate-pulse">Filtering subjects...</div>
          </div>
        ) : (
          (() => {
            const filteredSubjects = subjects.filter(s => selectedProgramId === null || s.program_id === selectedProgramId);
            
            if (filteredSubjects.length === 0) {
              return (
                <div className="col-span-full bg-gray-900 border border-gray-800 rounded-2xl p-20 text-center shadow-xl">
                   <div className="text-3xl mb-4">📚</div>
                   <div className="text-gray-400 font-medium tracking-widest uppercase text-[10px] font-black">Curriculum Dormant</div>
                   <p className="text-gray-600 text-[10px] mt-2 font-bold uppercase tracking-widest">No subjects registered for {selectedProgramId === null ? 'the entire curriculum' : programs.find(p => p.program_id === selectedProgramId)?.program_code || 'this track'}.</p>
                </div>
              );
            }

            const yearLabels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
            
            const renderCard = (year: number | null, title: string) => {
              const count = filteredSubjects.filter(s => s.year_level === year || (!s.year_level && year === null)).length;
              if (count === 0 && year !== null) return null;

              return (
                <div 
                  key={year === null ? 'unassigned' : year}
                  onClick={() => {
                    setSelectedYearView(year);
                    setIsYearModalOpen(true);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/20 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-6xl font-black">{year === null ? '?' : year}</span>
                  </div>
                  <div>
                    <div className="text-3xl mb-4">{year === null ? '📦' : ['🥇', '🥈', '🥉', '🏅'][year - 1] || '🎓'}</div>
                    <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">{count} Subjects</p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                     <span>View Curriculum List</span>
                     <span>→</span>
                  </div>
                </div>
              );
            };

            const allYears = Array.from(new Set(filteredSubjects.map(s => s.year_level).filter(Boolean))).sort();
            const hasUnassigned = filteredSubjects.some(s => !s.year_level);

            return (
              <>
                {[1, 2, 3, 4].map(y => renderCard(y, yearLabels[y - 1]))}
                {allYears.filter(y => y > 4).map(y => renderCard(y, `Year ${y}`))}
                {hasUnassigned && renderCard(null, 'Unassigned / Electives')}
              </>
            );
          })()
        )}
      </div>

      {/* ── YEAR LEVEL SUBJECT LIST MODAL ── */}
      {isYearModalOpen && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/20 shrink-0">
               <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    {selectedYearView === null ? 'Unassigned Subjects' : `${['First', 'Second', 'Third', 'Fourth'][selectedYearView - 1] || `Year ${selectedYearView}`} Year Curriculum`}
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5 font-bold uppercase tracking-widest">
                    {selectedProgramId === null ? '🌐 Global View' : `${programs.find(p => p.program_id === selectedProgramId)?.program_code || 'Track'} Curriculum`}
                  </p>
               </div>
               <button 
                 onClick={() => setIsYearModalOpen(false)} 
                 className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all border border-gray-700"
               >
                 ×
               </button>
             </div>
             
             <div className="overflow-y-auto custom-scrollbar flex-1 p-8">
               <div className="bg-gray-950/50 border border-gray-800 rounded-2xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-900/50 border-b border-gray-800">
                       <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Code</th>
                       <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Subject Name</th>
                       <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Academic Level</th>
                       <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest">Classification</th>
                       <th className="px-6 py-5 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Operations</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800/50">
                     {subjects.filter(s => (selectedProgramId === null || s.program_id === selectedProgramId) && (s.year_level === selectedYearView || (!s.year_level && selectedYearView === null))).length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                           No Subjects Found
                         </td>
                       </tr>
                     ) : (
                       subjects.filter(s => (selectedProgramId === null || s.program_id === selectedProgramId) && (s.year_level === selectedYearView || (!s.year_level && selectedYearView === null))).map((subject) => (
                         <tr key={subject.subject_id} className="hover:bg-gray-800/30 transition-colors group">
                           <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-gray-950 border border-gray-800 rounded text-[11px] font-mono font-bold text-indigo-400">
                                {subject.subject_code}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{subject.subject_name}</div>
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium">
                                 {subject.year_level ? `Year ${subject.year_level}` : '-'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                <span className="text-xs text-gray-500 font-medium">
                                 {subject.semester ? `Sem ${subject.semester}` : '-'}
                                </span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-500">
                             <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                               {subject.category || 'Professional'}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-right space-x-2">
                             <button
                               onClick={() => openSkillMapping(subject)}
                               className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold text-xs transition-colors bg-amber-400/5 hover:bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20"
                               title="Curriculum Mapping"
                             >
                               Skills
                             </button>
                             <button
                               onClick={() => {
                                 handleEdit(subject);
                                 setIsYearModalOpen(false); // Close modal when editing
                               }}
                               className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white font-bold text-xs transition-colors bg-gray-800/50 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700"
                             >
                               Edit
                             </button>
                             <button
                               onClick={() => handleDelete(subject.subject_id)}
                               className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors bg-rose-400/5 hover:bg-rose-400/10 px-3 py-1.5 rounded-lg border border-rose-400/20"
                             >
                               Delete
                             </button>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* ── SKILL MAPPING MODAL ── */}
      {isSkillModalOpen && activeSubject && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/20">
              <div>
                 <h2 className="text-xl font-bold text-white uppercase tracking-tight">Skill <span className="text-amber-400">Mapping</span></h2>
                 <p className="text-gray-500 text-xs mt-0.5">{activeSubject.subject_code} - {activeSubject.subject_name}</p>
              </div>
              <button 
                onClick={() => setIsSkillModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all"
              >
                ×
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Link Form */}
              <form onSubmit={handleLinkSkill} className="flex gap-3 bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                <select 
                  className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                  value={mappingForm.skillId}
                  onChange={(e) => setMappingForm({...mappingForm, skillId: e.target.value})}
                  required
                >
                  <option value="">Select competency...</option>
                  {allSkills.filter(s => !subjectSkills.some(ss => ss.skill_id === s.skill_id)).map(s => (
                    <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
                  ))}
                </select>
                <div className="relative w-20">
                   <input 
                     type="number" min="1" max="10"
                     className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-amber-500/50"
                     value={mappingForm.weight}
                     onChange={(e) => setMappingForm({...mappingForm, weight: parseInt(e.target.value)})}
                   />
                   <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 text-[8px] font-black px-1.5 rounded text-amber-500">WT</span>
                </div>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-600/10 active:scale-95">
                  Link
                </button>
              </form>

              {/* Current Mapping List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {subjectSkills.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-gray-800 rounded-2xl">
                     <span className="text-3xl opacity-20">⚡</span>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-3">No skills mapped yet</p>
                  </div>
                ) : (
                  subjectSkills.map((ss) => (
                    <div key={ss.skill_id} className="flex items-center justify-between p-4 border border-gray-800 rounded-2xl bg-gray-950/40 hover:bg-gray-800/30 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center font-bold text-amber-400 shadow-inner">
                            {ss.weight}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-white">{ss.skill.skill_name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{ss.skill.category || 'Competency'}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleUnlinkSkill(ss.skill_id)}
                        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-rose-600 text-gray-500 hover:text-white flex items-center justify-center transition-all border border-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-gray-800 flex justify-end bg-gray-950/20">
               <button 
                 onClick={() => setIsSkillModalOpen(false)}
                 className="px-6 py-2 rounded-xl text-xs font-black text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
               >
                 Close Mapping View
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
