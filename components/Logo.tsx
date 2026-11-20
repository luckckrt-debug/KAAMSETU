'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark'; // 'light' is for white/sky backgrounds (default), 'dark' is for dark blue/navy backgrounds
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-11 sm:h-11';

  return (
    <div className={`relative ${dim} rounded-2xl bg-gradient-to-tr from-[#123B5D] via-[#19639E] to-[#2196E8] flex items-center justify-center text-white shadow-md shadow-[#2196E8]/25 group-hover:scale-105 transition-all duration-300 overflow-hidden border border-white/20 ${className}`}>
      {/* SVG Setu Emblem */}
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="setuGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D"/>
            <stop offset="100%" stop-color="#F59E0B"/>
          </linearGradient>
          <linearGradient id="setuArch" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#93C5FD"/>
          </linearGradient>
        </defs>

        {/* Golden Sun / Nexus */}
        <circle cx="50" cy="42" r="11" fill="url(#setuGold)" />
        <circle cx="50" cy="42" r="16" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Suspension Cables */}
        <path d="M 28 68 L 50 40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <path d="M 38 68 L 50 40" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
        <path d="M 46 68 L 50 40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M 72 68 L 50 40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <path d="M 62 68 L 50 40" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
        <path d="M 54 68 L 50 40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Bridge Arch ("Setu") */}
        <path d="M 18 70 C 30 44, 70 44, 82 70" stroke="url(#setuArch)" strokeWidth="4.5" strokeLinecap="round" fill="none" />

        {/* Foundation Deck */}
        <path d="M 16 70 L 84 70" stroke="#FFFFFF" strokeWidth="3.8" strokeLinecap="round" />
        <circle cx="50" cy="70" r="3.5" fill="#F59E0B" />
        <circle cx="50" cy="70" r="1.5" fill="#FFFFFF" />

        {/* Pillars */}
        <path d="M 28 70 L 28 78" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <path d="M 72 70 L 72 78" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />

        {/* Dynamic Wave */}
        <path d="M 22 82 C 32 79, 42 84, 50 81 C 58 79, 68 84, 78 82" stroke="#60B5F5" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
}

export default function Logo({
  variant = 'light',
  size = 'md',
  showTagline = true,
  className = '',
}: LogoProps) {
  const isDark = variant === 'dark';

  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const taglineSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <Link href="/" className={`flex items-center gap-3 group select-none ${className}`}>
      <LogoIcon size={size} />
      
      <div className="flex flex-col">
        <span className={`${textSize} font-black tracking-tight leading-none flex items-center gap-1 ${isDark ? 'text-white' : 'text-black'}`}>
          KAAM <span className="text-[#2196E8]">SETU</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] inline-block ml-0.5"></span>
        </span>
        
        {showTagline && (
          <span className={`${taglineSize} uppercase font-black tracking-widest mt-1 ${isDark ? 'text-[#93C5FD]' : 'text-black'}`}>
            काम सेतु • WORKFORCE
          </span>
        )}
      </div>
    </Link>
  );
}
