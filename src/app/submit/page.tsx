'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  ShieldCheck,
  Globe,
  KeyRound,
  RefreshCw,
  Lock,
  Sparkles,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { LISTING_TYPES, AREAS, STAGES, SECTORS } from '@/config/constants';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker').then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 w-full rounded-2xl bg-[#3A0F34]/5 border border-[#3A0F34]/20 flex items-center justify-center text-xs text-[#3A0F34]/60">
        Loading location picker...
      </div>
    ),
  }
);

const PROOF_TYPES = [
  { id: 'dpiit', label: 'DPIIT / Startup India Recognition', placeholder: 'e.g. DIPP12345 or DIPP-98765', hint: 'Government of India Startup recognition certificate' },
  { id: 'cin', label: 'Corporate CIN / ROC (MCA)', placeholder: 'e.g. U72900AP2020PTC115432', hint: '21-digit Corporate Identification Number from ROC' },
  { id: 'gstin', label: 'Andhra Pradesh GSTIN', placeholder: 'e.g. 37AAAAA0000A1Z5', hint: '15-digit GSTIN registered in AP (starts with 37)' },
  { id: 'incubator', label: 'Vizag Incubator / Campus Backing', placeholder: 'e.g. a-Hub AU, GITAM VDC, AMTZ BioValley, STPI', hint: 'Incubated at a recognized Visakhapatnam center' },
  { id: 'media', label: 'Public Press / Directory Profile', placeholder: 'e.g. YourStory, Inc42, Crunchbase profile link', hint: 'Verifiable media feature or venture directory URL' },
] as const;

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'startup',
    description: '',
    sector: 'SaaS',
    stage: 'Seed',
    area: 'Rushikonda',
    address: '',
    pincode: '530045',
    lat: 17.7835,
    lng: 83.385,
    website: '',
    linkedin: '',
    logo_url: '',
    careers_url: '',
    ats_url: '',
    founder_name: '',
    founder_role: 'Founder',
    founder_linkedin: '',
    contact_email: '',
    verification_proof_type: 'dpiit' as 'dpiit' | 'cin' | 'gstin' | 'incubator' | 'media',
    verification_proof_value: '',
    hp_website_confirm: '',
  });

  // Website verification state
  const [checkingWebsite, setCheckingWebsite] = useState(false);
  const [websiteStatus, setWebsiteStatus] = useState<{ ok: boolean; status?: number; latency?: number; error?: string } | null>(null);

  // Email OTP verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Form states
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute live verification trust score
  const verificationScore = useMemo(() => {
    let score = 0;
    if (emailVerified) score += 30;
    if (websiteStatus?.ok) score += 20;
    if (formData.verification_proof_value.trim().length >= 4) score += 25;
    if (formData.founder_linkedin.includes('linkedin.com')) score += 10;
    // Check domain match
    try {
      if (formData.website && formData.contact_email) {
        const siteHost = new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`).hostname.replace(/^www\./i, '').toLowerCase();
        const emailDomain = formData.contact_email.split('@')[1]?.toLowerCase().trim();
        if (emailDomain && (emailDomain === siteHost || siteHost.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${siteHost}`))) {
          score += 15;
        }
      }
    } catch {}
    return Math.min(100, score);
  }, [emailVerified, websiteStatus, formData.verification_proof_value, formData.founder_linkedin, formData.website, formData.contact_email]);

  // Check if contact email domain matches company website
  const isDomainMatch = useMemo(() => {
    try {
      if (!formData.website || !formData.contact_email) return false;
      const siteHost = new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`).hostname.replace(/^www\./i, '').toLowerCase();
      const emailDomain = formData.contact_email.split('@')[1]?.toLowerCase().trim();
      return !!(emailDomain && (emailDomain === siteHost || siteHost.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${siteHost}`)));
    } catch {
      return false;
    }
  }, [formData.website, formData.contact_email]);

  // Live website verification
  const handleVerifyWebsite = async () => {
    if (!formData.website.trim()) {
      setError('Please enter a website URL first.');
      return;
    }
    try {
      setCheckingWebsite(true);
      setError(null);
      const res = await fetch('/api/submit/verify-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.website }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebsiteStatus({ ok: true, status: data.status, latency: data.latency_ms });
      } else {
        setWebsiteStatus({ ok: false, error: data.error || 'Website unreachable' });
      }
    } catch (err: any) {
      setWebsiteStatus({ ok: false, error: err.message || 'Verification failed' });
    } finally {
      setCheckingWebsite(false);
    }
  };

  // Send Email OTP
  const handleSendOtp = async () => {
    if (!formData.contact_email || !formData.contact_email.includes('@')) {
      setError('Please enter a valid official contact email.');
      return;
    }
    try {
      setSendingOtp(true);
      setError(null);
      setOtpMessage(null);
      const res = await fetch('/api/submit/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.contact_email,
          startupName: formData.name || 'your startup',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');

      setOtpSent(true);
      setOtpMessage(data.message);
      if (data.dev_code) {
        setDevOtpCode(data.dev_code);
        setOtpCode(data.dev_code); // Pre-fill in local development for convenience
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    try {
      setVerifyingOtp(true);
      setError(null);
      const res = await fetch('/api/submit/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.contact_email,
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      setEmailVerified(true);
      setEmailToken(data.token);
      setOtpMessage('✓ Email address verified successfully!');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      setError('Logo file size must be 500 KB or less.');
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo');
      setFormData((prev) => ({ ...prev, logo_url: data.url }));
      setLogoUploadSuccess(true);
    } catch (err) {
      setError((err as Error).message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailVerified || !emailToken) {
      setError('Please verify your email address using the 6-digit code before submitting.');
      return;
    }

    if (!formData.verification_proof_value.trim()) {
      setError('Please provide corporate or incubator verification proof for your startup.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email_verification_token: emailToken,
          website_verified: !!websiteStatus?.ok,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission verification failed.');
      }

      setSubmissionResult(data);
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Submission could not be completed. Please review required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-4xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 space-y-6">
          {submitted ? (
            <div className="bg-[#DDE3E8] rounded-3xl border-2 border-[#EAAA00] p-8 sm:p-12 text-center space-y-5 shadow-xl animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#3A0F34] text-[#EAAA00] border-2 border-[#EAAA00] flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#EAAA00]/20 border border-[#EAAA00] text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]">
                Verified Submission Logged
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#3A0F34]">
                Startup Verified & Submitted!
              </h1>
              <p className="text-sm text-[#3A0F34]/80 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.founder_name}</strong>. Your organization <strong>{formData.name}</strong> was submitted with verified credentials.
              </p>

              {/* Trust scorecard */}
              <div className="max-w-xs mx-auto bg-[#3A0F34] text-[#DDE3E8] p-4 rounded-2xl space-y-2 text-left shadow-inner">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>Trust & Verification Score</span>
                  <span className="font-mono text-[#EAAA00] font-bold text-sm">
                    {submissionResult?.verification_score || verificationScore}/100
                  </span>
                </div>
                <div className="w-full bg-[#DDE3E8]/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#EAAA00] h-full rounded-full transition-all duration-500"
                    style={{ width: `${submissionResult?.verification_score || verificationScore}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#DDE3E8]/70 pt-1">
                  ✓ Email identity verified • ✓ Proof recorded • Fast-track moderation queue
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors uppercase tracking-wider shadow-sm"
                >
                  Return to Map
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmailVerified(false);
                    setEmailToken(null);
                    setOtpSent(false);
                    setFormData((prev) => ({ ...prev, name: '', description: '', website: '' }));
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-[#3A0F34] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#DDE3E8] rounded-3xl border border-[#3A0F34]/25 p-6 sm:p-10 shadow-lg space-y-6">
              {/* Header */}
              <div className="pb-6 border-b border-[#3A0F34]/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#3A0F34] text-[10px] font-bold uppercase tracking-[0.2em] text-[#EAAA00] mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    VERIFIED STARTUP ONBOARDING
                  </div>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] uppercase tracking-tight">
                    Submit & Verify Your Startup
                  </h1>
                  <p className="text-xs sm:text-sm text-[#3A0F34]/75 mt-1.5 max-w-xl leading-relaxed">
                    Zero fake listings allowed. All companies must provide verifiable corporate proof and submitters must authenticate their email identity via OTP.
                  </p>
                </div>

                {/* Trust Score meter */}
                <div className="shrink-0 bg-[#3A0F34]/8 border border-[#3A0F34]/15 rounded-2xl p-3.5 min-w-[210px] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#3A0F34]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
                      Trust Score
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[#3A0F34]">
                      {verificationScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-[#3A0F34]/15 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        verificationScore >= 60 ? 'bg-[#10B981]' : 'bg-[#EAAA00]'
                      }`}
                      style={{ width: `${Math.max(5, verificationScore)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-medium text-[#3A0F34]/70">
                    {verificationScore >= 60 ? '✓ Ready for verified review' : 'Min 60 pts required to submit'}
                  </div>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-4 rounded-xl border-2 border-[#3A0F34] bg-[#3A0F34]/10 text-[#3A0F34] text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#EAAA00]" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="hp_website_confirm"
                    tabIndex={-1}
                    value={formData.hp_website_confirm}
                    onChange={(e) => setFormData({ ...formData, hp_website_confirm: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                {/* ── SECTION 1: STARTUP AUTHENTICITY & PROOF ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#3A0F34]/15">
                    <Building2 className="w-4 h-4 text-[#EAAA00]" />
                    <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#3A0F34]">
                      1. Startup Authenticity & Verification Proof
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AquaExchange"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Entity Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        {LISTING_TYPES.filter((t) => t.id !== 'all').map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Website with Live Verification Button */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                      Official Live Website URL * (Verified in Real-Time)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Globe className="w-3.5 h-3.5 text-[#3A0F34]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          required
                          placeholder="https://aquaexchange.com"
                          value={formData.website}
                          onChange={(e) => {
                            setFormData({ ...formData, website: e.target.value });
                            setWebsiteStatus(null);
                          }}
                          className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyWebsite}
                        disabled={checkingWebsite || !formData.website}
                        className="shrink-0 px-4 py-2.5 rounded-xl bg-[#3A0F34] text-[#EAAA00] hover:bg-[#EAAA00] hover:text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {checkingWebsite ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>{checkingWebsite ? 'Checking...' : 'Verify Website'}</span>
                      </button>
                    </div>

                    {/* Live Website Status feedback */}
                    {websiteStatus && (
                      <div className="mt-2">
                        {websiteStatus.ok ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Domain verified live: HTTP {websiteStatus.status} OK ({websiteStatus.latency}ms)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{websiteStatus.error}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Startup Verification Proof */}
                  <div className="p-4 bg-[#3A0F34]/5 border border-[#3A0F34]/20 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1">
                        Official Verification Proof Type *
                      </label>
                      <p className="text-[11px] text-[#3A0F34]/70 mb-2">
                        To guarantee no fake startups are added, you must provide at least one valid official registration or ecosystem backing reference.
                      </p>
                      <select
                        value={formData.verification_proof_type}
                        onChange={(e) => setFormData({ ...formData, verification_proof_type: e.target.value as any })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        {PROOF_TYPES.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Proof ID / Certificate Number / Link *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={PROOF_TYPES.find((p) => p.id === formData.verification_proof_type)?.placeholder}
                        value={formData.verification_proof_value}
                        onChange={(e) => setFormData({ ...formData, verification_proof_value: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                      <span className="text-[10px] text-[#3A0F34]/65 block mt-1">
                        {PROOF_TYPES.find((p) => p.id === formData.verification_proof_type)?.hint}
                      </span>
                    </div>
                  </div>

                  {/* Pitch Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                      One-line Pitch * (max 240 chars)
                    </label>
                    <textarea
                      required
                      maxLength={240}
                      rows={2}
                      placeholder="Empowering coastal aqua farmers with automated aeration, real-time power monitoring IoT devices, and credit."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                    />
                  </div>

                  {/* Sector, Stage, Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Sector *
                      </label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Stage *
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        {STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Neighborhood (Vizag) *
                      </label>
                      <select
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        {AREAS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address & Vizag Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Visakhapatnam Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hill No. 2, Rushikonda IT SEZ"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="530045"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>
                  </div>

                  {/* Map Pin Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                      Coordinates on Vizag Map *
                    </label>
                    <p className="text-[11px] text-[#3A0F34]/65 mb-2">
                      Click anywhere in Visakhapatnam to set marker: {formData.lat.toFixed(4)}° N, {formData.lng.toFixed(4)}° E
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-[#3A0F34]/30 shadow-xs">
                      <LocationPicker
                        lat={formData.lat}
                        lng={formData.lng}
                        onChange={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: SUBMITTER IDENTITY VERIFICATION (OTP) ── */}
                <div className="space-y-4 pt-4 border-t border-[#3A0F34]/15">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#3A0F34]/15">
                    <KeyRound className="w-4 h-4 text-[#EAAA00]" />
                    <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#3A0F34]">
                      2. Submitter Identity Verification (Mandatory)
                    </h3>
                  </div>

                  <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
                    You must verify that you are a real authorized individual associated with this startup. A 6-digit confirmation code will be sent to your email.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pavan Kosaraju"
                        value={formData.founder_name}
                        onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Your Role in the Organization *
                      </label>
                      <select
                        value={formData.founder_role}
                        onChange={(e) => setFormData({ ...formData, founder_role: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-bold cursor-pointer"
                      >
                        <option value="Founder">Founder / Co-Founder</option>
                        <option value="CEO">Chief Executive Officer (CEO)</option>
                        <option value="CTO">Chief Technology Officer (CTO)</option>
                        <option value="Executive">Executive / Director</option>
                        <option value="Core Team">Core Team Member</option>
                        <option value="Incubator Lead">Incubator / Campus Lead</option>
                      </select>
                    </div>
                  </div>

                  {/* Submitter LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                      Submitter Personal LinkedIn Profile URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.founder_linkedin}
                      onChange={(e) => setFormData({ ...formData, founder_linkedin: e.target.value })}
                      className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                    />
                    <span className="text-[10px] text-[#3A0F34]/65 block mt-1">
                      Used by our moderators to authenticate submitter identity against the company.
                    </span>
                  </div>

                  {/* Submitter Email & OTP Box */}
                  <div className="p-4 bg-[#3A0F34]/5 border-2 border-[#3A0F34]/20 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34]">
                      Official Contact Email & Live Verification *
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        required
                        disabled={emailVerified}
                        placeholder="founder@aquaexchange.com or your official email"
                        value={formData.contact_email}
                        onChange={(e) => {
                          setFormData({ ...formData, contact_email: e.target.value });
                          setEmailVerified(false);
                          setEmailToken(null);
                          setOtpSent(false);
                        }}
                        className={`w-full bg-[#DDE3E8] border rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium focus:border-[#3A0F34] ${
                          emailVerified ? 'border-emerald-600 bg-emerald-500/10' : 'border-[#3A0F34]/30'
                        }`}
                      />
                      {!emailVerified ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !formData.contact_email}
                          className="shrink-0 px-4 py-2.5 rounded-xl bg-[#3A0F34] text-[#EAAA00] hover:bg-[#EAAA00] hover:text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {sendingOtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{otpSent ? 'Resend Code' : 'Send Code'}</span>
                        </button>
                      ) : (
                        <div className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Domain match badge */}
                    {isDomainMatch && (
                      <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Corporate domain match detected ({formData.contact_email.split('@')[1]}) • +15 Trust Points</span>
                      </div>
                    )}

                    {/* Developer Mock Banner for Localhost / Demo */}
                    {devOtpCode && !emailVerified && (
                      <div className="p-3 bg-[#EAAA00]/20 border border-[#EAAA00] rounded-xl text-xs text-[#3A0F34] space-y-1">
                        <div className="font-extrabold uppercase tracking-wide flex items-center gap-1 text-[11px]">
                          <span>⚡ Test Environment Code:</span>
                          <span className="font-mono bg-[#3A0F34] text-[#EAAA00] px-2 py-0.5 rounded text-sm tracking-widest font-bold">
                            {devOtpCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#3A0F34]/80">
                          (In production this code is delivered directly to your inbox via Resend email service).
                        </p>
                      </div>
                    )}

                    {/* 6-Digit OTP Input Box */}
                    {otpSent && !emailVerified && (
                      <div className="pt-2 border-t border-[#3A0F34]/15 space-y-2 animate-in fade-in">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]">
                          Enter 6-Digit Verification Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-44 bg-[#DDE3E8] border border-[#3A0F34]/40 rounded-xl px-4 py-2 text-center text-base tracking-[0.25em] font-mono font-bold text-[#3A0F34]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpCode.length !== 6}
                            className="px-5 py-2 rounded-xl bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      </div>
                    )}

                    {otpMessage && (
                      <p className="text-[11px] font-semibold text-[#3A0F34]/80 mt-1">
                        {otpMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── SECTION 3: OPTIONAL ENHANCEMENTS (LOGO & ATS) ── */}
                <div className="space-y-4 pt-4 border-t border-[#3A0F34]/15">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#3A0F34]/15">
                    <Globe className="w-4 h-4 text-[#EAAA00]" />
                    <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#3A0F34]">
                      3. Company Branding & Hiring (Optional)
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34]">
                      Company Logo (PNG, SVG, or WebP · Max 500 KB)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept=".png,.svg,.webp,.jpg,.jpeg"
                        onChange={handleLogoFileChange}
                        disabled={uploadingLogo}
                        className="text-xs text-[#3A0F34] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#3A0F34] file:text-[#DDE3E8] hover:file:bg-[#EAAA00] hover:file:text-[#3A0F34] cursor-pointer"
                      />
                      {uploadingLogo && (
                        <span className="text-xs text-[#3A0F34] font-bold self-center animate-pulse">
                          Uploading logo...
                        </span>
                      )}
                      {logoUploadSuccess && (
                        <span className="text-xs text-emerald-800 font-bold self-center">
                          ✓ Logo uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Careers Page URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://aquaexchange.com/careers"
                        value={formData.careers_url}
                        onChange={(e) => setFormData({ ...formData, careers_url: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3A0F34] mb-1.5">
                        Company LinkedIn URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/aquaexchange"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full bg-[#DDE3E8] border border-[#3A0F34]/30 rounded-xl px-4 py-2.5 text-xs text-[#3A0F34] font-medium placeholder:text-[#3A0F34]/40 focus:border-[#3A0F34]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 border-t border-[#3A0F34]/15 space-y-3">
                  <button
                    type="submit"
                    disabled={loading || !emailVerified}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-display font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                      emailVerified
                        ? 'bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] hover:scale-105 active:scale-95'
                        : 'bg-[#3A0F34]/30 text-[#3A0F34]/60 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Submitting to Verified Queue...' : 'Submit Verified Startup →'}</span>
                  </button>

                  {!emailVerified && (
                    <p className="text-[11px] text-[#3A0F34]/70 font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#3A0F34]" />
                      <span>Please complete Submitter Email Verification above to unlock submission.</span>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
