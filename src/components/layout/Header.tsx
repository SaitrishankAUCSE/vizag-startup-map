'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Menu, Search, X } from 'lucide-react';
import { COPY } from '@/content/copy';
import { LiquidNavbar } from '@/components/ui/liquid-glass-navbar';
import { CartoonButton } from '@/components/ui/cartoon-button';

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
      {/* Left: Tiny hamburger icon + Logo + Creator Attribution */}
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

        {/* Creator Attribution */}
        <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-[#3A0F34]/20 text-[11px] text-[#3A0F34]/70">
          <span>Developed by</span>
          <Link
            href="/about"
            className="font-display font-extrabold text-[#3A0F34] hover:text-[#EAAA00] transition-colors flex items-center gap-1 group"
            title="Conceived & developed by Venkata Sai Trishank Kamma (AU CSE)"
          >
            <span className="group-hover:underline">Venkata Sai Trishank Kamma</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#3A0F34] text-[#EAAA00] rounded-full font-bold">AU CSE</span>
          </Link>
        </div>
      </div>

      {/* Right on Desktop: Tiny uppercase links, search icon, outlined button, login */}
      <nav className="hidden lg:flex items-center gap-6">
        <LiquidNavbar tone="silver" className="hidden lg:inline-flex" />

        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search ecosystem"
            className="p-2 rounded-full hover:bg-[#3A0F34]/[0.08] text-[#3A0F34] transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Tactile 3D Action Button: ADD YOUR STARTUP */}
        <CartoonButton
          label={COPY.nav.addStartup}
          variant="marigold"
          size="sm"
          href="/submit"
        />
      </nav>

      {/* Mobile Actions Right */}
      <div className="flex lg:hidden items-center gap-2">
        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search directory"
            className="p-2 text-[#3A0F34] cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

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
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-left font-display font-bold text-sm tracking-wider text-[#3A0F34]"
          >
            MAP
          </Link>
          <Link
            href="/grid"
            onClick={() => setMobileMenuOpen(false)}
            className="text-left font-display font-bold text-sm tracking-wider text-[#3A0F34]"
          >
            GRID
          </Link>
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="text-left font-display font-bold text-sm tracking-wider text-[#3A0F34]"
          >
            JOBS
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display font-bold text-sm tracking-wider text-[#3A0F34]"
          >
            NEWS
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display font-bold text-sm tracking-wider text-[#3A0F34]"
          >
            ABOUT
          </Link>
          <div className="pt-2 border-t border-[#3A0F34]/15 flex flex-col gap-3">
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#EAAA00] text-[#3A0F34] font-bold text-xs uppercase tracking-wider"
            >
              ADD YOUR STARTUP
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-full border border-[#3A0F34]/30 text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors"
            >
              ADMIN CONSOLE
            </Link>

            {/* Developer Attribution Card */}
            <div className="mt-2 p-3.5 rounded-2xl bg-[#3A0F34]/6 border border-[#3A0F34]/15 space-y-1 text-center">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#3A0F34]/60">
                Platform Architect &amp; Developer
              </div>
              <div className="font-display font-extrabold text-xs text-[#3A0F34]">
                Venkata Sai Trishank Kamma
              </div>
              <div className="text-[10px] text-[#3A0F34]/70">
                AU College of Engineering · Vizag
              </div>
              <div className="flex items-center justify-center gap-3 pt-1 text-[10px] font-bold">
                <a
                  href="https://linkedin.com/in/saitrishank"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0077B5] hover:underline"
                >
                  LinkedIn ↗
                </a>
                <span className="text-zinc-300">·</span>
                <a
                  href="https://github.com/SaitrishankAUCSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3A0F34] hover:underline"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
