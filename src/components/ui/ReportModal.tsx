'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { Listing } from '@/types';

interface ReportModalProps {
  listing: Listing;
  initialKind?: 'incorrect_data' | 'remove_listing' | 'duplicate';
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  listing,
  initialKind = 'incorrect_data',
  onClose,
}) => {
  const [kind, setKind] = useState<'incorrect_data' | 'remove_listing' | 'duplicate'>(initialKind);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          kind,
          reporter_email: email,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#DDE3E8] border border-[#3A0F34]/15 rounded-2xl p-6 shadow-2xl text-[#3A0F34]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
            <h3 className="font-display font-bold text-lg">Thank You</h3>
            <p className="text-sm text-[#3A0F34]/80">
              Your report for <strong>{listing.name}</strong> has been received. Our team reviews all
              removal and correction requests within 48 hours (and guarantees removal within 7 days).
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              {kind === 'remove_listing' ? (
                <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#EAAA00] shrink-0" />
              )}
              <h3 className="font-display font-bold text-base">
                {kind === 'remove_listing' ? 'Request Listing Removal' : 'Report Incorrect Data'}
              </h3>
            </div>

            <p className="text-xs text-[#3A0F34]/70">
              For <strong>{listing.name}</strong>. We value data accuracy and privacy.
            </p>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#3A0F34]/8 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setKind('incorrect_data')}
                className={`py-1.5 rounded-lg transition-colors ${
                  kind === 'incorrect_data' ? 'bg-[#3A0F34] text-[#DDE3E8]' : 'text-[#3A0F34]/70 hover:text-[#3A0F34]'
                }`}
              >
                Wrong data
              </button>
              <button
                type="button"
                onClick={() => setKind('duplicate')}
                className={`py-1.5 rounded-lg transition-colors ${
                  kind === 'duplicate' ? 'bg-[#3A0F34] text-[#DDE3E8]' : 'text-[#3A0F34]/70 hover:text-[#3A0F34]'
                }`}
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => setKind('remove_listing')}
                className={`py-1.5 rounded-lg transition-colors ${
                  kind === 'remove_listing' ? 'bg-red-700 text-white' : 'text-[#3A0F34]/70 hover:text-[#3A0F34]'
                }`}
              >
                Remove
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                Your Work / Contact Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full bg-white border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs text-[#3A0F34] placeholder:text-[#3A0F34]/40 focus:outline-none focus:ring-2 focus:ring-[#3A0F34]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                Details & Source of Correction
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  kind === 'remove_listing'
                    ? 'I am the founder/representative of this company and request its removal.'
                    : 'Please explain what needs updating and provide a reference URL.'
                }
                className="w-full bg-white border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs text-[#3A0F34] placeholder:text-[#3A0F34]/40 focus:outline-none focus:ring-2 focus:ring-[#3A0F34] resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl px-3 py-2 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-[#3A0F34]/20 text-[#3A0F34] font-semibold text-xs py-2.5 rounded-full hover:bg-[#3A0F34]/8 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 font-bold text-xs uppercase tracking-wider py-2.5 rounded-full transition-colors ${
                  kind === 'remove_listing'
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34]'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Sending...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
