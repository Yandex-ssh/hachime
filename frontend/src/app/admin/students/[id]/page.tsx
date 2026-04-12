'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ─── Glassmorphism Subject-List Modal ─────────────────────────────────────── */
function SubjectModal({ subjects, onClose }: { subjects: any[]; onClose: () => void }) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(15,23,42,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 25px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="text-latte-text font-bold text-lg leading-tight">Completed Subjects</h2>
              <p className="text-latte-text/60 text-xs mt-0.5">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-latte-text/70 hover:text-latte-text hover:bg-latte-base/15 transition-all text-lg font-bold">✕</button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-2">
          {subjects.length > 0 ? subjects.map((sub: any, idx: number) => (
            <div key={sub.subject_id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(99,102,241,0.35)', color: '#c7d2fe' }}>{idx + 1}</span>
                <span className="text-latte-text/90 text-sm font-medium">{sub.subject_name}</span>
              </div>
              {sub.is_liked && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.25)', color: '#fda4af' }}>♥ Liked</span>}
            </div>
          )) : (
            <p className="text-latte-text/50 text-sm italic text-center py-8">No completed subjects recorded.</p>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-latte-text transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

function EditSubjectModal({ allSubjects, studentFinished, studentLiked, studentId, onClose, onSave }: any) {
  const [checkedIds, setCheckedIds] = React.useState<number[]>([]);
  const [likedIds, setLikedIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    setCheckedIds(studentFinished.map((s: any) => s.subject_id));
    setLikedIds(studentLiked.map((s: any) => s.subject_id));
  }, [studentFinished, studentLiked]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/students/${studentId}/admin/subjects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ finished_subject_ids: checkedIds, liked_subject_ids: likedIds })
    });
    onSave();
    onClose();
  };

  const toggleCheck = (id: number) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl bg-latte-base rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between items-center bg-latte-mantle">
          <h2 className="text-xl font-bold">Edit Completed Subjects</h2>
          <button onClick={onClose} className="text-latte-overlay1 hover:text-gray-800">✕</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
          {allSubjects.map((sub: any) => (
            <div key={sub.subject_id} className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={checkedIds.includes(sub.subject_id)} onChange={() => toggleCheck(sub.subject_id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium">{sub.subject_name}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-latte-mantle flex justify-end gap-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-latte-overlay0 hover:bg-latte-mantle rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 text-latte-text px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Save Subjects</button>
        </div>
      </div>
    </div>
  );
}

function EditFavoritesModal({ allSubjects, studentFinished, studentLiked, studentId, onClose, onSave }: any) {
  const [likedIds, setLikedIds] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    setLikedIds(studentLiked.map((s: any) => s.subject_id));
  }, [studentLiked]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const finishedIds = studentFinished.map((s: any) => s.subject_id);
    await fetch(`${API}/students/${studentId}/admin/subjects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ finished_subject_ids: finishedIds, liked_subject_ids: likedIds })
    });
    onSave();
    onClose();
  };

  const toggleLike = (id: number) => {
    if (likedIds.includes(id)) {
      setLikedIds(prev => prev.filter(x => x !== id));
    } else {
      if (likedIds.length >= 5) {
        alert("A student can only have up to 5 favorite subjects.");
        return;
      }
      setLikedIds(prev => [...prev, id]);
    }
  };

  const filteredSubjects = studentFinished.filter((s: any) => 
    s.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-xl bg-latte-base rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between items-center bg-latte-mantle">
          <div>
            <h2 className="text-xl font-bold">Manage Favorite Subjects</h2>
            <p className="text-xs text-latte-overlay1 mt-0.5">{likedIds.length}/5 subjects selected</p>
          </div>
          <button onClick={onClose} className="text-latte-overlay1 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4 bg-latte-mantle border-b">
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
          />
        </div>
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-2">
          {filteredSubjects.map((sub: any) => (
            <div key={sub.subject_id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-latte-mantle transition-colors">
              <span className="text-sm font-medium text-gray-700">{sub.subject_name}</span>
              <button 
                onClick={() => toggleLike(sub.subject_id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  likedIds.includes(sub.subject_id) 
                    ? 'bg-pink-100 text-pink-600 border border-pink-200 shadow-sm' 
                    : 'bg-latte-mantle text-latte-subtext0 border border-latte-crust hover:bg-gray-200'
                }`}
              >
                ♥
              </button>
            </div>
          ))}
          {filteredSubjects.length === 0 && (
            <p className="text-center text-latte-overlay1 py-10 italic">No subjects matching "{searchTerm}"</p>
          )}
        </div>
        <div className="px-6 py-4 bg-latte-mantle flex justify-end gap-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-latte-overlay0 hover:bg-latte-mantle rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-pink-600 text-latte-text px-5 py-2 rounded-lg font-medium hover:bg-pink-700 shadow-md transition-all">Save Favorites</button>
        </div>
      </div>
    </div>
  );
}


