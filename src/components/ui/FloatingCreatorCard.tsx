'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Check,
  Copy,
  Code2,
  GraduationCap,
  Compass,
  Phone,
  MessageCircle,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CREATOR_CONFIG } from '@/config/creator';

interface FloatingCreatorCardProps {
  totalListings?: number;
  hiringCount?: number;
  onDismiss?: () => void;
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.995-.464-1.667-.688-2.73-2.383-2.812-2.495-.083-.112-.672-.893-.672-1.704 0-.811.424-1.21.575-1.373.151-.164.333-.205.444-.205.112 0 .223.001.32.006.101.005.237-.038.37.283.138.334.475 1.159.516 1.242.042.083.07.18.014.292-.056.113-.084.183-.167.28-.083.097-.175.217-.25.291-.084.084-.171.175-.074.342.097.167.432.713.928 1.154.638.568 1.177.744 1.344.827.167.084.264.07.362-.042.097-.111.417-.486.528-.653.111-.166.222-.139.375-.083.153.055.972.458 1.139.541.167.083.278.125.32.194.042.07.042.405-.102.81zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.397A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  );
}

export const FloatingCreatorCard: React.FC<FloatingCreatorCardProps> = () => {
  // Temporary Welcome Card (shows ONLY ONCE upon opening the website, stays 15s, then vanishes)
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  // Full Info & Contact Dossier Modal
  const [showFullDossier, setShowFullDossier] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    try {
      // Check if user has already seen the welcome card during this session
      const alreadySeen = sessionStorage.getItem('vsm_creator_card_viewed');
      if (alreadySeen === 'true') return;

      // Show 1.2 seconds after opening website
      const showTimer = setTimeout(() => {
        setIsWelcomeVisible(true);
        sessionStorage.setItem('vsm_creator_card_viewed', 'true');

        // Automatically stay for 15 seconds, then vanish and never appear again
        const hideTimer = setTimeout(() => {
          setIsWelcomeVisible(false);
        }, 15000);

        return () => clearTimeout(hideTimer);
      }, 1200);

      return () => clearTimeout(showTimer);
    } catch {
      // In case sessionStorage is restricted
    }
  }, []);

  const handleManualDismissWelcome = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWelcomeVisible(false);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CREATOR_CONFIG.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {}
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(CREATOR_CONFIG.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2200);
    } catch {}
  };

  return (
    <>
      {/* ── 1. Temporary Welcome Card: 30% Transparent Glassmorphism (Shows once on open, stays 15s, vanishes) ── */}
      <div
        className={`transition-all duration-700 ease-out transform ${
          isWelcomeVisible
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div
          onClick={() => {
            setIsWelcomeVisible(false);
            setShowFullDossier(true);
          }}
          className="relative bg-white/70 backdrop-blur-xl border border-[#3A0F34]/20 rounded-2xl p-4 shadow-[0_12px_40px_rgba(58,15,52,0.18)] text-[#3A0F34] cursor-pointer hover:border-[#3A0F34]/40 hover:bg-white/80 transition-all max-w-[320px] select-none group"
          title="Click to view Developer Information & Contact"
        >
          {/* Subtle gold accent corner bar */}
          <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden rounded-tr-2xl pointer-events-none">
            <div className="w-16 h-1.5 bg-[#EAAA00] transform rotate-45 translate-x-4 -translate-y-1" />
          </div>

          <div className="flex items-start gap-3.5">
            {/* Monogram Seal */}
            <div className="w-11 h-11 rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-sm border border-[#EAAA00]/30">
              {CREATOR_CONFIG.initials}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/60">
                Platform Architect
              </div>

              {/* Clean, Professional Bold Executive Typography */}
              <div className="font-display font-extrabold text-base text-[#3A0F34] leading-tight tracking-tight mt-0.5 group-hover:text-[#2A0826] transition-colors">
                {CREATOR_CONFIG.fullName}
              </div>

              <div className="text-[10.5px] text-[#3A0F34]/75 font-medium mt-0.5 truncate flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-[#EAAA00] shrink-0" />
                <span>AU College of Engineering · Vizag</span>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleManualDismissWelcome}
              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[#3A0F34]/40 hover:text-[#3A0F34] hover:bg-[#3A0F34]/10 transition-colors cursor-pointer"
              aria-label="Dismiss card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-[#3A0F34]/10 flex items-center justify-between text-[10px] text-[#3A0F34]/70 font-semibold">
            <span>Conceived & Developed this Map</span>
            <span className="text-[#3A0F34] group-hover:text-[#EAAA00] font-bold inline-flex items-center gap-0.5 transition-colors">
              Full Info & Connect →
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Permanent Separate Creative Button ("✦ Architect" / "Developer") ── */}
      <button
        type="button"
        onClick={() => setShowFullDossier(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-xs cursor-pointer select-none border border-[#EAAA00]/40 hover:scale-[1.03] active:scale-95"
        title="View Developer Information & Contact Channels"
        aria-label="Developer Information"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00] group-hover:bg-[#3A0F34] animate-pulse" />
        <span>Developer</span>
      </button>

      {/* ── 3. Comprehensive Developer & Multi-Channel Contact Dossier Modal ── */}
      {showFullDossier && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#3A0F34]/65 backdrop-blur-md transition-opacity"
            onClick={() => setShowFullDossier(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-[#FAF9F6] border border-[#3A0F34]/20 rounded-3xl shadow-[0_24px_70px_rgba(58,15,52,0.35)] overflow-hidden z-10 my-auto text-[#3A0F34] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-[#3A0F34] text-[#DDE3E8] p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#EAAA00]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  {/* Monogram Seal */}
                  <div className="w-14 h-14 rounded-2xl bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-display font-extrabold text-2xl shadow-md shrink-0 border border-white/20">
                    {CREATOR_CONFIG.initials}
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#EAAA00]/20 border border-[#EAAA00]/40 text-[#EAAA00] px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-widest mb-1">
                      Platform Creator & Lead Engineer
                    </div>
                    <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                      {CREATOR_CONFIG.fullName}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#DDE3E8]/85 font-medium mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                      <span>Andhra University College of Engineering (B.Tech CSE · 8.12 CGPA)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFullDossier(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Developer Vision & Architecture Note */}
              <div className="bg-[#3A0F34]/5 border border-[#3A0F34]/10 rounded-2xl p-4 sm:p-5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                  <Compass className="w-3.5 h-3.5 text-[#EAAA00]" />
                  <span>The Vision Behind Vizag Startup Map</span>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-[#3A0F34]/90 font-medium">
                  {CREATOR_CONFIG.bio}
                </p>
              </div>

              {/* Engineering Highlights */}
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/60 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Architectural Capabilities Developed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CREATOR_CONFIG.architectureHighlights.map((feat) => (
                    <div
                      key={feat.title}
                      className="bg-white/80 border border-[#3A0F34]/10 rounded-xl p-3 space-y-1 shadow-2xs"
                    >
                      <h4 className="font-display font-bold text-xs text-[#3A0F34]">
                        {feat.title}
                      </h4>
                      <p className="text-[10.5px] text-[#3A0F34]/70 leading-snug">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Technologies */}
              <div className="space-y-1.5">
                <div className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/60">
                  Core Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CREATOR_CONFIG.stack.map((item) => (
                    <span
                      key={item}
                      className="bg-[#DDE3E8]/80 border border-[#3A0F34]/15 text-[#3A0F34] px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── MANY WAYS TO REACH ME (Direct Multi-Channel Contact Bar) ── */}
              <div className="pt-3 border-t border-[#3A0F34]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]">
                    Direct Contact Channels
                  </span>
                  <span className="text-[9.5px] text-emerald-800 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                    Direct Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. LinkedIn */}
                  <a
                    href={CREATOR_CONFIG.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-white/90 border border-[#3A0F34]/15 text-[#3A0F34] hover:border-[#0077B5] transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0077B5] text-white flex items-center justify-center shrink-0">
                        <LinkedinIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#3A0F34]">LinkedIn Profile</div>
                        <div className="text-[10px] text-[#3A0F34]/60 font-mono">in/saitrishank</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]/40 group-hover:text-[#0077B5] transition-colors" />
                  </a>

                  {/* 2. GitHub */}
                  <a
                    href={CREATOR_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-white/90 border border-[#3A0F34]/15 text-[#3A0F34] hover:border-[#1F2937] transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1F2937] text-white flex items-center justify-center shrink-0">
                        <GithubIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#3A0F34]">GitHub Portfolio</div>
                        <div className="text-[10px] text-[#3A0F34]/60 font-mono">@SaitrishankAUCSE</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]/40 group-hover:text-[#1F2937] transition-colors" />
                  </a>

                  {/* 3. WhatsApp Direct */}
                  <a
                    href={CREATOR_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-white/90 border border-[#3A0F34]/15 text-[#3A0F34] hover:border-[#25D366] transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#3A0F34]">WhatsApp Direct</div>
                        <div className="text-[10px] text-[#3A0F34]/60">{CREATOR_CONFIG.phoneFormatted}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]/40 group-hover:text-[#25D366] transition-colors" />
                  </a>

                  {/* 4. Direct Call */}
                  <a
                    href={`tel:${CREATOR_CONFIG.phone}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-white/90 border border-[#3A0F34]/15 text-[#3A0F34] hover:border-[#3A0F34] transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#3A0F34]">Phone Call</div>
                        <div className="text-[10px] text-[#3A0F34]/60">{CREATOR_CONFIG.phoneFormatted}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]/40 group-hover:text-[#3A0F34] transition-colors" />
                  </a>
                </div>

                {/* 5. Direct Email with 1-Click Copy */}
                <div className="p-3 rounded-xl bg-[#3A0F34]/5 border border-[#3A0F34]/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-[#EAAA00] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#3A0F34]/60">
                        Email Address
                      </div>
                      <a
                        href={`mailto:${CREATOR_CONFIG.email}?subject=Regarding%20Vizag%20Startup%20Map`}
                        className="text-xs font-bold text-[#3A0F34] hover:underline truncate block"
                      >
                        {CREATOR_CONFIG.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#3A0F34]/20 hover:border-[#3A0F34] text-xs font-bold text-[#3A0F34] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`mailto:${CREATOR_CONFIG.email}?subject=Regarding%20Vizag%20Startup%20Map`}
                      className="px-3 py-1.5 rounded-lg bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] text-xs font-bold transition-all"
                    >
                      Compose ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
