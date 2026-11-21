'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark'; // 'light' is for white/sky backgrounds (default), 'dark' is for dark navy backgrounds
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-11 sm:h-11';

  return (
    <div className={`relative ${dim} rounded-2xl bg-gradient-to-tr from-[#0B1F3A] via-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/25 group-hover:scale-105 transition-all duration-300 overflow-hidden border border-white/20 shrink-0 ${className}`}>
      {/* SVG DigiWork Monogram Emblem */}
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dwIconAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8"/>
            <stop offset="100%" stopColor="#60A5FA"/>
          </linearGradient>
        </defs>

        {/* Stylized D Arc */}
        <path 
          d="M 24 22 L 48 22 C 66 22, 80 34, 80 50 C 80 66, 66 78, 48 78 L 24 78 Z" 
          stroke="url(#dwIconAccent)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.95"
        />

        {/* Dynamic W Chevrons */}
        <path 
          d="M 32 34 L 42 66 L 52 45 L 62 66 L 72 34" 
          stroke="#FFFFFF" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Connection Pulse Nodes */}
        <circle cx="42" cy="66" r="3" fill="#38BDF8"/>
        <circle cx="52" cy="45" r="3" fill="#38BDF8"/>
        <circle cx="62" cy="66" r="3" fill="#38BDF8"/>
        <circle cx="52" cy="22" r="3.5" fill="#38BDF8"/>
        <circle cx="52" cy="22" r="1.5" fill="#FFFFFF"/>
      </svg>
    </div>
  );
}

export default function Logo({
  variant = 'light',
  size = 'md',
  showTagline = true,
  className = '',
  href = '/',
}: LogoProps) {
  const isDark = variant === 'dark';

  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const taglineSize = size === 'sm' ? 'text-[8.5px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <Link href={href} className={`flex items-center gap-3 group select-none ${className}`}>
      <LogoIcon size={size} />
      
      <div className="flex flex-col">
        <span className={`${textSize} font-black tracking-tight leading-none flex items-center gap-0.5 ${isDark ? 'text-white' : 'text-[#0B1F3A]'}`}>
          Digi<span className="text-[#2563EB]">Work</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] inline-block ml-0.5 shadow-sm shadow-[#38BDF8]/50"></span>
        </span>
        
        {showTagline && (
          <span className={`${taglineSize} uppercase font-extrabold tracking-widest mt-1 ${isDark ? 'text-[#93C5FD]' : 'text-[#4B6F8E]'}`}>
            DIGITAL WORKFORCE • भारत
          </span>
        )}
      </div>
    </Link>
  );
}
