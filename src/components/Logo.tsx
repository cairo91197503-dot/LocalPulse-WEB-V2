import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#3a7bd5" />
          </linearGradient>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        
        {/* Chat Bubble */}
        <path d="M10 25C10 16.7157 16.7157 10 25 10H75C83.2843 10 90 16.7157 90 25V65C90 73.2843 83.2843 80 75 80H35L15 95V80C12.2386 80 10 77.7614 10 75V25Z" fill="url(#bgGrad)" />
        
        {/* Lines */}
        <rect x="25" y="30" width="30" height="6" rx="3" fill="white" />
        <rect x="25" y="45" width="45" height="6" rx="3" fill="white" />
        <rect x="25" y="60" width="20" height="6" rx="3" fill="white" />
        
        {/* Sparkle */}
        <path d="M85 5C86.5 15 90 18.5 100 20C90 21.5 86.5 25 85 35C83.5 25 80 21.5 70 20C80 18.5 83.5 15 85 5Z" fill="#fbbf24" />
        
        {/* IA Badge */}
        <circle cx="75" cy="75" r="18" fill="url(#badgeGrad)" stroke="white" strokeWidth="2" />
        <text x="75" y="81" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">IA</text>
      </svg>
    </div>
  );
}

export function LogoText({ className = "text-xl font-bold tracking-tight" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-slate-900">local</span>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400">pulse</span>
    </div>
  );
}
