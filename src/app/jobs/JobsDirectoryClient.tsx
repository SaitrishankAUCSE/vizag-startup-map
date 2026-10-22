'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Job } from '@/types';
import { AREAS } from '@/config/constants';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Building,
  Search,
  Filter,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface JobsDirectoryClientProps {
  initialJobs: Job[];
  totalListingsCount: number;
}

export function JobsDirectoryClient({
  initialJobs,
  totalListingsCount,
}: JobsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      if (selectedArea !== 'all' && job.company_area !== selectedArea) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = (job.company_name || '').toLowerCase().includes(q);
        const matchLocation = job.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchLocation) return false;
      }
      return true;
    });
  }, [initialJobs, searchQuery, selectedArea]);

  return (
    <div className="space-y-6">
      {/* Search & Area Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E6E0D4] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/30 focus:border-[#0E4D64]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 shrink-0">Area:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            aria-label="Filter by neighborhood"
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0E4D64]"
          >
            <option value="all">All Vizag Neighborhoods</option>
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-400 ml-2 shrink-0">
            {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Jobs Grid / List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E6E0D4] p-12 text-center">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#0E4D64]">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No matching jobs found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different neighborhood in Vizag.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedArea('all');
            }}
            className="mt-4 px-4 py-2 bg-[#0E4D64] text-white text-xs font-semibold rounded-lg hover:bg-[#093345] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-5 border border-[#E6E0D4] hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E4D64] font-bold text-xs shrink-0">
                      {job.company_name ? job.company_name.charAt(0) : 'S'}
                    </div>
                    <div>
                      {job.company_slug ? (
                        <Link
                          href={`/startup/${job.company_slug}`}
                          className="text-xs font-semibold text-gray-600 hover:text-[#0E4D64] hover:underline flex items-center gap-1"
                        >
                          <Building className="w-3 h-3 text-gray-400" />
                          <span>{job.company_name}</span>
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span>{job.company_name || 'Vizag Tech Team'}</span>
                        </span>
                      )}
                      <h2 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#0E4D64] transition-colors">
                        {job.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Posted {new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0E4D64] hover:bg-[#093345] text-white transition-all shadow-xs"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Founder Hiring Callout */}
      <div className="mt-8 bg-gradient-to-r from-teal-900 to-[#0E4D64] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-base md:text-lg">Are you hiring in Visakhapatnam?</h3>
          <p className="text-xs md:text-sm text-teal-100/90 mt-1 max-w-xl">
            Reach hundreds of engineering freshers, product builders, and skilled professionals
            looking for opportunities in Vizag. Post 1 role for free or up to 5 with Featured Listing.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 px-4 py-2.5 bg-white text-[#0E4D64] hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-[#0E4D64]" />
          <span>Post Jobs in Founder Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
