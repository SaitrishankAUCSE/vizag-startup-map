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
  Calendar,
  Building2,
  Clock,
  Plus,
} from 'lucide-react';

interface JobsDirectoryClientProps {
  initialJobs: Job[];
  totalListingsCount: number;
}

function getDaysAgo(dateStr?: string | null): string {
  if (!dateStr) return 'recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
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

  // Derive distinct companies, departments, types
  const companiesHiring = useMemo(() => {
    return Array.from(new Set(initialJobs.map((j) => j.company_name).filter(Boolean)));
  }, [initialJobs]);

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
      <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center mx-auto mb-2 shadow-md">
          <Briefcase className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h3 className="font-display font-extrabold text-2xl text-[#3A0F34]">
          No open roles posted yet.
        </h3>
        <p className="text-xs sm:text-sm text-[#3A0F34]/75 max-w-md mx-auto leading-relaxed">
          Are you a startup founder in Visakhapatnam hiring talent? Post your opening or connect your ATS board (Greenhouse, Lever, Ashby) to sync automatically.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Submit your startup & jobs</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#3A0F34]/25 text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34]/10 transition-colors"
          >
            Explore Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls ── */}
      <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#3A0F34]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company name, department or tech..."
              className="w-full bg-white border border-[#3A0F34]/25 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-[#3A0F34] placeholder:text-[#3A0F34]/50 focus:outline-none focus:ring-2 focus:ring-[#3A0F34] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-white border border-[#3A0F34]/25 rounded-full px-3.5 py-2 text-xs font-bold text-[#3A0F34] cursor-pointer"
            >
              <option value="all">All Areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {departments.length > 0 && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-white border border-[#3A0F34]/25 rounded-full px-3.5 py-2 text-xs font-bold text-[#3A0F34] cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {employmentTypes.length > 0 && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-[#3A0F34]/25 rounded-full px-3.5 py-2 text-xs font-bold text-[#3A0F34] cursor-pointer"
              >
                <option value="all">All Types</option>
                {employmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Chip row */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#3A0F34]/10">
          <button
            type="button"
            onClick={() => setNewLast7DaysOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              newLast7DaysOnly
                ? 'bg-[#3A0F34] text-[#EAAA00]'
                : 'bg-white/70 border border-[#3A0F34]/20 text-[#3A0F34] hover:bg-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>New in the last 7 days</span>
          </button>

          {(searchQuery || selectedArea !== 'all' || selectedDepartment !== 'all' || selectedType !== 'all' || newLast7DaysOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('all');
                setSelectedDepartment('all');
                setSelectedType('all');
                setNewLast7DaysOnly(false);
              }}
              className="text-xs font-bold text-[#3A0F34] hover:underline cursor-pointer ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ── Results Bar ── */}
      <div className="flex items-center justify-between text-xs font-bold text-[#3A0F34]/70 px-1">
        <div>
          <span className="text-[#3A0F34] font-extrabold text-sm">{filteredJobs.length}</span> open {filteredJobs.length === 1 ? 'role' : 'roles'} at{' '}
          <span className="text-[#3A0F34] font-extrabold text-sm">{activeFilteredCompanies}</span> {activeFilteredCompanies === 1 ? 'company' : 'companies'}
        </div>
        <Link
          href="/pricing"
          className="text-[#3A0F34] hover:text-[#EAAA00] font-bold uppercase tracking-[0.14em] flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-[#EAAA00]" /> Get Job Alerts (Pro)
        </Link>
      </div>

      {/* ── Job Cards List ── */}
      {filteredJobs.length === 0 ? (
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-12 text-center space-y-4">
          <p className="font-display font-bold text-xl text-[#3A0F34]">
            No roles found matching your active filters.
          </p>
          <p className="text-xs text-[#3A0F34]/70 max-w-sm mx-auto">
            Try adjusting your search query, or uncheck the 7-day filter to discover more roles.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedArea('all');
              setSelectedDepartment('all');
              setSelectedType('all');
              setNewLast7DaysOnly(false);
            }}
            className="inline-block px-5 py-2 rounded-full bg-[#EAAA00] text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map((job) => {
            const hasRealPostedDate = Boolean(job.posted_at);
            const dateLabel = hasRealPostedDate
              ? `Posted ${getDaysAgo(job.posted_at)}`
              : `Seen ${getDaysAgo(job.first_seen_at || job.created_at)}`;

            return (
              <div
                key={job.id}
                className="bg-[#DDE3E8] border border-[#3A0F34]/20 hover:border-[#3A0F34]/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-lg text-[#3A0F34] leading-tight">
                      {job.title}
                    </h3>
                    {job.department && (
                      <span className="bg-[#3A0F34]/8 text-[#3A0F34] rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        {job.department}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="bg-[#3A0F34]/8 text-[#3A0F34] rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        {job.employment_type}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-[#3A0F34]/75 flex-wrap">
                    {job.company_slug ? (
                      <Link
                        href={`/startup/${job.company_slug}`}
                        className="font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors flex items-center gap-1"
                      >
                        {job.company_name}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="font-bold text-[#3A0F34]">{job.company_name}</span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#3A0F34]/60" />
                      {job.location_text || job.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#3A0F34]/60">
                      <Clock className="w-3 h-3 text-[#3A0F34]/50" />
                      {dateLabel}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5 self-stretch md:self-auto justify-end">
                  {job.apply_url ? (
                    <>
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
                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#EAAA00] text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors shadow-xs"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-[10px] text-[#3A0F34]/55 italic text-right">
                        You will apply on {job.company_name || 'the company'}&apos;s website.
                      </p>
                    </>
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
              <span>✓ You are subscribed! We will email you when new tech roles open.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribeAlerts} className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white/10 border border-[#DDE3E8]/30 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-[#DDE3E8]/50 focus:outline-none focus:border-[#EAAA00] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={alertLoading}
                className="bg-[#EAAA00] text-[#3A0F34] hover:bg-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
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
          className="flex items-center gap-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl border border-[#EAAA00]/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span>🗺️ View on Map</span>
        </Link>
      </div>
    </div>
  );
}
