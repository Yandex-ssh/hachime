'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminInternshipsPage() {
  const [internships, setInternships] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Specific Internship state for tracking saves
  const [activeInternship, setActiveInternship] = React.useState<any>(null);
  const [saves, setSaves] = React.useState<any[]>([]);

  // Add/Edit Form State
  const [showForm, setShowForm] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState({
    internship_id: '',
    company_name: '',
    role_title: '',
    location: '',
    work_type: 'On-site',
    duration: '',
    stipend_min: '',
    stipend_max: '',
    deadline: '',
    description: '',
    apply_url: '',
    is_active: true
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch internships');
      const data = await res.json();
      setInternships(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openInternshipSaves = async (internship: any) => {
    setActiveInternship(internship);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin/${internship.internship_id}/saves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSaves(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.role_title) return;

    try {
      const token = localStorage.getItem('token');
      const url = editMode 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin/${formData.internship_id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin`;
      
      const bodyPayload = { ...formData };
      delete (bodyPayload as any).internship_id;
      if (!bodyPayload.deadline) delete (bodyPayload as any).deadline;

      const res = await fetch(url, {
        method: editMode ? 'PATCH' : 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        setShowForm(false);
        fetchInternships();
      } else {
        alert('Failed to save internship');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchInternships();
    } catch (error) {
      console.error(error);
    }
  };

  const initEdit = (internship: any) => {
    setEditMode(true);
    setFormData({
      internship_id: internship.internship_id,
      company_name: internship.company_name || '',
      role_title: internship.role_title || '',
      location: internship.location || '',
      work_type: internship.work_type || 'On-site',
      duration: internship.duration || '',
      stipend_min: internship.stipend_min || '',
      stipend_max: internship.stipend_max || '',
      deadline: internship.deadline ? internship.deadline.substring(0, 10) : '',
      description: internship.description || '',
      apply_url: internship.apply_url || '',
      is_active: internship.is_active
    });
    setShowForm(true);
  };

  const toggleActiveStatus = async (internship: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/internships/admin/${internship.internship_id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !internship.is_active })
      });
      if (res.ok) fetchInternships();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-latte-text tracking-tight">Internship <span className="text-indigo-400">Portal</span></h1>
          <p className="text-latte-overlay1 text-sm mt-1">Deploy and monitor career opportunities for the student body.</p>
        </div>
        <button 
          onClick={() => {
            setEditMode(false);
            setFormData({
              internship_id: '', company_name: '', role_title: '', location: '', work_type: 'On-site', duration: '', 
              stipend_min: '', stipend_max: '', deadline: '', description: '', apply_url: '', is_active: true
            });
            setShowForm(!showForm);
          }}
          className={`${showForm ? 'bg-latte-surface1 hover:bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-latte-text px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 group`}
        >
          <span className={`text-xl transition-transform ${showForm ? 'rotate-45' : 'group-hover:rotate-90'}`}>＋</span>
          {showForm ? 'Discard Form' : 'New Opportunity'}
        </button>
      </div>

      {/* ── ADD/EDIT FORM ── */}
      {showForm && (
        <div className="bg-latte-surface0 border border-latte-crust rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="px-8 py-6 border-b border-latte-crust bg-latte-base/20">
             <h2 className="text-md font-bold text-latte-text flex items-center gap-2">
               <span className="text-indigo-400">{editMode ? '✏️' : '🚀'}</span>
               {editMode ? 'Refine Listing Details' : 'Initialize New Listing'}
             </h2>
          </div>
          <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Corporate Entity *</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Google Cloud"
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700" 
                  value={formData.company_name} 
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Designation *</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Backend Engineering Intern"
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700" 
                  value={formData.role_title} 
                  onChange={(e) => setFormData({...formData, role_title: e.target.value})} 
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1 font-bold">Base Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Manila, PH"
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1">Deployment Model</label>
                <select 
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none" 
                  value={formData.work_type} 
                  onChange={(e) => setFormData({...formData, work_type: e.target.value})}
                >
                  <option value="On-site">Physical Presence (On-site)</option>
                  <option value="Hybrid">Hybrid Environment</option>
                  <option value="Remote">Distributed (Remote)</option>
                </select>
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1 text-rose-400">Submission Deadline</label>
                <input 
                  type="date" 
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500/30 outline-none" 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-latte-overlay1 uppercase tracking-widest mb-1.5 ml-1 text-indigo-400">Direct Application Link</label>
                <input 
                  type="url" 
                  placeholder="https://company.careers/job/123"
                  className="w-full bg-latte-base border border-latte-crust text-latte-text rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder:text-gray-700" 
                  value={formData.apply_url} 
                  onChange={(e) => setFormData({...formData, apply_url: e.target.value})} 
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 gap-4">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-latte-text px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
              >
                {editMode ? 'Commit Update' : 'Live Publication'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SPLIT VIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left: Listings Table */}
        <div className="lg:col-span-8 bg-latte-surface0 rounded-3xl shadow-2xl border border-latte-crust overflow-hidden flex flex-col h-[700px]">
          <div className="px-6 py-5 border-b border-latte-crust bg-latte-base/20 flex justify-between items-center">
            <h3 className="font-bold text-latte-text text-xs tracking-widest uppercase">Career Opportunity Index</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide">
              {internships.length} Live Slots
            </span>
          </div>
          {loading ? (
            <div className="p-20 text-center flex-1 flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
               <div className="text-latte-overlay1 text-sm font-medium animate-pulse">Syncing Opportunity Grid...</div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 custom-scrollbar pb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-latte-base/30 border-b border-latte-crust">
                    <th className="px-6 py-4 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest">Designation & Entity</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest">Metadata</th>
                    <th className="px-6 py-4 font-bold text-[10px] text-latte-overlay1 uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {internships.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <div className="text-4xl mb-4 grayscale">💼</div>
                        <h4 className="text-latte-subtext0 font-bold text-sm uppercase tracking-widest">No Active Missions</h4>
                        <p className="text-latte-overlay0 text-xs mt-1">The opportunity board is currently empty.</p>
                      </td>
                    </tr>
                  ) : (
                    internships.map((intn) => (
                      <tr 
                        key={intn.internship_id} 
                        className={`hover:bg-latte-surface1/30 cursor-pointer transition-all group relative ${activeInternship?.internship_id === intn.internship_id ? 'bg-indigo-600/10' : ''}`}
                        onClick={() => openInternshipSaves(intn)}
                      >
                        <td className="px-6 py-5 relative">
                          {activeInternship?.internship_id === intn.internship_id && (
                            <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                          )}
                          <div className="flex flex-col gap-1">
                            <h3 className={`font-bold text-sm transition-colors ${activeInternship?.internship_id === intn.internship_id ? 'text-indigo-400' : 'text-latte-text'}`}>
                              {intn.role_title}
                            </h3>
                            <div className="flex items-center gap-2">
                               <span className="text-[11px] text-latte-subtext0 font-medium">{intn.company_name}</span>
                               <span className="w-1 h-1 rounded-full bg-gray-700" />
                               <span className="text-[10px] text-latte-overlay0 uppercase font-black tracking-tighter">{intn.work_type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                             <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md self-start text-[9px] font-black uppercase tracking-widest border ${intn.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-latte-surface1 text-latte-overlay1 border-latte-mantle'}`}>
                               <div className={`w-1 h-1 rounded-full ${intn.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                               {intn.is_active ? 'Active' : 'Offline'}
                             </div>
                             <span className="text-[10px] text-latte-overlay0 font-bold uppercase tracking-tighter">
                               Deadline: {intn.deadline ? new Date(intn.deadline).toLocaleDateString() : 'OPEN'}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => { e.stopPropagation(); initEdit(intn); }} 
                              className="w-8 h-8 rounded-lg bg-latte-surface1 hover:bg-indigo-600 text-latte-subtext0 hover:text-latte-text flex items-center justify-center border border-latte-mantle transition-all"
                              title="Edit Details"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleActiveStatus(intn); }} 
                              className="w-8 h-8 rounded-lg bg-latte-surface1 hover:bg-amber-600 text-latte-subtext0 hover:text-latte-text flex items-center justify-center border border-latte-mantle transition-all"
                              title="Flip Visibility"
                            >
                              🔄
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(intn.internship_id); }} 
                              className="w-8 h-8 rounded-lg bg-latte-surface1 hover:bg-rose-600 text-latte-overlay1 hover:text-latte-text flex items-center justify-center border border-latte-mantle transition-all"
                              title="Purge Record"
                            >
                              🗑️
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

        {/* Right: Saves Panel */}
        <div className="lg:col-span-4 bg-latte-surface0 rounded-3xl shadow-2xl border border-latte-crust overflow-hidden flex flex-col h-[700px]">
          {activeInternship ? (
            <>
              <div className="px-6 py-5 border-b border-latte-crust bg-latte-base/20">
                <h3 className="font-bold text-latte-text text-xs tracking-widest uppercase">Engagement Analytics</h3>
                <p className="text-[10px] font-medium text-latte-overlay1 mt-1 uppercase tracking-tight line-clamp-1">{activeInternship.role_title} @ {activeInternship.company_name}</p>
              </div>
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="bg-gradient-to-br from-indigo-600/20 to-gray-950 border border-indigo-500/20 p-6 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden group/card shadow-xl">
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-4xl font-black text-latte-text group-hover:scale-110 transition-transform">{saves.length}</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Bookmarked by Users</span>
                  </div>
                  <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
                </div>
                
                <h4 className="text-[9px] font-black text-latte-overlay1 uppercase tracking-widest mb-4 ml-1">Verified Interests</h4>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {saves.length === 0 ? (
                    <div className="bg-latte-base/30 border border-latte-crust border-dashed rounded-2xl py-12 text-center">
                       <span className="text-3xl opacity-20 filter grayscale">👀</span>
                       <p className="text-latte-overlay0 text-[10px] font-bold uppercase tracking-widest mt-3">Zero Tracking Signal</p>
                    </div>
                  ) : (
                    saves.map((s, idx) => (
                      <div key={idx} className="bg-latte-base border border-latte-crust p-4 rounded-2xl shadow-sm group/save hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-latte-mantle flex items-center justify-center text-[10px] font-bold text-latte-subtext0 uppercase">
                             {s.name.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="font-bold text-xs text-latte-text truncate">{s.name}</p>
                             <p className="text-[10px] text-latte-overlay1 truncate">{s.email}</p>
                           </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-latte-crust/50 flex justify-between items-center">
                           <span className="text-[8px] font-bold text-latte-overlay0 uppercase tracking-widest">Signal Received</span>
                           <span className="text-[9px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">{new Date(s.saved_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center group">
               <div className="text-5xl mb-6 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">📡</div>
               <h3 className="text-latte-text font-bold text-sm uppercase tracking-widest mb-2 px-2">Awaiting Signal</h3>
               <p className="text-latte-overlay0 text-xs max-w-[200px] leading-relaxed mx-auto">
                 Select an opportunity from the registry to interface with student engagement metrics.
               </p>
               <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] animate-pulse">
                  <div className="w-6 h-[1px] bg-latte-surface1" />
                  No Data Point Selected
                  <div className="w-6 h-[1px] bg-latte-surface1" />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
