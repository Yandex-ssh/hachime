'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [serverData, setServerData] = useState({ status: 'Connecting...', timestamp: '' });

  useEffect(() => {
    axios.get('http://localhost:4000/api/status')
      .then(res => setServerData(res.data))
      .catch(() => setServerData({ status: 'Backend Offline', timestamp: '-' }));
  }, []);

  const isAlive = serverData.status.includes('alive');

  return (
    <div className="min-h-screen bg-latte-base text-latte-text flex flex-col justify-between relative overflow-hidden selection:bg-latte-lavender selection:text-latte-base">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-latte-pink/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-latte-blue/5 blur-[130px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-latte-mauve to-latte-blue bg-clip-text text-transparent">
            八 Hachime
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <a href="/login" className="text-sm font-medium hover:text-latte-mauve dark:hover:text-latte-lavender transition-colors duration-200">
            Sign In
          </a>
          <a 
            href="/signup" 
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-latte-mauve to-latte-blue text-latte-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full px-6 flex flex-col items-center text-center justify-center py-20 space-y-8 z-10">
        
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-latte-surface0/50 border border-latte-surface1/10 text-xs font-mono">
          <span className={`h-2 w-2 rounded-full ${isAlive ? 'bg-latte-green animate-pulse' : 'bg-latte-red'}`} />
          <span className="opacity-80">System status:</span>
          <span className={isAlive ? "text-latte-green" : "text-latte-red"}>
            {isAlive ? 'Online' : 'Offline'}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Navigate Your Career <br />
          <span className="bg-gradient-to-r from-latte-mauve to-latte-blue bg-clip-text text-transparent">
            Pathway
          </span>
        </h1>

        <p className="text-base sm:text-lg text-latte-subtext1 max-w-xl mx-auto leading-relaxed">
          An intelligent pathfinder tool designed to align academic progress with real-world industry engineering roles.
        </p>

        <div>
          <a 
            href="/signup"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-latte-mauve to-latte-blue text-latte-base font-semibold shadow-lg shadow-latte-mauve/15 hover:shadow-latte-mauve/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            Start Mapping
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-latte-subtext0 opacity-70">
        <p>© {new Date().getFullYear()} Hachime. All rights reserved.</p>
      </footer>

    </div>
  );
}