'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Menu, Search, X } from 'lucide-react';
import { COPY } from '@/content/copy';

interface HeaderProps {
  onSearchClick?: () => void;
  onExploreClick?: () => void;
  onGridClick?: () => void;
  onJobsClick?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onExploreClick,
  onGridClick,
  onJobsClick,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`w-full h-14 bg-[#DDE3E8]/95 backdrop-blur-md border-b border-[#3A0F34]/[0.14] px-4 lg:px-7 flex items-center justify-between select-none z-30 shrink-0 ${className}`}
    >
      {/* Left: Tiny hamburger icon + Logo */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="p-1.5 rounded-sm hover:bg-[#3A0F34]/[0.08] text-[#3A0F34] cursor-pointer lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <Logo variant="dark" size="sm" />
      </div>

      {/* Right on Desktop: Tiny uppercase links, search icon, outlined button, login */}
      <nav className="hidden lg:flex items-center gap-6">
        <button
          type="button"
          onClick={onExploreClick}
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity cursor-pointer"
        >
          {COPY.nav.explore}
        </button>

        <button
          type="button"
          onClick={onGridClick}
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity cursor-pointer"
        >
          {COPY.nav.grid}
        </button>

        <button
          type="button"
          onClick={onJobsClick}
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity cursor-pointer"
        >
          {COPY.nav.jobs}
        </button>

        <Link
          href="/news"
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity"
        >
          {COPY.nav.news}
        </Link>

        <Link
          href="/pricing"
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity"
        >
          {COPY.nav.pricing}
        </Link>

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search ecosystem"
          className="p-1.5 rounded-full hover:bg-[#3A0F34]/[0.08] text-[#3A0F34] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Small outlined button: ADD YOUR STARTUP */}
        <Link
          href="/submit"
          className="px-4 py-1.5 rounded-full border-[1.5px] border-[#3A0F34] font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors"
        >
          {COPY.nav.addStartup}
        </Link>

        {/* Text link: LOGIN */}
        <Link
          href="/login"
          className="micro-label text-[#3A0F34] hover:opacity-70 transition-opacity ml-1"
        >
          {COPY.nav.login}
        </Link>
      </nav>

      {/* Mobile Actions Right */}
      <div className="flex lg:hidden items-center gap-2">
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search directory"
          className="p-2 text-[#3A0F34] cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        <Link
          href="/submit"
          className="px-3 py-1 rounded-full border border-[#3A0F34] font-sans text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]"
        >
          ADD
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-[#DDE3E8] border-b border-[#3A0F34]/20 p-5 flex flex-col gap-4 shadow-xl z-50 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onExploreClick?.();
            }}
            className="text-left font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.explore}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onGridClick?.();
            }}
            className="text-left font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.grid}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onJobsClick?.();
            }}
            className="text-left font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.jobs}
          </button>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.news}
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.pricing}
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-lg text-[#3A0F34]"
          >
            {COPY.nav.login}
          </Link>
        </div>
      )}
    </header>
  );
};
