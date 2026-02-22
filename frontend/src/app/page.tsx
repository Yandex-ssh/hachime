'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [serverData, setServerData] = useState({ status: 'Connecting...', timestamp: '' });

  useEffect(() => {
    // We use 4000 because NestJS is running there, and Next.js is on 3000
    axios.get('http://localhost:4000/api/status')
      .then(res => setServerData(res.data))
      .catch(() => setServerData({ status: 'Backend Offline', timestamp: '-' }));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold border-b-2 border-blue-500 pb-2">School System v1.0</h1>
      <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg">
        <p className="text-lg">Server Status:
          <span className={serverData.status.includes('alive') ? "text-green-400 ml-2" : "text-red-400 ml-2"}>
            {serverData.status}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-2">Last Checked: {serverData.timestamp}</p>
      </div>
    </div>
  );
}