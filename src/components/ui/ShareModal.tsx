'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  title: string;
  url: string;
  description?: string;
  onClose: () => void;
}

export function ShareModal({ title, url, description, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = description
    ? `${title} — ${description}\n${url}`
    : `Explore ${title} on the Vizag Startup Map:\n${url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.13.17 1.76 2.69 4.26 3.77.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-[#25D366] hover:text-white',
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      bg: 'hover:bg-black hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      bg: 'hover:bg-[#0A66C2] hover:text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3A0F34]/35 backdrop-blur-xs animate-in fade-in cursor-default"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-2xl p-6 shadow-2xl text-[#3A0F34] animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-lg text-[#3A0F34]">Share</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 transition-colors cursor-pointer text-[#3A0F34]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#3A0F34]/75 mb-5 font-medium line-clamp-2">
          {title}
        </p>

        {/* 1-Click Social Sharing Links */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {shareLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl bg-white/70 border border-[#3A0F34]/15 text-[#3A0F34] transition-all cursor-pointer font-bold text-[11px] ${item.bg}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Input Row */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#3A0F34]/60">
            Or copy direct link
          </span>
          <div className="flex items-center gap-2 p-1.5 bg-white border border-[#3A0F34]/20 rounded-xl">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-transparent px-2.5 text-xs text-[#3A0F34] truncate outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

