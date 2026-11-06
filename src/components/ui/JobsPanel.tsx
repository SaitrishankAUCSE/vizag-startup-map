'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Briefcase, X, ArrowRight, Clock, MapPin, Filter } from 'lucide-react';
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
      className="flex items-center gap-2.5 bg-white/95 border border-[#3A0F34]/15 rounded-full pl-3.5 pr-1.5 py-1.5 shadow-[0_4px_20px_rgba(58,15,52,0.12)] backdrop-blur-md hover:shadow-[0_6px_24px_rgba(58,15,52,0.18)] transition-all group cursor-pointer select-none"
      aria-label={`View ${activeJobs.length} open jobs`}
    >
      {/* Green active dot */}
      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />

      {/* Briefcase outline icon */}
      <Briefcase className="w-4 h-4 text-[#3A0F34]/70 shrink-0 stroke-[1.8]" />

      {/* Count text */}
      <span className="text-xs sm:text-[13px] font-semibold text-[#3A0F34] tracking-tight whitespace-nowrap">
        {activeJobs.length} jobs posted
      </span>

      {/* Divider */}
      <span className="h-4 w-[1px] bg-[#3A0F34]/15 shrink-0 mx-0.5" />

      {/* View jobs capsule button */}
      <span className="flex items-center gap-1.5 bg-[#3A0F34]/10 group-hover:bg-[#3A0F34] group-hover:text-[#EAAA00] text-[#3A0F34] rounded-full px-3 py-1 text-xs font-semibold transition-colors shrink-0">
        <span>View jobs</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#3A0F34] group-hover:text-[#EAAA00] group-hover:translate-x-0.5 transition-transform" />
      </span>
    </button>
  );
};

interface JobsPanelProps {
  jobs: Job[];
  onClose: () => void;
}

function getDaysAgo(dateStr?: string | null): string {
  if (!dateStr) return 'recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export const JobsPanel: React.FC<JobsPanelProps> = ({ jobs, onClose }) => {
  const [filterNewOnly, setFilterNewOnly] = useState(false);
  const [selectedDept, setSelectedDept] = useState('all');

  const activeJobs = jobs.filter((j) => j.is_active);
  const sevenDaysAgo = Date.now() - 7 * 86400000;

  const filteredJobs = useMemo(() => {
    return activeJobs.filter((j) => {
      if (filterNewOnly) {
        const time = new Date(j.posted_at || j.first_seen_at || j.created_at).getTime();
        if (time < sevenDaysAgo) return false;
      }
      if (selectedDept !== 'all' && j.department !== selectedDept) {
        return false;
      }
      return true;
    });
  }, [activeJobs, filterNewOnly, selectedDept, sevenDaysAgo]);

  const distinctCompanies = useMemo(() => {
    return new Set(filteredJobs.map((j) => j.company_name || j.listing_id)).size;
  }, [filteredJobs]);

  const departments = useMemo(() => {
    return Array.from(new Set(activeJobs.map((j) => j.department).filter(Boolean))) as string[];
  }, [activeJobs]);

  const byCompany = useMemo(() => {
    return filteredJobs.reduce<Record<string, Job[]>>((acc, j) => {
      const key = j.company_name || 'Vizag Company';
      if (!acc[key]) acc[key] = [];
      acc[key].push(j);
      return acc;
    }, {});
  }, [filteredJobs]);

  return (
    <div className="fixed inset-y-0 right-0 z-[1400] flex items-stretch">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-[#3A0F34]/20 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close jobs panel"
      />

      {/* Panel */}
      <div
        className="relative ml-auto w-full max-w-sm sm:max-w-md bg-[#DDE3E8] border-l border-[#3A0F34]/12 flex flex-col h-full shadow-[0_0_40px_rgba(58,15,52,0.25)] slide-in-left"
        style={{ animationName: 'slide-in-right' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A0F34]/10 bg-white/40">
          <div>
            <h2 className="font-display text-base font-extrabold text-[#3A0F34]">
              {filteredJobs.length} open {filteredJobs.length === 1 ? 'role' : 'roles'} at {distinctCompanies}{' '}
              {distinctCompanies === 1 ? 'company' : 'companies'}
            </h2>
            <p className="text-[11px] text-[#3A0F34]/65">Live postings synced from official feeds</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/8 text-[#3A0F34] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="px-5 py-2.5 border-b border-[#3A0F34]/10 flex items-center gap-2 flex-wrap text-xs bg-white/20">
          <button
            type="button"
            onClick={() => setFilterNewOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
              filterNewOnly
                ? 'bg-[#3A0F34] text-[#EAAA00]'
                : 'bg-white/80 border border-[#3A0F34]/20 text-[#3A0F34] hover:bg-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>New in last 7 days</span>
          </button>

          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white/80 border border-[#3A0F34]/20 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#3A0F34]"
            >
              <option value="all">All Depts</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scrollable job list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {Object.entries(byCompany).map(([company, compJobs]) => (
            <div key={company}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center text-xs font-bold shrink-0">
                  {company.charAt(0)}
                </div>
                <div className="font-semibold text-sm text-[#3A0F34]">{company}</div>
                <div className="text-[10px] text-[#3A0F34]/50 ml-auto shrink-0 font-bold">
                  {compJobs.length} {compJobs.length === 1 ? 'role' : 'roles'}
                </div>
              </div>
              <div className="space-y-1.5 ml-9">
                {compJobs.map((j) => {
                  const dateLabel = j.posted_at
                    ? `Posted ${getDaysAgo(j.posted_at)}`
                    : `Seen ${getDaysAgo(j.first_seen_at || j.created_at)}`;

                  return (
                    <div
                      key={j.id}
                      className="bg-white/60 hover:bg-white border border-[#3A0F34]/8 rounded-xl p-3 transition-colors shadow-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 pr-2 flex-1">
                          <div className="text-xs font-bold text-[#3A0F34] truncate">{j.title}</div>
                          <div className="text-[10px] text-[#3A0F34]/60 mt-0.5 flex items-center gap-2">
                            <span>{j.location_text || j.location}</span>
                            <span>·</span>
                            <span>{dateLabel}</span>
                          </div>
                        </div>
                        <a
                          href={j.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            fetch('/api/analytics', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ listingId: j.listing_id, event: 'apply_click' }),
                            }).catch(() => {});
                          }}
                          className="flex items-center gap-1 bg-[#EAAA00] hover:bg-[#d89800] text-[#3A0F34] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 transition-colors cursor-pointer"
                        >
                          Apply
                        </a>
                      </div>
                      <p className="text-[9px] text-[#3A0F34]/55 italic">
                        You will apply on {company}&apos;s website.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-16 text-[#3A0F34]/60 space-y-2">
              <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#3A0F34]" />
              <p className="font-bold text-sm">No open roles found</p>
              <p className="text-xs text-[#3A0F34]/60 max-w-xs mx-auto">
                {activeJobs.length === 0
                  ? 'No startups have posted open jobs yet. Founders can submit roles on the submit page.'
                  : 'Try resetting the filters above to view all roles.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#3A0F34]/10 px-5 py-3 bg-white/40">
          <Link
            href="/jobs"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#3A0F34] text-[#DDE3E8] rounded-full py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors cursor-pointer"
          >
            <span>View full jobs directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
