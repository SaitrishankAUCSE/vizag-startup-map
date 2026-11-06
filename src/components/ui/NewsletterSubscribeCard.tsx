'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, X, CheckCircle2, AlertCircle, Loader2, Sparkles, Clock } from 'lucide-react';

export function NewsletterSubscribeCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      const alreadySubscribed = localStorage.getItem('vsm_newsletter_subscribed');
      const alreadyDismissed = localStorage.getItem('vsm_newsletter_dismissed');

      if (alreadySubscribed === 'true' || alreadyDismissed === 'true') {
        return;
      }

      // Show after exactly 30 seconds of user activity on the website
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 30000);

      return () => clearTimeout(timer);
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('vsm_newsletter_dismissed', 'true');
    } catch {}
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        try {
          localStorage.setItem('vsm_newsletter_subscribed', 'true');
          localStorage.setItem('vsm_trial_start', String(Date.now()));
        } catch {}

        // Auto close after 4 seconds on success
        setTimeout(() => {
          setIsOpen(false);
        }, 4000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <aside
      aria-label="Subscribe to ecosystem updates"
      className="fixed bottom-20 right-4 z-[1250] w-[330px] sm:w-[370px] bg-white/95 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-5 shadow-[0_12px_40px_rgba(58,15,52,0.18)] text-[#3A0F34] font-sans animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#3A0F34]" />
          <h3 className="font-display font-extrabold text-sm text-[#3A0F34]">
            Daily Morning Intelligence
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[#3A0F34]/50 hover:text-[#3A0F34] hover:bg-[#3A0F34]/10 transition-colors cursor-pointer"
          aria-label="Dismiss update prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3-Day Free Trial Badge */}
      <div className="inline-flex items-center gap-1.5 bg-[#EAAA00]/20 border border-[#EAAA00]/40 text-[#3A0F34] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
        <Clock className="w-3 h-3 text-[#EAAA00]" />
        <span>3-Day Free Trial · Startups & Job Alerts</span>
      </div>

      {status === 'success' ? (
        <div className="py-3 text-center space-y-2 animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-sm text-[#3A0F34]">
            3-Day Free Trial Activated!
          </h4>
          <p className="text-[11px] text-[#3A0F34]/75 leading-relaxed">
            You will receive 1 consolidated briefing every morning at 8:00 AM with newly mapped startups and fresh tech openings.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#3A0F34]/75 mb-4 leading-relaxed font-normal">
            Receive exactly <strong>1 email in the morning</strong> with all newly verified startups and open tech roles across Visakhapatnam. Free for 3 days.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                className="flex-1 min-w-0 bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2 text-xs text-[#3A0F34] placeholder:text-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center min-w-[84px]"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Start Trial'
                )}
              </button>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-[#3A0F34]/60 pt-1">
              <span>Zero daytime spam · 1 morning briefing</span>
              <Link href="/pricing" className="text-[#3A0F34] font-bold hover:underline">
                Explore Pro →
              </Link>
            </div>
          </form>
        </>
      )}
    </aside>
  );
}
