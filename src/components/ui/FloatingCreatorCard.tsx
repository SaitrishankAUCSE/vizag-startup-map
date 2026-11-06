'use client';

import React, { useState } from 'react';
import { X, Sparkles, ExternalLink, Mail, Check, Copy, Code2, MapPin, GraduationCap, Compass } from 'lucide-react';
import { CREATOR_CONFIG } from '@/config/creator';

interface FloatingCreatorCardProps {
  totalListings: number;
  hiringCount: number;
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

export const FloatingCreatorCard: React.FC<FloatingCreatorCardProps> = ({
  totalListings,
  hiringCount,
}) => {
  const [showStory, setShowStory] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CREATOR_CONFIG.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {}
  };

  return (
    <>
      {/* ── Sleek, Unified Bottom Pill (Impressive, Creative, Non-Intrusive) ── */}
      <div className="inline-flex items-center gap-1.5 p-1 bg-[#FAF9F6]/95 backdrop-blur-md border border-[#3A0F34]/20 rounded-full shadow-[0_4px_20px_rgba(58,15,52,0.12)] text-[#3A0F34] text-[11px] font-sans pointer-events-auto transition-all hover:border-[#3A0F34]/40 hover:shadow-[0_6px_24px_rgba(58,15,52,0.18)]">
        {/* Live Ecosystem Count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-extrabold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span>{totalListings} startups</span>
        </div>

        <span className="text-[#3A0F34]/25 select-none">|</span>

        {/* Creative Developer Signature Pill (Clickable) */}
        <button
          type="button"
          onClick={() => setShowStory(true)}
          className="group flex items-center gap-1.5 px-3 py-1 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-full text-[10.5px] font-bold tracking-wide transition-all shadow-xs cursor-pointer select-none"
          title="Click to view Developer Story & Architecture"
        >
          <Sparkles className="w-3 h-3 text-[#EAAA00] group-hover:text-[#3A0F34] transition-colors" />
          <span className="font-display">Developed by {CREATOR_CONFIG.name}</span>
        </button>

        <span className="text-[#3A0F34]/25 select-none hidden sm:inline">|</span>

        {/* Sister Ecosystems */}
        <div className="hidden sm:flex items-center gap-2 px-2 text-[10px] font-bold">
          <a
            href="https://hyderabadstartupsmap.lol?ref=vizagstartupmap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3A0F34]/70 hover:text-[#EAAA00] transition-colors"
          >
            Hyd Map
          </a>
          <span className="text-[#3A0F34]/25">·</span>
          <a
            href="https://bangalorestartupmap.com?ref=vizagstartupmap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3A0F34]/70 hover:text-[#EAAA00] transition-colors"
          >
            BLR Map
          </a>
        </div>
      </div>

      {/* ── Modern Developer Showcase Modal (Single Unified View, Impresses Users & Recruiters Alike) ── */}
      {showStory && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#3A0F34]/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowStory(false)}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-xl bg-[#FAF9F6] border border-[#3A0F34]/20 rounded-3xl shadow-[0_24px_70px_rgba(58,15,52,0.35)] overflow-hidden z-10 my-auto text-[#3A0F34] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-[#3A0F34] text-[#DDE3E8] p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#EAAA00]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  {/* Avatar Monogram */}
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-display font-extrabold text-2xl shadow-md shrink-0">
                    {CREATOR_CONFIG.initials}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#EAAA00]/20 border border-[#EAAA00]/40 text-[#EAAA00] px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-widest mb-1">
                      <span>Platform Creator & Architect</span>
                    </div>
                    <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                      {CREATOR_CONFIG.fullName}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#DDE3E8]/85 font-medium mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                      <span>Andhra University College of Engineering (B.Tech CSE)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStory(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Creator Statement */}
              <div className="bg-[#3A0F34]/5 border border-[#3A0F34]/10 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                  <Compass className="w-3.5 h-3.5 text-[#EAAA00]" />
                  <span>The Vision Behind Vizag Startup Map</span>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-[#3A0F34]/90 font-medium">
                  {CREATOR_CONFIG.bio}
                </p>
              </div>

              {/* What I Engineered / Architectural Highlights */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/60 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Platform Architecture & Highlights</span>
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
                      <p className="text-[11px] text-[#3A0F34]/75 leading-snug">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/60">
                  Core Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CREATOR_CONFIG.stack.map((item) => (
                    <span
                      key={item}
                      className="bg-[#DDE3E8]/80 border border-[#3A0F34]/15 text-[#3A0F34] px-2.5 py-1 rounded-lg text-[10.5px] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Links & Connection Buttons */}
              <div className="pt-2 border-t border-[#3A0F34]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* LinkedIn */}
                  <a
                    href={CREATOR_CONFIG.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#0077B5] hover:bg-[#005E93] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>

                  {/* GitHub */}
                  <a
                    href={CREATOR_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#1F2937] hover:bg-[#111827] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>

                {/* Email / Copy Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={`mailto:${CREATOR_CONFIG.email}?subject=Regarding%20Vizag%20Startup%20Map`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center justify-center gap-1 bg-white hover:bg-white/80 border border-[#3A0F34]/20 text-[#3A0F34] p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Copy Email Address"
                    aria-label="Copy Email"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
