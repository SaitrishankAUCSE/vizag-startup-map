'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Job } from '@/types';
import { AREAS } from '@/config/constants';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Search,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Banknote,
} from 'lucide-react';

interface JobsDirectoryClientProps {
  initialJobs: Job[];
  totalListingsCount: number;
}

// Clean freshness badge logic (replaces embarrassing "Seen 957d ago")
function getJobFreshnessBadge(job: Job): { label: string; isNew: boolean } {
  const dateStr = job.posted_at || job.first_seen_at || job.created_at;
  if (!dateStr) return { label: 'Actively Hiring', isNew: false };

  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);

  if (days <= 0) return { label: 'New Today', isNew: true };
  if (days === 1) return { label: '1d ago', isNew: true };
  if (days <= 7) return { label: `${days}d ago`, isNew: true };
  if (days <= 14) return { label: `${Math.floor(days / 7)}w ago`, isNew: false };

  return { label: 'Actively Hiring', isNew: false };
}

export function JobsDirectoryClient({
  initialJobs,
  totalListingsCount,
}: JobsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [newLast7DaysOnly, setNewLast7DaysOnly] = useState(false);

  // Job alerts subscription state
  const [alertEmail, setAlertEmail] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState('');

  const handleSubscribeAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim() || !alertEmail.includes('@')) {
      setAlertError('Please enter a valid work or personal email address.');
      return;
    }
    setAlertLoading(true);
    setAlertError('');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: alertEmail.trim(),
          area: selectedArea,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlertSuccess(true);
        setAlertEmail('');
      } else {
        setAlertError(data.error || 'Failed to subscribe to alerts.');
      }
    } catch {
      setAlertError('Network error. Please try again.');
    } finally {
      setAlertLoading(false);
    }
  };

  const departments = useMemo(() => {
    return Array.from(new Set(initialJobs.map((j) => j.department).filter(Boolean))) as string[];
  }, [initialJobs]);

  const employmentTypes = useMemo(() => {
    return Array.from(new Set(initialJobs.map((j) => j.employment_type).filter(Boolean))) as string[];
  }, [initialJobs]);

  const sevenDaysAgo = useMemo(() => Date.now() - 7 * 86400000, []);

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      if (selectedArea !== 'all' && job.company_area !== selectedArea) {
        return false;
      }
      if (selectedDepartment !== 'all' && job.department !== selectedDepartment) {
        return false;
      }
      if (selectedType !== 'all' && job.employment_type !== selectedType) {
        return false;
      }
      if (newLast7DaysOnly) {
        const postedTime = new Date(job.posted_at || job.first_seen_at || job.created_at).getTime();
        if (postedTime < sevenDaysAgo) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = (job.company_name || '').toLowerCase().includes(q);
        const matchLocation = (job.location_text || job.location || '').toLowerCase().includes(q);
        const matchDept = (job.department || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchLocation && !matchDept) return false;
      }
      return true;
    });
  }, [initialJobs, searchQuery, selectedArea, selectedDepartment, selectedType, newLast7DaysOnly, sevenDaysAgo]);

  const activeFilteredCompanies = useMemo(() => {
    return new Set(filteredJobs.map((j) => j.company_name || j.listing_id)).size;
  }, [filteredJobs]);

  if (initialJobs.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-[#3A0F34]/15 rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center mx-auto mb-2 shadow-md">
          <Briefcase className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h3 className="font-display font-extrabold text-2xl text-[#3A0F34]">
          No open roles posted yet.
        </h3>
        <p className="text-xs sm:text-sm text-[#3A0F34]/75 max-w-md mx-auto leading-relaxed">
          Are you a startup founder in Visakhapatnam hiring talent? Post your opening to reach thousands of engineers and builders.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Submit your startup & jobs</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-[#3A0F34]/25 text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34]/10 transition-colors"
          >
            Explore Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls: Clean White Card ── */}
      <div className="bg-white/90 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#3A0F34]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company name, department, or keywords..."
              className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-[#3A0F34]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs font-medium text-[#3A0F34] placeholder:text-[#3A0F34]/40 focus:outline-none focus:ring-2 focus:ring-[#3A0F34]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Area & Type Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-zinc-50 hover:bg-white border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#3A0F34] cursor-pointer outline-none focus:ring-2 focus:ring-[#3A0F34]/20 transition-all"
            >
              <option value="all">All Neighborhoods</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {employmentTypes.length > 0 && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-zinc-50 hover:bg-white border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#3A0F34] cursor-pointer outline-none focus:ring-2 focus:ring-[#3A0F34]/20 transition-all"
              >
                <option value="all">All Job Types</option>
                {employmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#3A0F34]/10">
          <button
            type="button"
            onClick={() => setSelectedDepartment('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDepartment === 'all'
                ? 'bg-[#3A0F34] text-[#DDE3E8] shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-[#3A0F34]/80'
            }`}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDepartment === dept
                  ? 'bg-[#3A0F34] text-[#DDE3E8] shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-[#3A0F34]/80'
              }`}
            >
              {dept}
            </button>
          ))}

          {(searchQuery || selectedArea !== 'all' || selectedDepartment !== 'all' || selectedType !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('all');
                setSelectedDepartment('all');
                setSelectedType('all');
              }}
              className="text-xs font-bold text-[#3A0F34] hover:underline cursor-pointer ml-auto flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Results Summary Bar ── */}
      <div className="flex items-center justify-between text-xs font-bold text-[#3A0F34]/70 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>
            <strong className="text-[#3A0F34] font-extrabold text-sm">{filteredJobs.length}</strong> open {filteredJobs.length === 1 ? 'role' : 'roles'} at{' '}
            <strong className="text-[#3A0F34] font-extrabold text-sm">{activeFilteredCompanies}</strong> {activeFilteredCompanies === 1 ? 'company' : 'companies'}
          </span>
        </div>
        <Link
          href="/pricing"
          className="text-[#3A0F34] hover:text-[#EAAA00] font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
          <span>Get Instant Alerts</span>
        </Link>
      </div>

      {/* ── Job Cards List ── */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <p className="font-display font-bold text-xl text-[#3A0F34]">
            No roles found matching your active filters.
          </p>
          <p className="text-xs text-[#3A0F34]/70 max-w-sm mx-auto">
            Try searching for other keywords or clearing the neighborhood filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedArea('all');
              setSelectedDepartment('all');
              setSelectedType('all');
            }}
            className="inline-block px-5 py-2 rounded-xl bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const freshness = getJobFreshnessBadge(job);
            const companyName = job.company_name || 'Vizag Tech Venture';
            const locationDisplay = job.location_text || job.location || 'Visakhapatnam (On-site)';

            return (
              <div
                key={job.id}
                className="bg-white hover:bg-zinc-50/80 border border-[#3A0F34]/15 hover:border-[#3A0F34]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left: Monogram, Title, Tags */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-2xs mt-0.5">
                    {companyName.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-[#3A0F34] group-hover:text-[#3A0F34] leading-tight">
                        {job.title}
                      </h3>
                      {freshness.isNew ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          ⚡ {freshness.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{freshness.label}</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#3A0F34]/75 flex-wrap">
                      {job.company_slug ? (
                        <Link
                          href={`/startup/${job.company_slug}`}
                          className="font-extrabold text-[#3A0F34] hover:text-[#EAAA00] transition-colors flex items-center gap-1"
                        >
                          {companyName}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="font-extrabold text-[#3A0F34]">{companyName}</span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#3A0F34]/70">
                        <MapPin className="w-3 h-3 text-[#3A0F34]/50" />
                        {locationDisplay}
                      </span>
                      {job.department && (
                        <>
                          <span>·</span>
                          <span className="bg-[#3A0F34]/8 text-[#3A0F34] px-2 py-0.5 rounded text-[10.5px] font-semibold">
                            {job.department}
                          </span>
                        </>
                      )}
                      {job.employment_type && (
                        <>
                          <span>·</span>
                          <span className="text-[#3A0F34]/60 text-[11px]">
                            {job.employment_type}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Salary range if available */}
                    {job.salary_range && (
                      <div className="pt-0.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Apply Button */}
                <div className="shrink-0 flex items-center self-stretch md:self-auto justify-end">
                  {job.apply_url ? (
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
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-[#3A0F34]/50">Direct listing</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vizag Tech Job Alerts Subscription Box ── */}
      <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAAA00]/30 relative overflow-hidden mt-10">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#EAAA00]">
            <Sparkles className="w-4 h-4" /> Vizag Tech Job Alerts
          </div>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Never miss a high-growth role in Visakhapatnam.
          </h3>
          <p className="text-xs sm:text-sm text-[#DDE3E8]/80 leading-relaxed">
            Get instant notifications when verified startups in Rushikonda, AMTZ, or Siripuram post engineering, product, or leadership roles.
          </p>

          {alertSuccess ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold mt-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>You are subscribed! We will email you when new tech roles open.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribeAlerts} className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white/10 border border-[#DDE3E8]/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#DDE3E8]/50 focus:outline-none focus:border-[#EAAA00] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={alertLoading}
                className="bg-[#EAAA00] text-[#3A0F34] hover:bg-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {alertLoading ? 'Subscribing...' : 'Get Job Alerts'}
              </button>
            </form>
          )}
          {alertError && (
            <p className="text-xs text-rose-300 font-medium mt-1">{alertError}</p>
          )}
        </div>
      </div>

      {/* Floating View on Map Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-2xl border border-[#EAAA00]/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span>🗺️ View on Map</span>
        </Link>
      </div>
    </div>
  );
}
