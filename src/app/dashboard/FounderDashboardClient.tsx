'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Listing, Job } from '@/types';
import {
  Building,
  Briefcase,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlusCircle,
  Sparkles,
  AlertCircle,
  Eye,
  MousePointerClick,
  ShieldCheck,
  Save,
  Trash2,
} from 'lucide-react';

interface FounderDashboardClientProps {
  listings: Listing[];
  initialJobs: Job[];
}

export function FounderDashboardClient({
  listings,
  initialJobs,
}: FounderDashboardClientProps) {
  // Select active listing to manage (defaults to first listing)
  const [selectedListingId, setSelectedListingId] = useState<string>(
    listings[0]?.id || ''
  );

  const selectedListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  // Active tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'jobs' | 'claim'>('analytics');

  // Jobs state for the selected listing
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const listingJobs = jobs.filter((j) => j.listing_id === selectedListing?.id);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState(selectedListing?.area ? `${selectedListing.area}, Visakhapatnam` : 'Rushikonda, Visakhapatnam');
  const [jobApplyUrl, setJobApplyUrl] = useState('');
  const [jobPostingLoading, setJobPostingLoading] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobSuccess, setJobSuccess] = useState('');

  // Profile Edit State
  const [editDesc, setEditDesc] = useState(selectedListing?.description || '');
  const [editWebsite, setEditWebsite] = useState(selectedListing?.website || '');
  const [editLinkedin, setEditLinkedin] = useState(selectedListing?.linkedin_url || selectedListing?.linkedin || '');
  const [editLogoUrl, setEditLogoUrl] = useState(selectedListing?.logo_url || '');
  const [editAtsUrl, setEditAtsUrl] = useState('');
  const [editTeamSize, setEditTeamSize] = useState(selectedListing?.team_size || '1-10');
  const [editFunding, setEditFunding] = useState(selectedListing?.funding_text || selectedListing?.funding_range || 'Bootstrapped');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Claim Listing State
  const [claimListingId, setClaimListingId] = useState(listings[0]?.id || '');
  const [claimFounderName, setClaimFounderName] = useState('');
  const [claimWorkEmail, setClaimWorkEmail] = useState('');
  const [claimProofUrl, setClaimProofUrl] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Analytics Stats state
  const [analytics, setAnalytics] = useState({ views: 0, clicks: 0 });

  // Update form fields when selected listing changes
  useEffect(() => {
    if (selectedListing) {
      setEditDesc(selectedListing.description || '');
      setEditWebsite(selectedListing.website || '');
      setEditLinkedin(selectedListing.linkedin_url || selectedListing.linkedin || '');
      setEditLogoUrl(selectedListing.logo_url || '');
      setEditTeamSize(selectedListing.team_size || '1-10');
      setEditFunding(selectedListing.funding_text || selectedListing.funding_range || 'Bootstrapped');
      setJobLocation(selectedListing.area ? `${selectedListing.area}, Visakhapatnam` : 'Rushikonda, Visakhapatnam');
    }
  }, [selectedListing]);

  // Fetch real analytics when selected listing changes
  useEffect(() => {
    if (!selectedListing?.id) return;
    async function fetchStats() {
      try {
        const res = await fetch(`/api/analytics?listingId=${selectedListing.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch {
        // Fallback to default
      }
    }
    fetchStats();
  }, [selectedListing?.id]);

  // Handle Post New Job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobError('');
    setJobSuccess('');
    setJobPostingLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          title: jobTitle,
          location: jobLocation,
          applyUrl: jobApplyUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJobError(data.error || 'Failed to post job');
      } else {
        setJobSuccess('Job posted successfully and is now live on the jobs board!');
        setJobs((prev) => [data.job, ...prev]);
        setJobTitle('');
        setJobApplyUrl('');
      }
    } catch {
      setJobError('Network error while posting job');
    } finally {
      setJobPostingLoading(false);
    }
  };

  // Handle Toggle Job Active/Inactive
  const handleToggleJob = async (jobId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, is_active: !currentStatus } : j))
        );
      }
    } catch {
      // Ignore
    }
  };

  // One-click renew job post for 60 days
  const handleRenewJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'renew' }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Job post renewed for an additional 60 days!');
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, is_active: true } : j))
        );
      }
    } catch {
      alert('Failed to renew job');
    }
  };

  // Handle Delete Job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      const res = await fetch(`/api/jobs?jobId=${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch {
      // Ignore
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    if (!selectedListing?.id) return;
    try {
      setProfileSaving(true);
      setProfileSuccess('');
      const res = await fetch('/api/founder/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          description: editDesc,
          website: editWebsite,
          linkedin: editLinkedin,
          logo_url: editLogoUrl,
          team_size: editTeamSize,
          funding_text: editFunding,
          ats_url: editAtsUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess(data.message || 'Profile updated successfully!');
      }
    } catch {
      // Error
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Submit Claim
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitting(true);
    setClaimError('');
    setClaimSuccess(false);

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: claimListingId,
          founderName: claimFounderName,
          workEmail: claimWorkEmail,
          proofUrl: claimProofUrl,
          notes: claimNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.error || 'Failed to submit claim');
      } else {
        setClaimSuccess(true);
        setClaimFounderName('');
        setClaimWorkEmail('');
        setClaimProofUrl('');
        setClaimNotes('');
      }
    } catch {
      setClaimError('Network error while submitting claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const maxAllowedJobs = selectedListing?.is_featured ? 5 : 1;
  const activeJobsCount = listingJobs.filter((j) => j.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Listing Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              Founder Portal
            </span>
            {selectedListing?.is_featured ? (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Featured Listing
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                Free Tier
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedListing?.name || 'Visakhapatnam Organization'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedListing?.area} • {selectedListing?.sector} • {selectedListing?.stage}
          </p>
        </div>

        {/* Switch Organization Selector */}
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-400" />
          <select
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D4] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#0E4D64] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Stats & Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-[#0E4D64] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Open Jobs ({activeJobsCount}/{maxAllowedJobs})</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-[#0E4D64] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('claim')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'claim'
              ? 'bg-[#0E4D64] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Claim Organization</span>
        </button>
      </div>

      {/* TAB 1: Analytics & Overview */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#E6E0D4] shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold">Total Profile Views</span>
                <Eye className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{analytics.views}</div>
              <p className="text-[11px] text-gray-400 mt-1">Visitors viewing your interactive map popup</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#E6E0D4] shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold">Website & Link Clicks</span>
                <MousePointerClick className="w-4 h-4 text-[#0E4D64]" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{analytics.clicks}</div>
              <p className="text-[11px] text-gray-400 mt-1">Direct outbound traffic sent to your domain</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#E6E0D4] shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold">Active Jobs Posted</span>
                <Briefcase className="w-4 h-4 text-[#E04F36]" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">
                {activeJobsCount} / {maxAllowedJobs}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {selectedListing?.is_featured ? 'Featured limit: 5 jobs' : 'Free tier limit: 1 job'}
              </p>
            </div>
          </div>

          {/* Featured Listing Promotion Card */}
          {!selectedListing?.is_featured && (
            <div className="bg-gradient-to-r from-teal-900 to-[#0E4D64] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded mb-2">
                  <Sparkles className="w-3 h-3" /> Upgrade to Featured Listing
                </span>
                <h3 className="text-lg font-bold">Boost Visibility Across Vizag & Post 5 Jobs</h3>
                <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                  Get a highlighted golden ring on the map, top ranking in search results, up to 5 active engineering roles, and detailed analytics.
                </p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Upgrade to Featured (₹999/mo)
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Post New Job Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">Post a New Job in Vizag</h3>
            <p className="text-xs text-gray-500 mb-4">
              Your role will appear instantly in the open jobs board and under your startup profile.
            </p>

            {jobError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jobError}</span>
              </div>
            )}

            {jobSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{jobSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer (Node.js/Go)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location / Work Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="e.g. Rushikonda, Visakhapatnam (Hybrid)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Apply URL or Email *
                </label>
                <input
                  type="url"
                  required
                  value={jobApplyUrl}
                  onChange={(e) => setJobApplyUrl(e.target.value)}
                  placeholder="https://yourcompany.com/careers/job-id or https://linkedin.com/jobs/..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-400">
                  Active jobs: <span className="font-bold text-gray-700">{activeJobsCount}</span> /{' '}
                  <span className="font-bold text-gray-700">{maxAllowedJobs}</span>
                </div>
                <button
                  type="submit"
                  disabled={jobPostingLoading || activeJobsCount >= maxAllowedJobs}
                  className="px-4 py-2 bg-[#0E4D64] hover:bg-[#093345] disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{jobPostingLoading ? 'Publishing...' : 'Publish Job Post'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Jobs List */}
          <div className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Existing Job Posts for {selectedListing?.name}
            </h3>

            {listingJobs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                No active or closed jobs posted yet for this listing.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {listingJobs.map((j) => (
                  <div key={j.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{j.title}</span>
                        {j.is_active ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{j.location}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {j.is_active && (
                        <button
                          onClick={() => handleRenewJob(j.id)}
                          className="text-xs px-2.5 py-1 rounded-md font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="Renew active status for 60 days"
                        >
                          Renew (60d)
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleJob(j.id, j.is_active)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                          j.is_active
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {j.is_active ? 'Close Job' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Edit Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Edit Profile: {selectedListing?.name}
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            Keep your startup details fresh to attract founders, talent, and investors in Visakhapatnam.
          </p>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                One-line Description
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              />
            </div>

            {/* Logo Upload Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company Logo (PNG, SVG, or WebP · Max 500 KB)
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="file"
                  accept=".png,.svg,.webp,.jpg,.jpeg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 512 * 1024) {
                      alert('Logo file size must be 500 KB or less.');
                      return;
                    }
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
                      const data = await res.json();
                      if (data.url) setEditLogoUrl(data.url);
                    } catch {
                      alert('Failed to upload logo.');
                    }
                  }}
                  className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
              </div>
              <input
                type="url"
                placeholder="Or enter logo URL (https://...)"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Upload your own logo or one you have permission to use.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                />
              </div>
            </div>

            {/* ATS Board Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ATS Careers Board Link (Greenhouse, Lever, Ashby)
              </label>
              <input
                type="url"
                placeholder="e.g. jobs.lever.co/company or boards.greenhouse.io/company"
                value={editAtsUrl}
                onChange={(e) => setEditAtsUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                We will automatically sync public jobs every 6 hours and display live openings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Team Size</label>
                <select
                  value={editTeamSize}
                  onChange={(e) => setEditTeamSize(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="1-10">1-10 members</option>
                  <option value="11-50">11-50 members</option>
                  <option value="51-200">51-200 members</option>
                  <option value="201-500">201-500 members</option>
                  <option value="500+">500+ members</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Funding Range</label>
                <select
                  value={editFunding}
                  onChange={(e) => setEditFunding(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Under $500K">Under $500K (₹4 Cr)</option>
                  <option value="$500K - $2M">$500K - $2M (₹4-16 Cr)</option>
                  <option value="$2M - $10M">$2M - $10M</option>
                  <option value="$10M+">$10M+</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="px-4 py-2 bg-[#0E4D64] hover:bg-[#093345] text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Claim an Organization */}
      {activeTab === 'claim' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E6E0D4] shadow-xs max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-gray-900">Claim Your Startup or Campus</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Are you the founder or authorized leadership of an organization on the Vizag Startup Map?
            Verify ownership using your company email domain or LinkedIn profile proof to gain full dashboard editing rights.
          </p>

          {claimSuccess && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Claim submitted for administrative review!</p>
                <p className="mt-0.5 text-emerald-700">
                  Our team checks company email domains and LinkedIn profiles within 24 hours. Once approved, you will receive full ownership access.
                </p>
              </div>
            </div>
          )}

          {claimError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{claimError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Listing to Claim *
              </label>
              <select
                value={claimListingId}
                onChange={(e) => setClaimListingId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.area} - {l.sector})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={claimFounderName}
                  onChange={(e) => setClaimFounderName(e.target.value)}
                  placeholder="e.g. Ramesh Naidu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={claimWorkEmail}
                  onChange={(e) => setClaimWorkEmail(e.target.value)}
                  placeholder="e.g. ramesh@companydomain.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Founder Proof URL (LinkedIn or Press) *
              </label>
              <input
                type="url"
                required
                value={claimProofUrl}
                onChange={(e) => setClaimProofUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                placeholder="e.g. Co-founder based at Rushikonda incubation hub"
                className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E4D64]"
              />
            </div>

            <button
              type="submit"
              disabled={claimSubmitting}
              className="px-5 py-2.5 bg-[#0E4D64] hover:bg-[#093345] disabled:bg-gray-400 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{claimSubmitting ? 'Submitting Claim...' : 'Submit Claim for Verification'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
