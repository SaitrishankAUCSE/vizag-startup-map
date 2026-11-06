'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  X,
  ArrowRight,
  MapPin,
  ExternalLink,
  Search,
  Sparkles,
  Building,
} from 'lucide-react';
import { Job } from '@/types';

interface BottomJobsPillProps {
  jobs: Job[];
  onOpenJobsPanel?: () => void;
}

export const BottomJobsPill: React.FC<BottomJobsPillProps> = ({ jobs, onOpenJobsPanel }) => {
  const activeJobs = jobs.filter((j) => j.is_active);

  return (
    <button
      type="button"
      onClick={onOpenJobsPanel}
      className="flex items-center gap-2.5 bg-white/75 border border-[#3A0F34]/20 rounded-2xl rounded-tr-xs rounded-bl-xs pl-4 pr-1.5 py-1.5 shadow-[0_8px_30px_rgba(58,15,52,0.14)] backdrop-blur-xl hover:shadow-[0_12px_36px_rgba(58,15,52,0.2)] hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer select-none"
      aria-label={`View ${activeJobs.length} open jobs`}
    >
      {/* Green active dot */}
      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.7)] shrink-0 animate-pulse" />

      {/* Briefcase outline icon */}
      <Briefcase className="w-4 h-4 text-[#3A0F34]/70 shrink-0 stroke-[1.8]" />

      {/* Count text */}
      <span className="text-xs sm:text-[13px] font-display font-extrabold text-[#3A0F34] tracking-tight whitespace-nowrap">
        {activeJobs.length} jobs posted
      </span>

      {/* Divider */}
      <span className="h-4 w-[1px] bg-[#3A0F34]/15 shrink-0 mx-0.5" />

      {/* View jobs capsule button */}
      <span className="flex items-center gap-1.5 bg-[#3A0F34] text-[#DDE3E8] group-hover:bg-[#EAAA00] group-hover:text-[#3A0F34] rounded-xl rounded-tr-xs px-3 py-1 text-xs font-display font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs">
        <span>View jobs</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </button>
  );
};

interface JobsPanelProps {
  jobs: Job[];
  onClose: () => void;
}

// Format clean freshness label (never shows an embarrassing "900 days ago")
function getJobFreshnessBadge(job: Job): { label: string; isNew: boolean } {
  const dateStr = job.posted_at || job.first_seen_at || job.created_at;
  if (!dateStr) return { label: 'Active', isNew: false };

  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);

  if (days <= 0) return { label: 'New Today', isNew: true };
  if (days === 1) return { label: '1d ago', isNew: true };
  if (days <= 7) return { label: `${days}d ago`, isNew: true };
  if (days <= 21) return { label: `${Math.floor(days / 7)}w ago`, isNew: false };

  // For older active postings, display clean active status
  return { label: 'Actively Hiring', isNew: false };
}

export const JobsPanel: React.FC<JobsPanelProps> = ({ jobs, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const activeJobs = useMemo(() => jobs.filter((j) => j.is_active), [jobs]);

  const departments = useMemo(() => {
    return Array.from(new Set(activeJobs.map((j) => j.department).filter(Boolean))) as string[];
  }, [activeJobs]);

  const filteredJobs = useMemo(() => {
    return activeJobs.filter((j) => {
      if (selectedDept !== 'all' && j.department !== selectedDept) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = j.title.toLowerCase().includes(q);
        const matchesCompany = (j.company_name || '').toLowerCase().includes(q);
        const matchesLocation = (j.location_text || j.location || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesLocation) return false;
      }
      return true;
    });
  }, [activeJobs, selectedDept, searchQuery]);

  const distinctCompanies = useMemo(() => {
    return new Set(filteredJobs.map((j) => j.company_name || j.listing_id)).size;
  }, [filteredJobs]);

  return (
    <div className="fixed inset-y-0 right-0 z-[1400] flex items-stretch font-sans">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-[#3A0F34]/25 backdrop-blur-xs cursor-default transition-opacity"
        onClick={onClose}
        aria-label="Close jobs panel"
      />

      {/* Main Slide-Over Drawer */}
      <div
        className="relative ml-auto w-full max-w-sm sm:max-w-md bg-white border-l border-zinc-200/90 flex flex-col h-full shadow-[0_0_50px_rgba(58,15,52,0.18)] z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4.5 border-b border-zinc-100 flex items-center justify-between gap-3 bg-white">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Visakhapatnam Startup Roles</span>
            </div>
            <h2 className="font-display text-base font-extrabold text-zinc-900 mt-0.5">
              {filteredJobs.length} open {filteredJobs.length === 1 ? 'position' : 'positions'} across {distinctCompanies} {distinctCompanies === 1 ? 'company' : 'companies'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/70 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, company, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {departments.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedDept('all')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDept === 'all'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                All Roles
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Job List: Clean, Flat, Professional Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filteredJobs.map((job) => {
            const freshness = getJobFreshnessBadge(job);
            const companyName = job.company_name || 'Vizag Tech Venture';
            const locationDisplay = job.location_text || job.location || 'Visakhapatnam (On-site)';

            return (
              <div
                key={job.id}
                className="bg-white hover:bg-zinc-50/70 border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs group space-y-2.5"
              >
                {/* Top Row: Company & Freshness Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-[11px] shrink-0 shadow-2xs">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-800 truncate">
                      {companyName}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      freshness.isNew
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {!freshness.isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span>{freshness.label}</span>
                  </span>
                </div>

                {/* Role Title */}
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-900 group-hover:text-[#3A0F34] leading-snug transition-colors">
                    {job.title}
                  </h3>
                </div>

                {/* Bottom Row: Location / Meta & Clean Apply Button */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 min-w-0 truncate">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{locationDisplay}</span>
                    {job.department && (
                      <>
                        <span className="text-zinc-300">·</span>
                        <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {job.department}
                        </span>
                      </>
                    )}
                  </div>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: job.listing_id, event: 'apply_click' }),
                      }).catch(() => {});
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#3A0F34] text-white text-[11px] font-bold transition-all shadow-xs hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3 stroke-[2]" />
                  </a>
                </div>
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto opacity-30 text-zinc-600" />
              <p className="font-bold text-sm text-zinc-800">No matching roles found</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {searchQuery || selectedDept !== 'all'
                  ? 'Try clearing your search or department filter.'
                  : 'New engineering, design, and operations roles are synced weekly from Visakhapatnam companies.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Link to Full Directory */}
        <div className="border-t border-zinc-100 p-4 bg-zinc-50/50">
          <Link
            href="/jobs"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-[#3A0F34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer group"
          >
            <span>View Full Jobs Directory ({activeJobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