function EditCareerModal({ allCareers, currentCareerId, studentId, onClose, onSave }: any) {
  const [selected, setSelected] = React.useState(currentCareerId || '');
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/students/${studentId}/admin/career-goal`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_career_id: selected ? parseInt(selected) : null })
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm bg-latte-base rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Edit Target Career</h2>
        <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full border px-3 py-2 rounded-lg mb-6">
          <option value="">No Career Goal</option>
          {allCareers.map((c: any) => <option key={c.career_id} value={c.career_id}>{c.title}</option>)}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-latte-overlay0 hover:bg-latte-mantle rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-green-600 text-latte-text px-4 py-2 rounded-lg font-medium hover:bg-green-700">Set Goal</button>
        </div>
      </div>
    </div>
  );
}

function EditSavedModal({ title, allItems, savedItems, studentId, idKey, displayKey, toggleType, onClose, onSave }: any) {
  const [checkedIds, setCheckedIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    setCheckedIds(savedItems.map((s: any) => s[idKey]));
  }, [savedItems, idKey]);

  const handleToggle = async (itemId: number) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/${toggleType}/admin/student/${studentId}/saves/${itemId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    setCheckedIds(prev => prev.includes(itemId) ? prev.filter(x => x !== itemId) : [...prev, itemId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl bg-latte-base rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between items-center bg-latte-mantle">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-latte-overlay1 hover:text-gray-800">✕</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
          {allItems.map((item: any) => (
            <div key={item[idKey]} className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-3 cursor-pointer w-full">
                <input type="checkbox" checked={checkedIds.includes(item[idKey])} onChange={() => handleToggle(item[idKey])} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium">{item[displayKey]}</span>
              </label>
            </div>
          ))}
          {allItems.length === 0 && <p className="text-latte-overlay1 text-sm">No items available to add.</p>}
        </div>
        <div className="px-6 py-4 bg-latte-mantle flex justify-end gap-3 border-t">
          <button onClick={() => { onSave(); onClose(); }} className="bg-blue-600 text-latte-text px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-latte-overlay1 mb-1">{label}</p>
      <p className="text-latte-text font-medium text-sm">{value || <span className="text-latte-subtext0 italic">Not set</span>}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-latte-base rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="font-semibold text-latte-text mb-4 flex items-center gap-2 text-sm">{title}</div>
      {children}
    </div>
  );
}

interface Job { job_id: string; role_title: string; company_name: string; apply_url?: string; }
interface Internship { internship_id: string; role_title: string; company_name: string; apply_url?: string; }
interface Resource { resource_id: string; title: string; provider?: string; url?: string; }

/* ─── Main page ─────────────────────────────────────────────────────────────── */
export default function AdminStudentDetailsPage() {
  const { id } = useParams();

  const [student, setStudent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showSubjectModal, setShowSubjectModal] = React.useState(false);

  const [savedInternships, setSavedInternships] = React.useState<Internship[]>([]);
  const [savedJobs, setSavedJobs] = React.useState<Job[]>([]);
  const [savedResources, setSavedResources] = React.useState<Resource[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  
  const [allSubjects, setAllSubjects] = React.useState<any[]>([]);
  const [allCareers, setAllCareers] = React.useState<any[]>([]);
  const [allInternships, setAllInternships] = React.useState<any[]>([]);
  const [allJobs, setAllJobs] = React.useState<any[]>([]);
  const [allResources, setAllResources] = React.useState<any[]>([]);

  const [showEditSubjects, setShowEditSubjects] = React.useState(false);
  const [showEditCareer, setShowEditCareer] = React.useState(false);
  const [showEditInternships, setShowEditInternships] = React.useState(false);
  const [showEditJobs, setShowEditJobs] = React.useState(false);
  const [showEditResources, setShowEditResources] = React.useState(false);
  const [showEditFavorites, setShowEditFavorites] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: '', email: '', student_number: '', year_level: '', semester: '', program_id: '', profile_picture_url: '', isActive: true });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStudent = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/students/profile/${id}`, { headers });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudent(data);
      setEditForm({
        name: data.name || '',
        email: data.email || '',
        student_number: data.student_number || '',
        year_level: data.year_level || '',
        semester: data.semester ? String(data.semester) : '',
        program_id: data.program_id ? String(data.program_id) : '',
        profile_picture_url: data.profile_picture_url || '',
        isActive: data.isActive !== false
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  const fetchBookmarks = React.useCallback(async () => {
    if (!id) return;
    const [iRes, jRes, rRes] = await Promise.allSettled([
      fetch(`${API}/internships/admin/student/${id}/saved`, { headers }),
      fetch(`${API}/jobs/admin/student/${id}/saved`, { headers }),
      fetch(`${API}/resources/admin/student/${id}/saved`, { headers }),
    ]);
    if (iRes.status === 'fulfilled' && iRes.value.ok) setSavedInternships(await iRes.value.json().catch(() => []));
    if (jRes.status === 'fulfilled' && jRes.value.ok) setSavedJobs(await jRes.value.json().catch(() => []));
    if (rRes.status === 'fulfilled' && rRes.value.ok) setSavedResources(await rRes.value.json().catch(() => []));
  }, [id]);

  const fetchProgramsAndDependencies = React.useCallback(async () => {
    try {
      const [pRes, sRes, cRes, iRes, jRes, rRes] = await Promise.allSettled([
        fetch(`${API}/programs`, { headers }),
        fetch(`${API}/subjects`, { headers }),
        fetch(`${API}/careers`, { headers }),
        fetch(`${API}/internships`, { headers }),
        fetch(`${API}/jobs`, { headers }),
        fetch(`${API}/resources`, { headers })
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.ok) setPrograms(await pRes.value.json());
      if (sRes.status === 'fulfilled' && sRes.value.ok) setAllSubjects(await sRes.value.json());
      if (cRes.status === 'fulfilled' && cRes.value.ok) setAllCareers(await cRes.value.json());
      if (iRes.status === 'fulfilled' && iRes.value.ok) setAllInternships(await iRes.value.json());
      if (jRes.status === 'fulfilled' && jRes.value.ok) setAllJobs(await jRes.value.json());
      if (rRes.status === 'fulfilled' && rRes.value.ok) setAllResources(await rRes.value.json());
    } catch (e) { console.error(e); }
  }, []);

  React.useEffect(() => {
    fetchStudent();
    fetchBookmarks();
    fetchProgramsAndDependencies();
  }, [fetchStudent, fetchBookmarks, fetchProgramsAndDependencies]);

  const handleToggleSave = async (type: 'internships' | 'jobs' | 'resources', itemId: string) => {
    if (!window.confirm("Remove this saved item from the student's profile?")) return;
    const res = await fetch(`${API}/${type}/admin/student/${id}/saves/${itemId}/toggle`, {
      method: 'POST',
      headers
    });
    if (res.ok) fetchBookmarks();
  };

  const handleSave = async () => {
    const res = await fetch(`${API}/students/${id}/admin`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { setIsEditing(false); fetchStudent(); } else alert('Failed to update student');
  };

  const handleProfilePictureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('Image is too large. Please use an image up to 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setEditForm(prev => ({ ...prev, profile_picture_url: result }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetPassword = async () => {
    if (!window.confirm("Reset this student's password to the default?")) return;
    const res = await fetch(`${API}/students/${id}/reset-password`, { method: 'POST', headers });
    const data = await res.json();
    if (res.ok) alert(`Password reset to: ${data.new_password}`);
    else alert('Failed to reset password');
  };

  const handleToggleActive = async () => {
    const action = student.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;
    const res = student.isActive
      ? await fetch(`${API}/students/${id}/admin`, { method: 'DELETE', headers })
      : await fetch(`${API}/students/${id}/admin/activate`, { method: 'POST', headers });
    if (res.ok) fetchStudent(); else alert(`Failed to ${action} student`);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-latte-subtext0">Loading...</div>;
  if (!student) return <div className="text-latte-overlay1 p-8">Student not found.</div>;

  const subjectCount = student.finished_subjects?.length ?? 0;
  const progress = student.progress ?? {};
  const progressPercent = progress.totalSubjects > 0 ? Math.round((progress.finishedSubjects / progress.totalSubjects) * 100) : 0;
  const careerGoal = student.career_goal ?? null;
  const yearStr = (y: number) => `${y}${y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year`;

  return (
    <>
      {showSubjectModal && <SubjectModal subjects={student.finished_subjects ?? []} onClose={() => setShowSubjectModal(false)} />}
      
      {showEditSubjects && (
        <EditSubjectModal 
          allSubjects={allSubjects} 
          studentFinished={student.finished_subjects ?? []}
          studentLiked={(student.finished_subjects ?? []).filter((s:any) => s.is_liked)}
          studentId={id} 
          onClose={() => setShowEditSubjects(false)} 
          onSave={fetchStudent} 
        />
      )}

      {showEditCareer && (
        <EditCareerModal 
          allCareers={allCareers}
          currentCareerId={careerGoal?.career_id}
          studentId={id}
          onClose={() => setShowEditCareer(false)}
          onSave={fetchStudent}
        />
      )}

      {showEditInternships && (
        <EditSavedModal 
          title="Manage Saved Internships"
          allItems={allInternships}
          savedItems={savedInternships}
          studentId={id}
          idKey="internship_id"
          displayKey="role_title"
          toggleType="internships"
          onClose={() => setShowEditInternships(false)}
          onSave={fetchBookmarks}
        />
      )}

      {showEditJobs && (
        <EditSavedModal 
          title="Manage Saved Jobs"
          allItems={allJobs}
          savedItems={savedJobs}
          studentId={id}
          idKey="job_id"
          displayKey="role_title"
          toggleType="jobs"
          onClose={() => setShowEditJobs(false)}
          onSave={fetchBookmarks}
        />
      )}

      {showEditResources && (
        <EditSavedModal 
          title="Manage Saved Resources"
          allItems={allResources}
          savedItems={savedResources}
          studentId={id}
          idKey="resource_id"
          displayKey="title"
          toggleType="resources"
          onClose={() => setShowEditResources(false)}
          onSave={fetchBookmarks}
        />
      )}

      {showEditFavorites && (
        <EditFavoritesModal 
          allSubjects={allSubjects}
          studentFinished={student.finished_subjects ?? []}
          studentLiked={(student.finished_subjects ?? []).filter((s:any) => s.is_liked)}
          studentId={id}
          onClose={() => setShowEditFavorites(false)}
          onSave={fetchStudent}
        />
      )}

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/admin/students" className="inline-flex items-center gap-1 text-latte-overlay1 hover:text-latte-text transition-colors text-sm">
          ← Back to Students
        </Link>

        {/* ── Profile header ── */}
        <div className="bg-latte-base rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-latte-mantle/50">
            <div className="flex gap-5 items-center">
              <div className="relative group/avatar">
                <input
                  type="file"
                  id="admin-profile-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureFileChange}
                  disabled={!isEditing}
                />
                <label
                  htmlFor={isEditing ? "admin-profile-upload" : undefined}
                  className={`relative block w-20 h-20 rounded-full overflow-hidden border border-blue-200 shadow-inner overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                >
                  {editForm.profile_picture_url ? (
                    <img src={editForm.profile_picture_url} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                      {student.name?.charAt(0) || '?'}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <span className="text-[10px] text-latte-text font-bold leading-tight text-center px-1">
                        CHANGE<br/>PHOTO
                      </span>
                    </div>
                  )}
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-latte-text">{student.name}</h1>
                <p className="text-latte-overlay1 mt-1 text-sm">{student.student_number} • {student.program || 'No Program'}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-latte-base border border-gray-300 text-gray-700 hover:bg-latte-mantle px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">Edit Profile</button>
              ) : (
                <>
                  <button onClick={() => setIsEditing(false)} className="bg-latte-base border border-gray-300 text-gray-700 hover:bg-latte-mantle px-4 py-2 rounded-lg font-medium transition-colors text-sm">Cancel</button>
                  <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-latte-text px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">Save Changes</button>
                </>
              )}
              <button onClick={handleResetPassword} className="bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm">Reset Password</button>
              <button onClick={handleToggleActive} className={student.isActive ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm'}>
                {student.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          {/* Student info fields */}
          <div className="p-8">
            <h3 className="text-base font-semibold text-latte-text mb-5">Account Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Full Name</label>
                {isEditing ? (
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                ) : <p className="text-latte-text font-medium text-sm">{student.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Student Number</label>
                {isEditing ? (
                  <input type="text" value={editForm.student_number} onChange={e => setEditForm({ ...editForm, student_number: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                ) : <p className="text-latte-text font-medium text-sm">{student.student_number}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Email Address</label>
                {isEditing ? (
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                ) : <p className="text-latte-text font-medium text-sm">{student.email || <span className="text-latte-subtext0 italic">Not provided</span>}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Program</label>
                {isEditing ? (
                  <select
                    value={editForm.program_id}
                    onChange={e => setEditForm({ ...editForm, program_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {programs.map(p => (
                      <option key={p.program_id} value={p.program_id}>{p.program_name} ({p.program_code})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-latte-text font-medium text-sm">{student.program || <span className="text-latte-subtext0 italic">—</span>}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Year Level</label>
                {isEditing ? (
                  <input type="number" min="1" max="4" value={editForm.year_level} onChange={e => setEditForm({ ...editForm, year_level: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                ) : <p className="text-latte-text font-medium text-sm">{student.year_level ? yearStr(Number(student.year_level)) : <span className="text-latte-subtext0 italic">Not set</span>}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Current Semester</label>
                {isEditing ? (
                  <select value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="">Not set</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </select>
                ) : (
                  <p className="text-latte-text font-medium text-sm">
                    {student.semester ? `${student.semester === 1 ? '1st' : '2nd'} Semester` : <span className="text-latte-subtext0 italic">Not set</span>}
                  </p>
                )}
              </div>

              {isEditing && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-latte-overlay1 mb-1.5">Account Status</label>
                    <select value={editForm.isActive ? 'active' : 'inactive'} onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {progress.totalSubjects > 0 && (
          <div className="bg-latte-base rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-latte-text mb-1">Academic Progress</h3>
            <p className="text-xs text-latte-overlay1 mb-3">
              {progress.semesterLabel
                ? `${progress.finishedSubjects} subjects completed (goal: ${progress.totalSubjects} by end of ${progress.semesterLabel})`
                : `${progress.finishedSubjects} / ${progress.totalSubjects} subjects completed`}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-latte-mantle rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">{progressPercent}%</span>
            </div>
          </div>
        )}

        {/* ── Two-column bottom grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjects */}
          <SectionCard title={<><span className="text-blue-600">📚</span> Completed Subjects {subjectCount > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{subjectCount}</span>}</>}>
            {subjectCount === 0 ? (
              <p className="text-latte-subtext0 text-sm italic">No completed subjects recorded.</p>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  {student.finished_subjects.slice(0, 3).map((sub: any) => (
                    <div key={sub.subject_id} className="p-2.5 bg-latte-mantle rounded-lg border border-gray-100 text-sm flex justify-between">
                      <span className="font-medium text-gray-800">{sub.subject_name}</span>
                      {sub.is_liked && <span className="text-pink-500 text-xs font-bold">♥ Liked</span>}
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowSubjectModal(true)} className="w-full py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors mb-2">
                  View All {subjectCount} Subjects
                </button>
              </>
            )}
            
            <button onClick={() => setShowEditSubjects(true)} className="w-full py-2 text-xs font-semibold text-latte-text bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors">
              Manage Subjects
            </button>
          </SectionCard>

          {/* Favorite Subjects */}
          <SectionCard title={<><span className="text-pink-500">💖</span> Favorite Subjects {student.finished_subjects?.filter((s:any) => s.is_liked).length > 0 && <span className="ml-1 bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">{student.finished_subjects.filter((s:any) => s.is_liked).length}</span>}</>}>
            {student.finished_subjects?.filter((s:any) => s.is_liked).length === 0 ? (
              <p className="text-latte-subtext0 text-sm italic mb-3">No favorite subjects selected.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {student.finished_subjects.filter((s:any) => s.is_liked).map((sub: any) => (
                  <div key={sub.subject_id} className="p-2.5 bg-pink-50/50 rounded-lg border border-pink-100 text-sm flex items-center gap-3">
                    <span className="text-pink-400">♥</span>
                    <span className="font-medium text-gray-800">{sub.subject_name}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowEditFavorites(true)} className="w-full py-2 text-xs font-semibold text-latte-text bg-pink-600 border border-transparent rounded-lg hover:bg-pink-700 transition-colors">
              Manage Favorites
            </button>
          </SectionCard>

          {/* Career Goal */}
          <SectionCard title={<><span className="text-green-600">🎯</span> Career Goal</>}>
            {careerGoal ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {careerGoal.icon && <span className="text-2xl">{careerGoal.icon}</span>}
                  <p className="font-semibold text-latte-text text-sm">{careerGoal.title}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-latte-overlay1 mb-1">
                    <span>Required subjects progress</span>
                    <span className="font-semibold text-gray-700">{careerGoal.progress.completed}/{careerGoal.progress.total} ({careerGoal.progress.percent}%)</span>
                  </div>
                  <div className="w-full bg-latte-mantle rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${careerGoal.progress.percent}%` }} />
                  </div>
                </div>
                {careerGoal.gap?.missing_subjects?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-latte-overlay1 mb-1.5">Missing required subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {careerGoal.gap.missing_subjects.slice(0, 6).map((s: any) => (
                        <span key={s.subject_id} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2 py-0.5 rounded-md">{s.subject_name}</span>
                      ))}
                      {careerGoal.gap.missing_subjects.length > 6 && (
                        <span className="text-latte-subtext0 text-xs px-2 py-0.5">+{careerGoal.gap.missing_subjects.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-latte-subtext0 text-sm italic mb-2">No career goal set.</p>
            )}
            
            <button onClick={() => setShowEditCareer(true)} className="mt-4 w-full py-2 text-xs font-semibold text-latte-text bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors">
              Manage Career Goal
            </button>
          </SectionCard>

          {/* Bookmarked Internships */}
          <SectionCard title={<><span className="text-indigo-500">💼</span> Saved Internships <span className="ml-1 text-xs text-latte-subtext0 font-normal">({savedInternships.length})</span></>}>
            {savedInternships.length === 0 ? (
              <p className="text-latte-subtext0 text-sm italic">No saved internships.</p>
            ) : (
              <div className="space-y-2">
                {savedInternships.slice(0, 5).map((item: Internship) => (
                  <div key={item.internship_id} className="flex rounded-lg border border-gray-100 bg-latte-mantle hover:border-latte-crust transition text-sm">
                    <a href={item.apply_url ?? '#'} target="_blank" rel="noreferrer" className="block px-3 py-2.5 flex-1">
                      <p className="font-medium text-gray-800">{item.role_title}</p>
                      <p className="text-xs text-latte-overlay1">{item.company_name}</p>
                    </a>
                    <button onClick={() => handleToggleSave('internships', item.internship_id)} className="px-3 border-l border-gray-100 text-latte-subtext0 hover:text-red-500 hover:bg-red-50 rounded-r-lg" title="Unsave">✕</button>
                  </div>
                ))}
                {savedInternships.length > 5 && <p className="text-xs text-latte-subtext0 text-center">+{savedInternships.length - 5} more</p>}
              </div>
            )}
            
            <button onClick={() => setShowEditInternships(true)} className="mt-4 w-full py-2 text-xs font-semibold text-latte-text bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors">
              Manage Internships
            </button>
          </SectionCard>

          {/* Bookmarked Jobs */}
          <SectionCard title={<><span className="text-violet-500">🗂️</span> Saved Jobs <span className="ml-1 text-xs text-latte-subtext0 font-normal">({savedJobs.length})</span></>}>
            {savedJobs.length === 0 ? (
              <p className="text-latte-subtext0 text-sm italic">No saved job listings.</p>
            ) : (
              <div className="space-y-2">
                {savedJobs.slice(0, 5).map((item: Job) => (
                  <div key={item.job_id} className="flex rounded-lg border border-gray-100 bg-latte-mantle hover:border-latte-crust transition text-sm">
                    <a href={item.apply_url ?? '#'} target="_blank" rel="noreferrer" className="block px-3 py-2.5 flex-1">
                      <p className="font-medium text-gray-800">{item.role_title}</p>
                      <p className="text-xs text-latte-overlay1">{item.company_name}</p>
                    </a>
                    <button onClick={() => handleToggleSave('jobs', item.job_id)} className="px-3 border-l border-gray-100 text-latte-subtext0 hover:text-red-500 hover:bg-red-50 rounded-r-lg" title="Unsave">✕</button>
                  </div>
                ))}
                {savedJobs.length > 5 && <p className="text-xs text-latte-subtext0 text-center">+{savedJobs.length - 5} more</p>}
              </div>
            )}
            
            <button onClick={() => setShowEditJobs(true)} className="mt-4 w-full py-2 text-xs font-semibold text-latte-text bg-violet-600 border border-transparent rounded-lg hover:bg-violet-700 transition-colors">
              Manage Jobs
            </button>
          </SectionCard>

          {/* Bookmarked Resources */}
          <SectionCard title={<><span className="text-cyan-500">📖</span> Saved Resources <span className="ml-1 text-xs text-latte-subtext0 font-normal">({savedResources.length})</span></>}>
            {savedResources.length === 0 ? (
              <p className="text-latte-subtext0 text-sm italic">No saved development resources.</p>
            ) : (
              <div className="space-y-2">
                {savedResources.slice(0, 5).map((item: Resource) => (
                  <div key={item.resource_id} className="flex rounded-lg border border-gray-100 bg-latte-mantle hover:border-latte-crust transition text-sm">
                    <a href={item.url ?? '#'} target="_blank" rel="noreferrer" className="block px-3 py-2.5 flex-1">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-latte-overlay1">{item.provider ?? 'Provider not specified'}</p>
                    </a>
                    <button onClick={() => handleToggleSave('resources', item.resource_id)} className="px-3 border-l border-gray-100 text-latte-subtext0 hover:text-red-500 hover:bg-red-50 rounded-r-lg" title="Unsave">✕</button>
                  </div>
                ))}
                {savedResources.length > 5 && <p className="text-xs text-latte-subtext0 text-center">+{savedResources.length - 5} more</p>}
              </div>
            )}
            
            <button onClick={() => setShowEditResources(true)} className="mt-4 w-full py-2 text-xs font-semibold text-latte-text bg-cyan-600 border border-transparent rounded-lg hover:bg-cyan-700 transition-colors">
              Manage Resources
            </button>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
