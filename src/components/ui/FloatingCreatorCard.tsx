'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  // Lifecycle states: 'hidden' -> 'entering' -> 'active' -> 'closing' -> 'closed'
  const [welcomeStage, setWelcomeStage] = useState<'hidden' | 'entering' | 'active' | 'closing' | 'closed'>('hidden');
  const [progressWidth, setProgressWidth] = useState(100);

  // Full Info & Contact Dossier Modal
  const [showFullDossier, setShowFullDossier] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger unique closing sequence (smooth evaporate & glide-up dissolve)
  const triggerUniqueClose = () => {
    if (welcomeStage === 'closed' || welcomeStage === 'closing') return;
    setWelcomeStage('closing');
    setTimeout(() => {
      setWelcomeStage('closed');
    }, 750);
  };

  useEffect(() => {
    try {
      // Check if user has already seen the welcome card during this session
      const alreadySeen = sessionStorage.getItem('vsm_creator_card_viewed');
      if (alreadySeen === 'true') {
        setWelcomeStage('closed');
        return;
      }

      // 1. Show card 1.2s after opening website
      const showTimer = setTimeout(() => {
        setWelcomeStage('entering');
        sessionStorage.setItem('vsm_creator_card_viewed', 'true');

        // Smooth transition to active & start countdown bar
        setTimeout(() => {
          setWelcomeStage('active');
          setProgressWidth(0);
        }, 50);

        // 2. Automatically stay for 15 seconds, then perform unique closing animation
        autoDismissTimerRef.current = setTimeout(() => {
          triggerUniqueClose();
        }, 15000);
      }, 1200);

      return () => {
        clearTimeout(showTimer);
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      };
    } catch {
      // Storage fallback
    }
  }, []);

  const handleManualDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    triggerUniqueClose();
  };

  const handleCardClick = () => {
    triggerUniqueClose();
    setShowFullDossier(true);
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
      {/* ── 1. Temporary Welcome Card: Translucent Glassmorphism with Unique Morph Closing ── */}
      {welcomeStage !== 'closed' && (
        <div
          className={`transition-all duration-750 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
            welcomeStage === 'active'
              ? 'opacity-100 translate-y-0 scale-100 rotate-0 blur-0 pointer-events-auto'
              : welcomeStage === 'closing'
              ? 'opacity-0 -translate-y-6 scale-[0.88] rotate-[2.5deg] blur-md pointer-events-none'
              : 'opacity-0 translate-y-6 scale-[0.92] rotate-[-2deg] blur-xs pointer-events-none'
          }`}
        >
          <div
            onClick={handleCardClick}
            className="relative bg-white/65 backdrop-blur-2xl border border-white/80 ring-1 ring-[#3A0F34]/15 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[10px] rounded-bl-[14px] p-4 sm:p-4.5 shadow-[0_20px_50px_rgba(58,15,52,0.16),0_2px_12px_rgba(234,170,0,0.12)] text-[#3A0F34] cursor-pointer hover:bg-white/80 hover:border-[#3A0F34]/30 hover:shadow-[0_24px_60px_rgba(58,15,52,0.22)] transition-all max-w-[325px] select-none group overflow-hidden"
            title="Click to view Developer Information & Contact Channels"
          >
            {/* Top-Right Architectural Chamfer Accent */}
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
              <div className="w-16 h-2 bg-gradient-to-r from-[#EAAA00] to-[#EAAA00]/40 transform rotate-45 translate-x-4 -translate-y-1 shadow-xs" />
            </div>

            <div className="flex items-start gap-3.5 relative z-10">
              {/* Bespoke Geometric Monogram Seal */}
              <div className="w-11 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-xs rounded-bl-xs bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-md border border-[#EAAA00]/40 group-hover:scale-105 transition-transform duration-300">
                {CREATOR_CONFIG.initials}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[#3A0F34]/60">
                    Platform Architect
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                </div>

                {/* Bold Executive Professional Typography */}
                <div className="font-display font-extrabold text-base text-[#3A0F34] leading-tight tracking-tight mt-0.5 group-hover:text-[#2A0826] transition-colors">
                  {CREATOR_CONFIG.fullName}
                </div>

                <div className="text-[10.5px] text-[#3A0F34]/75 font-semibold mt-0.5 truncate flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                  <span>AU College of Engineering · Vizag</span>
                </div>
              </div>

              {/* Bespoke Close Button with 90° Spin on Hover */}
              <button
                type="button"
                onClick={handleManualDismiss}
                className="w-6 h-6 rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs bg-[#3A0F34]/8 hover:bg-[#3A0F34] text-[#3A0F34] hover:text-[#EAAA00] flex items-center justify-center transition-all duration-300 hover:rotate-90 active:scale-90 cursor-pointer shrink-0"
                aria-label="Dismiss welcome card"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Bottom Callout Row */}
            <div className="mt-3 pt-2.5 border-t border-[#3A0F34]/10 flex items-center justify-between text-[10px] text-[#3A0F34]/70 font-semibold relative z-10">
              <span>Conceived & Developed this Map</span>
              <span className="text-[#3A0F34] group-hover:text-[#EAAA00] font-bold inline-flex items-center gap-0.5 transition-colors">
                Connect →
              </span>
            </div>

            {/* 15-Second Dissolving Timeline Micro-Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3A0F34]/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EAAA00] via-[#3A0F34] to-[#EAAA00] transition-all ease-linear"
                style={{
                  width: `${progressWidth}%`,
                  transitionDuration: welcomeStage === 'active' ? '15000ms' : '0ms',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Permanent Architectural Button ("✦ Developer") ── */}
      <button
        type="button"
        onClick={() => setShowFullDossier(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-xl rounded-tr-xs rounded-bl-xs text-[10.5px] font-display font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-[0_4px_16px_rgba(234,170,0,0.35)] cursor-pointer select-none border border-[#EAAA00]/40 hover:scale-[1.04] active:scale-95 group"
        title="View Platform Architect Dossier & Direct Contact Channels"
        aria-label="Developer Information & Contact Channels"
      >
        <span className="w-2 h-2 rounded-full bg-[#EAAA00] group-hover:bg-[#3A0F34] shadow-[0_0_8px_rgba(234,170,0,0.8)] animate-pulse" />
        <span>Developer</span>
      </button>

      {/* ── 3. Comprehensive Developer & Multi-Channel Contact Dossier Modal ── */}
      {showFullDossier && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop with frosted blur */}
          <div
            className="fixed inset-0 bg-[#3A0F34]/70 backdrop-blur-md transition-opacity"
            onClick={() => setShowFullDossier(false)}
            aria-hidden="true"
          />

          {/* Modal Container: Sculpted Architectural Silhouette */}
          <div className="relative w-full max-w-xl bg-[#FAF9F6] border border-[#3A0F34]/20 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[14px] rounded-bl-[18px] shadow-[0_24px_70px_rgba(58,15,52,0.35)] overflow-hidden z-10 my-auto text-[#3A0F34] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header Banner */}
            <div className="bg-[#3A0F34] text-[#DDE3E8] p-6 sm:p-7 relative overflow-hidden shrink-0">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#EAAA00]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  {/* Monogram Badge */}
                  <div className="w-14 h-14 rounded-tl-2xl rounded-br-2xl rounded-tr-xs rounded-bl-xs bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-display font-extrabold text-2xl shadow-md shrink-0 border border-white/20">
                    {CREATOR_CONFIG.initials}
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#EAAA00]/20 border border-[#EAAA00]/40 text-[#EAAA00] px-2.5 py-0.5 rounded-lg rounded-tr-xs text-[9.5px] font-extrabold uppercase tracking-widest mb-1">
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
                  className="w-8 h-8 rounded-lg rounded-tr-xs bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Smooth Scrollable */}
            <div className="p-6 sm:p-7 space-y-5 flex-1 overflow-y-auto">
              {/* Developer Vision & Architecture Note */}
              <div className="bg-[#3A0F34]/5 border border-[#3A0F34]/10 rounded-2xl rounded-tr-sm p-4 sm:p-5 space-y-1.5">
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
                  <span>Architecture & Technical Highlights</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {CREATOR_CONFIG.architectureHighlights.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/80 border border-[#3A0F34]/10 rounded-xl rounded-tr-xs p-2.5 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00] shrink-0 mt-1.5" />
                      <div>
                        <div className="font-bold text-[#3A0F34] text-[11px]">{item.title}</div>
                        <div className="text-[10px] text-[#3A0F34]/75 leading-tight mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 DIRECT REACH CHANNELS */}
              <div className="space-y-3 pt-2 border-t border-[#3A0F34]/10">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                  <span>Direct Reach & Connect Channels</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available for Opportunities
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Direct WhatsApp */}
                  <a
                    href={CREATOR_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl rounded-tr-xs bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-900 transition-all group shadow-2xs hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg rounded-tr-xs bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">WhatsApp Direct</div>
                        <div className="text-[10px] text-emerald-700/80 font-mono">Chat on WhatsApp</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* 2. LinkedIn */}
                  <a
                    href={CREATOR_CONFIG.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl rounded-tr-xs bg-[#0077B5]/10 hover:bg-[#0077B5]/15 border border-[#0077B5]/25 text-[#0077B5] transition-all group shadow-2xs hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg rounded-tr-xs bg-[#0077B5] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <LinkedinIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0077B5]">LinkedIn Profile</div>
                        <div className="text-[10px] text-[#0077B5]/75">saitrishank</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#0077B5]/60 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* 3. GitHub */}
                  <a
                    href={CREATOR_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl rounded-tr-xs bg-zinc-900 text-zinc-100 hover:bg-black transition-all group shadow-2xs hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg rounded-tr-xs bg-white text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                        <GithubIcon className="w-4 h-4 text-zinc-900" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">GitHub Repos</div>
                        <div className="text-[10px] text-zinc-400 font-mono">SaitrishankAUCSE</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* 4. Direct Call */}
                  <a
                    href={`tel:${CREATOR_CONFIG.phone}`}
                    className="flex items-center justify-between p-3 rounded-2xl rounded-tr-xs bg-white hover:bg-white/90 border border-[#3A0F34]/15 text-[#3A0F34] hover:border-[#3A0F34] transition-all group shadow-2xs hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg rounded-tr-xs bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center shrink-0 shadow-xs">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#3A0F34]">Phone Call</div>
                        <div className="text-[10px] text-[#3A0F34]/60 font-mono">{CREATOR_CONFIG.phoneFormatted}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]/40 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                {/* 5. Direct Email with 1-Click Copy */}
                <div className="p-3.5 rounded-2xl rounded-tr-xs bg-[#3A0F34]/5 border border-[#3A0F34]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg rounded-tr-xs bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-4 h-4 text-[#EAAA00]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#3A0F34]/60">
                        Official Email
                      </div>
                      <a
                        href={`mailto:${CREATOR_CONFIG.email}?subject=Regarding%20Vizag%20Startup%20Map`}
                        className="text-xs font-bold text-[#3A0F34] hover:underline truncate block"
                      >
                        {CREATOR_CONFIG.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 rounded-xl rounded-tr-xs bg-white border border-[#3A0F34]/20 hover:border-[#3A0F34] text-xs font-bold text-[#3A0F34] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
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
                      className="px-3 py-1.5 rounded-xl rounded-tr-xs bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] text-xs font-bold transition-all shadow-xs active:scale-95"
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
