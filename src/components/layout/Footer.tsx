'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { COPY } from '@/content/copy';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#3A0F34] text-[#DDE3E8] border-t border-[#3A0F34]/40 py-12 px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Wordmark (light variant) */}
        <div className="flex flex-col gap-2">
          <Logo variant="light" size="md" />
          <p className="font-sans text-xs text-[#DDE3E8]/70 tracking-wide mt-1">
            {COPY.footer.madeIn}
          </p>
        </div>

        {/* Editorial Navigation Links */}
        <nav className="flex flex-wrap items-center gap-6 lg:gap-8">
          {COPY.footer.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#DDE3E8]/80 hover:text-[#EAAA00] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/privacy"
            className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#DDE3E8]/80 hover:text-[#EAAA00] transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#DDE3E8]/80 hover:text-[#EAAA00] transition-colors"
          >
            Terms
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#DDE3E8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#DDE3E8]/60">
        <span>
          &copy; {new Date().getFullYear()} Vizag Startup Map. Conceived & Developed by{' '}
          <a
            href="https://linkedin.com/in/saitrishank"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EAAA00] hover:underline font-cursive text-base font-bold ml-1 inline-block"
          >
            Trishank Kamma
          </a>
        </span>
        <span>Made with pride in Visakhapatnam · Map data &copy; OpenStreetMap</span>
      </div>
    </footer>
  );
};
