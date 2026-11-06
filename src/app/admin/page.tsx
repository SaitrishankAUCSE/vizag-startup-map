'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  X,
  Upload,
  Download,
  ArrowLeft,
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Globe,
  FileText,
  CheckCircle2,
  HelpCircle,
  Copy,
  Layers,
  Filter,
} from 'lucide-react';
import { Listing, Submission, Claim } from '@/types';
import { ImportReport } from '@/app/api/admin/import/route';
import { LeadQueueTab } from '@/components/admin/LeadQueueTab';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'leads' | 'quality' | 'claims' | 'all'>('queue');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  // Pin edit modal state
  const [editingPinListing, setEditingPinListing] = useState<Listing | null>(null);
  const [newLat, setNewLat] = useState<string>('');
  const [newLng, setNewLng] = useState<string>('');

  // Fetch all admin data
  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, listingsRes, claimsRes] = await Promise.all([
        fetch('/api/admin/submissions').catch(() => null),
        fetch('/api/listings?status=all').catch(() => null),
        fetch('/api/claim').catch(() => null),
      ]);

      if (subsRes && subsRes.ok) {
        const subsData = await subsRes.json();
        setSubmissions(subsData.submissions || []);
      }

      if (listingsRes && listingsRes.ok) {
        const listData = await listingsRes.json();
        const list = listData.listings || [];
        setAllListings(list);
        setPendingListings(
          list.filter((l: Listing) => l.status === 'pending' || l.status === 'needs_review')
        );
      }

      if (claimsRes && claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setClaims(claimsData.claims || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bulk approve pending listings that passed checks
  const handleBulkApprove = async () => {
    const validPendingIds = pendingListings
      .filter((l) => l.status === 'pending' && l.lat && l.lng)
      .map((l) => l.id);

    if (validPendingIds.length === 0) {
      setActionMessage('No pending listings ready for bulk approval.');
      return;
    }

    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_approve',
          listingIds: validPendingIds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `Bulk approved ${validPendingIds.length} listings!`);
        await loadData();
      }
    } catch {
      setActionMessage('Failed to run bulk approval.');
    }
  };

  // Moderate listing (approve / reject / duplicate)
  const handleModerateListing = async (
    listingId: string,
    action: 'approve' | 'reject' | 'mark_duplicate'
  ) => {
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, listingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `Listing ${action}ed.`);
        setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
        await loadData();
      }
    } catch {
      setActionMessage(`Failed to ${action} listing.`);
    }
  };

  // Approve verified founder submission
  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || 'Verified submission approved and charted onto map!');
        await loadData();
      } else {
        setActionMessage(data.error || 'Failed to approve submission');
      }
    } catch {
      setActionMessage('Failed to approve submission.');
    }
  };

  // Save new pin coordinates
  const handleSavePin = async () => {
    if (!editingPinListing) return;
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numerical latitude and longitude.');
      return;
    }

    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pin',
          listingId: editingPinListing.id,
          lat,
          lng,
        }),
      });
      if (res.ok) {
        setActionMessage(`Updated pin coordinates for ${editingPinListing.name}!`);
        setEditingPinListing(null);
        await loadData();
      }
    } catch {
      setActionMessage('Failed to update pin.');
    }
  };

  // CSV Import
  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setActionMessage('Parsing, geocoding via Nominatim, and validating CSV...');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.report) {
        setImportReport(data.report);
        setActionMessage(
          `Import finished! Created: ${data.report.created.length}, Skipped: ${data.report.skipped.length}, Failed: ${data.report.failed.length}`
        );
        await loadData();
      } else {
        setActionMessage(data.error || 'Import failed.');
      }
    } catch (err) {
      setActionMessage((err as Error).message || 'Import network request failed.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Quality Audit Filters (Phase 5)
  const qualityListings = allListings.filter((l) => {
    const hasMissingLogo = !l.logo_url;
    const hasMissingPin = !l.lat || !l.lng || (l.lat === 17.72 && l.lng === 83.32);
    const hasDeadWebsite = l.website_status !== null && l.website_status !== 200 && l.website_status !== 301 && l.website_status !== 302;
    const hasNoSources = !l.sources || l.sources.length === 0;
    return hasMissingLogo || hasMissingPin || hasDeadWebsite || hasNoSources;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-gray-200 text-[#0E4D64] hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#0E4D64] text-white">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Ecosystem Admin Panel
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review submissions, CSV imports, geocoded pins, and verify real data
              </p>
            </div>
          </div>

          {/* Quick Actions: Import / Export */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:border-gray-300 text-gray-700 cursor-pointer shadow-2xs transition-colors">
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>{importing ? 'Importing...' : 'Import CSV'}</span>
              <input
                type="file"
                accept=".csv"
                disabled={importing}
                className="hidden"
                onChange={handleCsvFileUpload}
              />
            </label>

            <a
              href="/api/listings/export?plan=admin"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0E4D64] hover:bg-[#093345] text-white shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-teal-700 font-bold ml-2 hover:text-teal-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* CSV Import Report Drawer / Box */}
        {importReport && (
          <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>CSV Import Report ({importReport.totalRows} Total Rows Processed)</span>
              </h3>
              <button
                onClick={() => setImportReport(null)}
                className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
              >
                Close Report
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 bg-green-50 text-green-800 rounded-xl font-bold">
                Created: {importReport.created.length}
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl font-bold">
                Skipped: {importReport.skipped.length}
              </div>
              <div className="p-2.5 bg-red-50 text-red-800 rounded-xl font-bold">
                Failed: {importReport.failed.length}
              </div>
            </div>

            {importReport.skipped.length > 0 && (
              <div className="mt-2 text-xs text-amber-800 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 max-h-36 overflow-y-auto">
                <p className="font-bold mb-1">Skipped Duplicates or Matches:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {importReport.skipped.map((s, idx) => (
                    <li key={idx}>
                      <strong>{s.name}</strong>: {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-[#0E4D64] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {pendingListings.length + submissions.filter((s) => s.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-[#0E4D64] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Lead Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quality'
                ? 'bg-[#0E4D64] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Data Quality Audit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
              {qualityListings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-[#0E4D64] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Founder Claims</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {claims.filter((c) => c.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#0E4D64] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Listings ({allListings.length})</span>
          </button>
        </div>

        {/* ── TAB 1: REVIEW QUEUE (SIDE-BY-SIDE VIEW) ── */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Pending Moderation Queue
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review side-by-side data, verify OpenStreetMap pins, and approve real listings
                </p>
              </div>
              {pendingListings.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Bulk Approve ({pendingListings.filter((l) => l.status === 'pending').length} Ready)
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading queue items...</div>
            ) : pendingListings.length === 0 &&
              submissions.filter((s) => s.status === 'pending').length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No items currently waiting in review queue. Clean state!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* ── Verified Founder Submissions ── */}
                {submissions.filter((s) => s.status === 'pending').map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 flex flex-col lg:flex-row items-start justify-between gap-6 hover:bg-gray-50/50 transition-colors bg-amber-50/20"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-gray-900">{sub.listing_data.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3A0F34] text-[#EAAA00] uppercase">
                          {sub.listing_data.type || 'startup'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {sub.listing_data.area || 'Vizag'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Trust Score: {sub.verification_score || 85}/100
                        </span>
                        {sub.is_email_verified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            ✓ Email OTP Verified
                          </span>
                        )}
                        {sub.domain_matched && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            ✓ Domain Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {sub.listing_data.description || 'No description provided.'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Submitter</span>
                          <span className="font-semibold text-gray-800 truncate block">
                            {sub.founder_name} ({sub.founder_role || 'Founder'})
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Contact Email</span>
                          <span className="font-semibold text-gray-800 truncate block">{sub.contact_email}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Proof Type</span>
                          <span className="font-semibold text-gray-800 truncate block uppercase text-[10px]">
                            {sub.verification_proof_type || 'corporate'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Proof Reference</span>
                          <span className="font-mono text-xs font-bold text-gray-800 truncate block">
                            {sub.verification_proof_value || 'Attached'}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                        {sub.listing_data.website && (
                          <a href={sub.listing_data.website} target="_blank" rel="noopener noreferrer" className="text-[#3A0F34] underline font-bold flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Website
                          </a>
                        )}
                        {sub.founder_linkedin && (
                          <a href={sub.founder_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Submitter LinkedIn
                          </a>
                        )}
                        <span className="text-gray-400">
                          Submitted: {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleApproveSubmission(sub.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#EAAA00] hover:text-[#3A0F34] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* ── Pending Listings from CSV/Leads ── */}
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-5 flex flex-col lg:flex-row items-start justify-between gap-6 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Left: Submitted Data & Sources */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-gray-900">{listing.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0E4D64]/10 text-[#0E4D64] uppercase">
                          {listing.type}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {listing.area}
                        </span>
                        {listing.status === 'needs_review' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Needs Pin Verification
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Pending Approval
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {listing.description || listing.one_liner || 'No description provided.'}
                      </p>

                      {/* Side-by-side metadata row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">
                            Sector
                          </span>
                          <span className="font-semibold text-gray-800">{listing.sector || 'None'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">
                            Stage
                          </span>
                          <span className="font-semibold text-gray-800">{listing.stage || 'None'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">
                            Website Status
                          </span>
                          <span className="font-semibold flex items-center gap-1">
                            {listing.website_status === 200 ||
                            listing.website_status === 301 ||
                            listing.website_status === 302 ? (
                              <span className="text-green-700 font-bold">
                                HTTP {listing.website_status} OK
                              </span>
                            ) : listing.website ? (
                              <span className="text-amber-700 font-bold">
                                {listing.website_status ? `HTTP ${listing.website_status}` : 'Pending Check'}
                              </span>
                            ) : (
                              <span className="text-gray-400">No URL</span>
                            )}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">
                            Primary Source
                          </span>
                          <span className="font-semibold truncate block text-teal-800">
                            {listing.sources?.[0]?.source_type || 'manual_research'}
                          </span>
                        </div>
                      </div>

                      {/* Source URL link */}
                      {listing.sources?.[0]?.source_url && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <span className="font-bold">Source URL:</span>
                          <a
                            href={listing.sources[0].source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0E4D64] underline truncate max-w-sm"
                          >
                            {listing.sources[0].source_url}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Middle: Mini Map Preview with Coordinates */}
                    <div className="w-full lg:w-48 shrink-0 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center space-y-2">
                      <div className="h-20 bg-teal-900/10 rounded-lg flex items-center justify-center relative overflow-hidden border border-teal-900/15">
                        <MapPin className="w-6 h-6 text-teal-800" />
                        <span className="absolute bottom-1 right-1.5 text-[9px] text-gray-500 bg-white/80 px-1 rounded">
                          OSM
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-600">
                        {listing.lat ? `${listing.lat.toFixed(4)}°N, ${listing.lng.toFixed(4)}°E` : 'No Pin'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPinListing(listing);
                          setNewLat(String(listing.lat || 17.72));
                          setNewLng(String(listing.lng || 83.32));
                        }}
                        className="text-[10px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer block mx-auto"
                      >
                        Adjust Pin Drop
                      </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleModerateListing(listing.id, 'approve')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModerateListing(listing.id, 'reject')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModerateListing(listing.id, 'mark_duplicate')}
                        className="flex-1 sm:flex-none text-[11px] text-gray-500 hover:text-gray-800 py-1 font-semibold"
                      >
                        Mark Duplicate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: DATA QUALITY AUDIT (PHASE 5) ── */}
        {activeTab === 'quality' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Data Quality & Integrity Dashboard</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Surfaces listings missing logos, pins, active websites, or traceable sources (Golden Rules #1, #3)
              </p>
            </div>

            {qualityListings.length === 0 ? (
              <div className="p-8 text-center text-xs text-green-700 bg-green-50 rounded-xl font-bold">
                ✓ 100% Data Integrity! All listings have valid pins, sources, logos, and websites.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {qualityListings.map((listing) => {
                  const missingLogo = !listing.logo_url;
                  const missingPin = !listing.lat || !listing.lng || (listing.lat === 17.72 && listing.lng === 83.32);
                  const deadWebsite = listing.website_status !== null && listing.website_status !== 200 && listing.website_status !== 301 && listing.website_status !== 302;
                  const noSources = !listing.sources || listing.sources.length === 0;

                  return (
                    <div key={listing.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{listing.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          {missingLogo && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                              Missing Logo
                            </span>
                          )}
                          {missingPin && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-900">
                              Missing / Default Pin
                            </span>
                          )}
                          {deadWebsite && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-900">
                              Dead Website (HTTP {listing.website_status})
                            </span>
                          )}
                          {noSources && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900">
                              No Traceable Sources
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPinListing(listing);
                          setNewLat(String(listing.lat || 17.72));
                          setNewLng(String(listing.lng || 83.32));
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Fix Pin / Edit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: FOUNDER CLAIMS ── */}
        {activeTab === 'claims' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Founder Ownership Verification Claims
            </h2>

            {claims.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No founder claims submitted yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {claims.map((claim) => (
                  <div key={claim.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {claim.listing_name || 'Listing'} ({claim.work_email})
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Method: {claim.method} · Status: <span className="font-semibold">{claim.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: ALL LISTINGS ── */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              All Database Listings ({allListings.length})
            </h2>
            <div className="divide-y divide-gray-100 text-xs">
              {allListings.map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">{l.name}</span>
                    <span className="text-gray-400 ml-2">({l.area})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'approved'
                          ? 'bg-green-100 text-green-900'
                          : l.status === 'rejected'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {l.status}
                    </span>
                    <Link
                      href={`/startup/${l.slug}`}
                      className="text-[#0E4D64] hover:underline font-semibold"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 1B: LEAD QUEUE ── */}
        {activeTab === 'leads' && <LeadQueueTab />}

        {/* Pin Edit Modal */}
        {editingPinListing && (
          <div className="fixed inset-0 z-[1500] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">
                Adjust Map Pin: {editingPinListing.name}
              </h3>
              <p className="text-xs text-gray-500">
                Enter precise latitude and longitude for this company. Coordinates will be updated immediately.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="flex-1 bg-[#0E4D64] hover:bg-[#093345] text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Save Pin
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPinListing(null)}
                  className="px-4 border border-gray-300 text-gray-700 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
