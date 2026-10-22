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
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Listing, Submission, Claim } from '@/types';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsRes] = await Promise.all([
          fetch('/api/listings/export').catch(() => null),
        ]);
        // Also fetch initial mock listings for admin table
        const { INITIAL_MOCK_LISTINGS } = await import('@/data/mockData');
        setListings(INITIAL_MOCK_LISTINGS);

        // Fetch submissions from API route
        const subsRes = await fetch('/api/admin/submissions');
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setSubmissions(subsData.submissions || []);
        }

        // Fetch founder claims from API route
        const claimsRes = await fetch('/api/claim');
        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData.claims || []);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApproveClaim = async (claimId: string) => {
    try {
      const res = await fetch('/api/claim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      });
      if (res.ok) {
        setActionMessage('Founder claim approved and ownership verified!');
        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? { ...c, status: 'approved' } : c))
        );
      }
    } catch {
      setActionMessage('Failed to approve founder claim.');
    }
  };

  const handleModeration = async (submissionId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `Submission ${action}ed`);
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId
              ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' }
              : s
          )
        );
      }
    } catch {
      setActionMessage('Failed to moderate submission.');
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim() !== '');
      setActionMessage(`Successfully parsed CSV with ${lines.length - 1} records!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Title */}
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
                Review community startup submissions, manage listings, and sync datasets
              </p>
            </div>
          </div>

          {/* Quick Actions: Import / Export */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:border-gray-300 text-gray-700 cursor-pointer shadow-2xs transition-colors">
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvImport}
              />
            </label>

            <a
              href="/api/listings/export"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0E4D64] hover:bg-[#093345] text-white shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Action feedback */}
        {actionMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-xl flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-teal-700 font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* 1. Pending Submissions Queue */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Pending Submissions Queue
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                {submissions.filter((s) => s.status === 'pending').length} pending
              </span>
            </div>
          </div>

          {submissions.filter((s) => s.status === 'pending').length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No submissions currently waiting for review. All clear!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              {submissions
                .filter((s) => s.status === 'pending')
                .map((sub) => (
                  <div key={sub.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {sub.listing_data.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 capitalize">
                          {sub.listing_data.type}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {sub.listing_data.area}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 max-w-xl">
                        {sub.listing_data.description}
                      </p>
                      <div className="text-[11px] text-gray-400 flex items-center gap-3 pt-1">
                        <span>Founder: {sub.founder_name}</span>
                        <span>•</span>
                        <span>Email: {sub.contact_email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleModeration(sub.id, 'approve')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleModeration(sub.id, 'reject')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 2. Founder Claims Queue */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Founder Ownership Claims Queue
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-900">
                {claims.filter((c) => c.status === 'pending').length} pending
              </span>
            </div>
          </div>

          {claims.filter((c) => c.status === 'pending').length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No pending founder claims. All claimed listings are verified!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              {claims
                .filter((c) => c.status === 'pending')
                .map((claim) => (
                  <div key={claim.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {claim.listing_name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Verification Requested
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-3">
                        <span>Founder: <strong>{claim.founder_name}</strong></span>
                        <span>•</span>
                        <span>Work Email: <strong>{claim.work_email}</strong></span>
                      </div>
                      {claim.notes && (
                        <p className="text-[11px] text-gray-500 italic">
                          &ldquo;{claim.notes}&rdquo;
                        </p>
                      )}
                      <div className="pt-1">
                        <a
                          href={claim.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#0E4D64] hover:underline font-medium"
                        >
                          <span>Review LinkedIn / Proof Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0E4D64] hover:bg-[#093345] text-white shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Claim</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 3. All Directory Listings Table */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0E4D64]" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                All Listings Directory ({listings.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-100 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Entity Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 capitalize">{item.type}</td>
                    <td className="py-3 px-4">{item.sector}</td>
                    <td className="py-3 px-4">{item.area}</td>
                    <td className="py-3 px-4">{item.stage}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.is_featured ? (
                        <span className="flex items-center gap-1 text-amber-700 font-semibold text-[10px]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/startup/${item.slug}`}
                        className="inline-flex items-center gap-1 text-[#0E4D64] hover:underline font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
