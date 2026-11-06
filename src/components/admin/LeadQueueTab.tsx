'use client';

import React, { useState, useEffect } from 'react';
import { Listing, Area } from '@/types';
import { detectAtsFromUrl } from '@/lib/ats/detect';
import {
  Globe,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Check,
  Search,
  RefreshCw,
  Building2,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const AREAS: Area[] = [
  'Rushikonda',
  'Madhurawada',
  'Siripuram',
  'MVP Colony',
  'Dwaraka Nagar',
  'Seethammadhara',
  'Beach Road',
  'Gajuwaka',
  'Pendurthi',
  'Other',
];

interface WebsiteCheckResult {
  ok: boolean;
  status: number;
  statusText: string;
  latencyMs: number;
  robotsAllowed: boolean;
  message: string;
}

export function LeadQueueTab() {
  const [leads, setLeads] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Form edit state for selected lead
  const [website, setWebsite] = useState('');
  const [careersUrl, setCareersUrl] = useState('');
  const [atsProvider, setAtsProvider] = useState<string>('');
  const [atsBoardSlug, setAtsBoardSlug] = useState('');
  const [area, setArea] = useState<string>('Other');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState('');

  // Website verification state
  const [checkingWebsite, setCheckingWebsite] = useState(false);
  const [websiteCheckResult, setWebsiteCheckResult] = useState<WebsiteCheckResult | null>(null);

  // Processing state
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        const items = data.leads || [];
        setLeads(items);
        if (items.length > 0 && !selectedLeadId) {
          selectLead(items[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const selectLead = (lead: Listing) => {
    setSelectedLeadId(lead.id);
    setWebsite(lead.website || '');
    setCareersUrl(lead.careers_url || '');
    setAtsProvider(lead.ats_provider || '');
    setAtsBoardSlug(lead.ats_board_slug || '');
    setArea(lead.area || 'Other');
    setAddress(lead.address || '');
    setLat(lead.lat && lead.lat !== 0 ? lead.lat.toString() : '');
    setLng(lead.lng && lead.lng !== 0 ? lead.lng.toString() : '');
    setLogoUrl(lead.logo_url || '');
    setWebsiteCheckResult(null);
    setActionFeedback(null);
  };

  // Auto-detect ATS when careersUrl changes
  const handleCareersUrlChange = (val: string) => {
    setCareersUrl(val);
    const detected = detectAtsFromUrl(val);
    if (detected.provider) {
      setAtsProvider(detected.provider);
      setAtsBoardSlug(detected.boardSlug || '');
    }
  };

  // Check website reachability (8s timeout + robots.txt)
  const handleCheckWebsite = async () => {
    if (!website.trim()) {
      setActionFeedback({ type: 'error', message: 'Enter a website URL first.' });
      return;
    }

    try {
      setCheckingWebsite(true);
      setWebsiteCheckResult(null);
      const res = await fetch('/api/admin/leads/check-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website.trim() }),
      });
      const data = await res.json();
      setWebsiteCheckResult(data);
    } catch (err: any) {
      setWebsiteCheckResult({
        ok: false,
        status: 0,
        statusText: 'Check Failed',
        latencyMs: 0,
        robotsAllowed: true,
        message: err.message || 'Network error while checking website',
      });
    } finally {
      setCheckingWebsite(false);
    }
  };

  // Quick geocoding via Nominatim
  const handleQuickGeocode = async () => {
    const query = [address, area, 'Visakhapatnam', 'Andhra Pradesh'].filter(Boolean).join(', ');
    try {
      setGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'VizagStartupMapLeadAdmin/1.0' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        setLat(parseFloat(data[0].lat).toFixed(6));
        setLng(parseFloat(data[0].lon).toFixed(6));
        setActionFeedback({ type: 'success', message: `Geocoded pin found: (${data[0].lat}, ${data[0].lon})` });
      } else {
        setActionFeedback({ type: 'error', message: 'No coordinates found. Enter lat/lng manually or choose an area center.' });
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Geocoding request failed. Enter lat/lng manually.' });
    } finally {
      setGeocoding(false);
    }
  };

  // Save changes to lead
  const handleSaveDraft = async () => {
    if (!selectedLeadId) return;

    try {
      const res = await fetch(`/api/admin/leads/${selectedLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: website.trim() || null,
          careers_url: careersUrl.trim() || null,
          ats_provider: atsProvider || null,
          ats_board_slug: atsBoardSlug.trim() || null,
          area,
          address: address.trim() || null,
          lat: lat ? parseFloat(lat) : 0,
          lng: lng ? parseFloat(lng) : 0,
          logo_url: logoUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'Draft updates saved successfully.' });
        loadLeads();
      } else {
        const err = await res.json();
        setActionFeedback({ type: 'error', message: err.error || 'Failed to save updates.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Save error.' });
    }
  };

  // Approve lead
  const handleApprove = async () => {
    if (!selectedLeadId) return;

    // Golden rule validation checks:
    // 1. Website responds / is entered
    if (!website.trim()) {
      setActionFeedback({ type: 'error', message: 'A valid official website is required before approval.' });
      return;
    }
    // 2. Map pin exists
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!parsedLat || !parsedLng || (parsedLat === 0 && parsedLng === 0)) {
      setActionFeedback({ type: 'error', message: 'A valid map pin location (lat & lng) is required before approval.' });
      return;
    }

    try {
      setApproving(true);
      const res = await fetch(`/api/admin/leads/${selectedLeadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          leadData: {
            website: website.trim(),
            careers_url: careersUrl.trim() || null,
            ats_provider: (atsProvider as any) || null,
            ats_board_slug: atsBoardSlug.trim() || null,
            area,
            address: address.trim() || null,
            lat: parsedLat,
            lng: parsedLng,
            logo_url: logoUrl.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionFeedback({
          type: 'success',
          message: 'Lead approved! Moved to active map directory with "Verified on [date]" badge.',
        });
        // Remove from list
        setLeads((prev) => prev.filter((l) => l.id !== selectedLeadId));
        setSelectedLeadId(null);
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Approval failed.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Approval request failed.' });
    } finally {
      setApproving(false);
    }
  };

  // Delete lead (e.g. closed or not in Vizag)
  const handleDelete = async () => {
    if (!selectedLeadId) return;
    if (!confirm('Are you sure you want to permanently delete this lead? (Use this if company is confirmed closed or not in Visakhapatnam)')) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/leads/${selectedLeadId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'Lead deleted from queue.' });
        setLeads((prev) => prev.filter((l) => l.id !== selectedLeadId));
        setSelectedLeadId(null);
      } else {
        const err = await res.json();
        setActionFeedback({ type: 'error', message: err.error || 'Failed to delete lead.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Delete error.' });
    } finally {
      setDeleting(false);
    }
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.sector && l.sector.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.source_name && l.source_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canApprove =
    Boolean(website.trim()) &&
    Boolean(parseFloat(lat)) &&
    Boolean(parseFloat(lng)) &&
    (selectedLead?.source_name || selectedLead?.source_url || (selectedLead?.sources && selectedLead.sources.length > 0));

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0E4D64] text-white">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-gray-900">
              Lead Verification Queue ({leads.length} Pending Leads)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Imported from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">/data/vizag-startup-leads.csv</code>.
            Leads <strong>never appear on the public map or in counts</strong> until fully verified, pin dropped, and approved here.
          </p>
        </div>
        <button
          onClick={loadLeads}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionFeedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            actionFeedback.type === 'success'
              ? 'bg-green-50 text-green-900 border-green-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Main 2-Column Split: Leads List vs Edit & Verify Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-[750px]">
          <div className="p-3 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, sector or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const hasWebsite = Boolean(lead.website);
              const hasPin = Boolean(lead.lat && lead.lng && lead.lat !== 0);

              return (
                <button
                  key={lead.id}
                  onClick={() => selectLead(lead)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-l-[#0E4D64]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-[#0E4D64] shrink-0">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{lead.name}</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-md">
                        Lead
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {lead.sector || 'Startup'} · {lead.area || 'Visakhapatnam'}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                      <span className={`flex items-center gap-0.5 ${hasWebsite ? 'text-green-600 font-semibold' : ''}`}>
                        <Globe className="w-3 h-3" />
                        {hasWebsite ? 'Site set' : 'No site'}
                      </span>
                      <span>·</span>
                      <span className={`flex items-center gap-0.5 ${hasPin ? 'text-green-600 font-semibold' : ''}`}>
                        <MapPin className="w-3 h-3" />
                        {hasPin ? 'Pin ready' : 'No pin'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredLeads.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">
                {leads.length === 0 ? 'No pending leads in queue.' : 'No leads match your search.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Form & Review Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
          {selectedLead ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{selectedLead.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      STATUS: LEAD
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sector: <strong>{selectedLead.sector || 'Startup'}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Lead</span>
                </button>
              </div>

              {/* Source Provenance Box (Golden Rule #3) */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  <span>Traceable Lead Provenance</span>
                </div>
                <div className="text-gray-600 space-y-1 pl-5">
                  {selectedLead.source_name && (
                    <p>
                      <strong>Source:</strong> {selectedLead.source_name}
                    </p>
                  )}
                  {selectedLead.source_url && (
                    <p className="flex items-center gap-1">
                      <strong>URL:</strong>
                      <a
                        href={selectedLead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline flex items-center gap-0.5 truncate max-w-sm"
                      >
                        <span className="truncate">{selectedLead.source_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </p>
                  )}
                  {selectedLead.source_note && (
                    <p className="text-gray-500 italic">
                      <strong>Note:</strong> {selectedLead.source_note}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* 1. Official Website + Check Website Button */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Official Website <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="url"
                        placeholder="https://company.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCheckWebsite}
                      disabled={checkingWebsite || !website.trim()}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#0E4D64] hover:bg-[#093345] text-white disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingWebsite ? 'animate-spin' : ''}`} />
                      <span>{checkingWebsite ? 'Checking (8s)...' : 'Check website'}</span>
                    </button>
                  </div>

                  {/* Website Check Result Alert */}
                  {websiteCheckResult && (
                    <div
                      className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
                        websiteCheckResult.ok
                          ? 'bg-green-50 text-green-900 border-green-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {websiteCheckResult.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold flex items-center gap-2">
                          <span>Status: HTTP {websiteCheckResult.status || 'Error'}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/70">
                            {websiteCheckResult.latencyMs}ms
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/70">
                            {websiteCheckResult.robotsAllowed ? 'robots.txt: OK' : 'robots.txt: Disallow'}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90">{websiteCheckResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Careers URL & Auto-detected ATS */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Careers URL (or ATS Board Link)
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://jobs.lever.co/company or https://company.com/careers"
                      value={careersUrl}
                      onChange={(e) => handleCareersUrlChange(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    If this is a Lever, Greenhouse, or Ashby URL, provider and board slug auto-fill below for automatic job sync.
                  </p>
                </div>

                {/* ATS Provider & Board Slug */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      ATS Provider
                    </label>
                    <select
                      value={atsProvider}
                      onChange={(e) => setAtsProvider(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option value="">None / Custom Careers Page</option>
                      <option value="greenhouse">Greenhouse</option>
                      <option value="lever">Lever</option>
                      <option value="ashby">Ashby</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      ATS Board Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. acme or acme-inc"
                      value={atsBoardSlug}
                      onChange={(e) => setAtsBoardSlug(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* 3. Area & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Area in Visakhapatnam <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0E4D64]"
                    >
                      {AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hill 2, IT SEZ, Rushikonda"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                    />
                  </div>
                </div>

                {/* 4. Map Pin Coordinates */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Map Pin Coordinates <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickGeocode}
                      disabled={geocoding}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{geocoding ? 'Finding Pin...' : 'Auto-Geocode Address'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude (e.g. 17.7812)"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude (e.g. 83.3854)"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Logo URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://... logo.png or .svg"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0E4D64]"
                  />
                </div>
              </div>

              {/* Action Buttons: Save Draft vs Approve */}
              <div className="border-t border-gray-100 pt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Save Draft Changes
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving || !canApprove}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E4D64] hover:bg-[#093345] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                    <span>{approving ? 'Approving Lead...' : 'Approve & Publish to Map'}</span>
                  </button>
                </div>
              </div>

              {!canApprove && (
                <p className="text-[11px] text-amber-700 text-right">
                  ⚠️ To approve: official website, valid pin coordinates, and at least one source are required.
                </p>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-gray-400 space-y-2">
              <Building2 className="w-12 h-12 mx-auto opacity-30 text-gray-400" />
              <p className="font-bold text-sm">Select a lead from the list on the left to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
