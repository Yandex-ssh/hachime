"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const navItems = [
    {
        label: "Home",
        href: "/dashboard",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: "Career Pathway",
        href: "/pathway",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    {
        label: "Skills to Improve",
        href: "/skills",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        label: "Internships",
        href: "/internships",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        label: "Job Listings",
        href: "/jobs",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M5 7v14a2 2 0 002 2h10a2 2 0 002-2V7"
                />
            </svg>
        ),
    },
    {
        label: "Development Resources",
        href: "/resources",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4m12-4a2 2 0 100 4m0-4a2 2 0 110 4M6 10v4m12-4v4M12 14v4"
                />
            </svg>
        ),
    },
    {
        label: "Alumni Tracks",
        href: "/alumni",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        label: "Industry Trends",
        href: "/trends",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        ),
    },
];

const bottomItems = [
    {
        label: "Profile & Settings",
        href: "/profile",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [me, setMe] = useState<null | {
        name?: string;
        program_code?: string;
        year_level?: number;
        profile_picture_url?: string | null;
    }>(null);

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        (typeof window !== "undefined" ? `http://${window.location.hostname}:4000` : "http://localhost:4000");

    useEffect(() => {
        const load = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

                if (!token) {
                    console.warn("Auth bypass: No token found, using mock data.");
                    setMe({
                        name: "Guest Student",
                        program_code: "BSCS",
                        year_level: 3,
                        profile_picture_url: null,
                    });
                    setCheckingAuth(false);
                    return;
                }

                // Auth ok, fetch current student profile for top bar display
                try {
                    const res = await fetch(`${apiBaseUrl}/students/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const json = await res.json().catch(() => null);
                    if (res.ok && json) {
                        setMe({
                            name: json.name,
                            program_code: json.program_code,
                            year_level: json.year_level,
                            profile_picture_url: json.profile_picture_url ?? null,
                        });
                    }
                } catch {
                    // ignore
                }

                setCheckingAuth(false);
            } catch {
                console.warn("Auth bypass: Auth check failed, using mock data.");
                setMe({
                    name: "Guest Student",
                    program_code: "BSCS",
                    year_level: 3,
                    profile_picture_url: null,
                });
                setCheckingAuth(false);
            }
        };

        load();
    }, [router, apiBaseUrl, pathname]);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("student");
        }
        router.replace("/login");
    };

    const isActive = (href: string) => pathname === href;
    const handleBrandClick = () => {
        setMobileOpen(false);
        router.push("/dashboard");
        router.refresh();
    };



    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Checking your session...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex-shrink-0
          ${collapsed ? "w-16" : "w-60"}
        `}
            >
                <SidebarContent
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    isActive={isActive}
                    handleBrandClick={handleBrandClick}
                    handleLogout={handleLogout}
                    setMobileOpen={setMobileOpen}
                />
            </aside>

            {/* ── MOBILE SIDEBAR OVERLAY ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside
                className={`fixed top-0 left-0 h-full z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col md:hidden transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <SidebarContent
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    isActive={isActive}
                    handleBrandClick={handleBrandClick}
                    handleLogout={handleLogout}
                    setMobileOpen={setMobileOpen}
                />
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top bar */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title — shows current route */}
                    <h1 className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">
                        {navItems.find((n) => n.href === pathname)?.label ||
                            bottomItems.find((n) => n.href === pathname)?.label ||
                            "TMC Career Pathway"}
                    </h1>

                    {/* Student info and Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/profile" className="flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
                            <div className="text-right hidden sm:block">
                                <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight">{me?.name ?? "Student"}</p>
                                <p className="text-gray-500 text-xs">
                                    {(me?.program_code ?? "—")} ·{" "}
                                    {me?.year_level
                                        ? `${me.year_level}${me.year_level === 1 ? "st" : me.year_level === 2 ? "nd" : me.year_level === 3 ? "rd" : "th"} Year`
                                        : "—"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 overflow-hidden flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                {me?.profile_picture_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={me.profile_picture_url} alt="Student profile picture" className="w-full h-full object-cover" />
                                ) : (
                                    (me?.name?.trim()?.[0] ?? "S").toUpperCase()
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
function SidebarContent({
    collapsed,
    setCollapsed,
    isActive,
    handleBrandClick,
    handleLogout,
    setMobileOpen
}: {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isActive: (href: string) => boolean;
    handleBrandClick: () => void;
    handleLogout: () => void;
    setMobileOpen: (open: boolean) => void;
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <button
                type="button"
                onClick={handleBrandClick}
                className={`w-full flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors ${collapsed ? "justify-center" : ""}`}
                title="Go to Dashboard"
            >
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                    ✦
                </div>
                {!collapsed && (
                    <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-bold text-sm leading-tight">Ascents</p>
                        <p className="text-gray-500 text-xs">Pathway Tool</p>
                    </div>
                )}
            </button>

            {/* Main Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive(item.href)
                                ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            }
              ${collapsed ? "justify-center" : ""}
            `}
                        title={collapsed ? item.label : ""}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && isActive(item.href) && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Bottom Nav */}
            <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1">
                {bottomItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive(item.href)
                                ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            }
              ${collapsed ? "justify-center" : ""}
            `}
                        title={collapsed ? item.label : ""}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all w-full
            ${collapsed ? "justify-center" : ""}
          `}
                    title={collapsed ? "Logout" : ""}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!collapsed && <span>Logout</span>}
                </button>

                {/* Collapse toggle (desktop only) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 transition-all
            ${collapsed ? "justify-center" : ""}
          `}
                >
                    <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </div>
    );
}