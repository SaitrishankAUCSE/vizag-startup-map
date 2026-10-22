'use client';

import React from 'react';
import Link from 'next/link';
import {
  Map as MapIcon,
  LayoutGrid,
  Briefcase,
  Sparkles,
  PlusCircle,
  User,
  Compass,
} from 'lucide-react';

interface TopNavProps {
  viewMode: 'map' | 'grid';
  onViewModeChange: (mode: 'map' | 'grid') => void;
  jobsCount: number;
  userEmail?: string | null;
}

export function TopNav({
  viewMode,
  onViewModeChange,
  jobsCount,
  userEmail,
}: TopNavProps) {
  return (
    <header className="h-14 bg-[#0E4D64] text-white px-3 md:px-5 flex items-center justify-between border-b border-[#093345] shadow-sm z-30 select-none">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <Compass className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm md:text-base tracking-tight leading-none text-white">
              Vizag Startup Map
            </span>
            <span className="text-[10px] text-teal-200/80 font-medium tracking-wide">
              Visakhapatnam Tech Ecosystem
            </span>
          </div>
        </Link>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Map / Grid Toggle */}
        <div className="bg-[#093345] p-1 rounded-lg flex items-center border border-white/10">
          <button
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-[#0E4D64] text-white shadow-sm border border-white/15'
                : 'text-teal-200/70 hover:text-white'
            }`}
            title="Map View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-[#0E4D64] text-white shadow-sm border border-white/15'
                : 'text-teal-200/70 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>

        {/* Jobs Button with Live Count */}
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
        >
          <Briefcase className="w-3.5 h-3.5 text-teal-300" />
          <span>Jobs</span>
          {jobsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#E04F36] text-white shadow-xs">
              {jobsCount}
            </span>
          )}
        </Link>

        {/* Pricing Link */}
        <Link
          href="/pricing"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Pricing</span>
        </Link>

        {/* Add your startup Button */}
        <Link
          href="/submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E04F36] hover:bg-[#c93e27] text-white transition-all shadow-sm active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add your startup</span>
          <span className="sm:hidden">Add</span>
        </Link>

        {/* Login / Account */}
        {userEmail ? (
          <Link
            href="/account"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={userEmail}
          >
            <User className="w-3.5 h-3.5 text-teal-300" />
            <span className="max-w-[80px] truncate hidden md:inline">Account</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
