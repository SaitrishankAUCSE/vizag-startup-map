'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, Briefcase } from 'lucide-react';

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRoles?: () => void;
}

export function JobAlertModal({ isOpen, onClose, onViewRoles }: JobAlertModalProps) {
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          position: position.trim(),
          company: company.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Subscription failed. Please check your email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    setEmail('');
    setPosition('');
    setCompany('');
    onClose();
  };

  return (
    <>
      {/* Subtle Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-2xs z-[1240] animate-in fade-in transition-opacity"
      />

      {/* Floating Card Modal (Aligned to top-left like Bangalore Startup Map) */}
      <div className="fixed inset-0 z-[1250] pointer-events-none flex items-center justify-center sm:items-start sm:justify-start sm:p-4 sm:top-20 sm:left-4">
        <div className="pointer-events-auto w-[92vw] max-w-[380px] rounded-3xl sm:rounded-2xl border border-zinc-200/90 bg-white/98 p-5 sm:p-6 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E04F36]">
              Vizag Circle
            </span>
            <button
              type="button"
              onClick={handleResetAndClose}
              aria-label="Close"
              className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="py-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  You’re subscribed to Vizag Circle!
                </h3>
                <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                  We’ve registered <span className="font-semibold text-zinc-800">{email}</span>. A confirmation snapshot with current open tech roles in Vizag is on its way.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onViewRoles && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onViewRoles();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0E4D64] hover:bg-[#093345] py-2.5 text-xs font-semibold text-white shadow-xs transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>View Open Roles Now</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full rounded-xl border border-zinc-200 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mt-1.5 mb-4">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                  Startup jobs, fundraises &amp; news
                </h2>
                <p className="mt-1 text-xs text-zinc-500 leading-normal">
                  Curated for you, from the companies on this map.
                </p>
              </div>

              {error && (
                <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    placeholder="Your current position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 shadow-2xs focus:border-zinc-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Startup you work at (or college/company)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 shadow-2xs focus:border-zinc-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 shadow-2xs focus:border-zinc-400 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#E04F36] hover:bg-[#c93f28] py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Subscribe to Vizag Circle</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-3 text-center text-[11px] text-zinc-400">
                Free · no spam · unsubscribe anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
