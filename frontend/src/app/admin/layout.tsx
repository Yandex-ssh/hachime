'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Students', href: '/admin/students', icon: '👥' },
  { name: 'Subjects', href: '/admin/subjects', icon: '📚' },
  { name: 'Careers', href: '/admin/careers', icon: '🎯' },
  { name: 'Skills', href: '/admin/skills', icon: '⚡' },
  { name: 'Internships', href: '/admin/internships', icon: '💼' },
  { name: 'Alumni', href: '/admin/alumni', icon: '🎓' },
  { name: 'Industry Trends', href: '/admin/industry-trends', icon: '📈' },
  { name: 'Dev Tracks', href: '/admin/development-tracks', icon: '🗺️' },
  { name: 'Job Listings', href: '/admin/job-listings', icon: '🏢' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminInitials, setAdminInitials] = useState('AD');
  const [adminName, setAdminName] = useState('Administrator');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('student');
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string };
        if (parsed?.name) {
          setAdminName(parsed.name);
          const parts = parsed.name.trim().split(/\s+/);
          const initials =
            parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : parts[0].slice(0, 2).toUpperCase();
          setAdminInitials(initials);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans antialiased text-gray-900 dark:text-gray-200 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl relative z-20 transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-68'}`}>
        <AdminSidebarContent 
          pathname={pathname} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          closeMobile={() => {}} 
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col md:hidden transition-transform duration-300 w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebarContent 
          pathname={pathname} 
          isCollapsed={false} 
          setIsCollapsed={() => {}} 
          closeMobile={() => setMobileOpen(false)} 
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-gray-900/40 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between px-4 sm:px-8 z-10 w-full min-w-0">
          <div className="flex items-center gap-3">
             <button
                className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
             </button>
             <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  System Live • <span className="text-gray-600 dark:text-gray-500 font-medium">PathFinder Admin</span>
                </h2>
             </div>
             <div className="flex sm:hidden items-center gap-2">
               <h2 className="text-sm font-bold text-gray-900 dark:text-white">Admin</h2>
             </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <ThemeToggle />
            {(!isCollapsed && !mobileOpen) && (
              <div className="hidden md:flex flex-col items-end mr-1 animate-in fade-in duration-500">
                 <span className="text-xs font-bold text-gray-900 dark:text-white">{adminName}</span>
                 <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Full Access</span>
              </div>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 p-[1px] shadow-lg shadow-indigo-900/20">
               <div className="w-full h-full rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-indigo-700 dark:text-white font-bold text-xs sm:text-sm">
                 {adminInitials}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8 relative z-0 hide-scrollbar min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminSidebarContent({
  pathname,
  isCollapsed,
  setIsCollapsed,
  closeMobile
}: {
  pathname: string;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  closeMobile: () => void;
}) {
  return (
    <>
      <div className={`h-20 flex flex-shrink-0 items-center mb-2 transition-all ${isCollapsed ? 'px-0 justify-center' : 'px-7'}`}>
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 flex-shrink-0">
            ✦
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white animate-in fade-in duration-500">
              Admin <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
            </h1>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-4 mt-2 animate-in fade-in duration-500">
            Management
          </div>
        )}
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              title={isCollapsed ? item.name : ''}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.name}
                </span>
              )}
              {!isCollapsed && isActive && (
                 <div className="ml-auto w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto flex-shrink-0 border-t border-gray-200 dark:border-gray-800/50 space-y-2">
        <Link
          href="/dashboard"
          onClick={closeMobile}
          title={isCollapsed ? 'Exit to Home' : ''}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">🏠</span>
          {!isCollapsed && <span>Exit to Home</span>}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className={`text-lg transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}>
             {isCollapsed ? '📂' : '📁'}
          </span>
          {!isCollapsed && <span>Collapse Menu</span>}
        </button>
      </div>
    </>
  );
}
