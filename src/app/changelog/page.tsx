import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, MapPin, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | Vizag Startup Map',
  description: 'Recent updates, new features, and directory enhancements for Vizag Startup Map.',
};

export default function ChangelogPage() {
  const updates = [
    {
      version: 'v2.4.0',
      date: 'October 2026',
      title: 'Hyderabad-Grade Map UX & CARTO Voyager Vector Engine',
      items: [
        'Integrated official CARTO Voyager GL vector style with zero-watermark high DPI map tiles.',
        'Added dynamic hiring badge pills (• N JOBS) directly below hiring startup pins.',
        'Added emerald green cluster squares with spatial zoom explosion.',
        'Upgraded Top Bar with keyboard shortcut (Ctrl+K), multi-category live suggestions, and hiring toggle.',
        'Introduced 7-Day Priority Boost tier with radar illumination and marker comparisons.',
      ],
    },
    {
      version: 'v2.2.0',
      date: 'September 2026',
      title: 'Interactive Location Picker & Jobs Slide-Over',
      items: [
        'Added interactive mini-map coordinate pin dropper to the startup submission portal.',
        'Created floating jobs slide-over panel with quick search and direct application links.',
        'Enforced strict 3-color palette (Ice Silver, Deep Aubergine, Marigold) across all directory views.',
      ],
    },
    {
      version: 'v2.0.0',
      date: 'August 2026',
      title: 'Initial Ecosystem Launch',
      items: [
        'Mapped 45+ startups, incubators, research campuses, and coworking hubs across Visakhapatnam.',
        'Configured coastal tour routing along Vizag’s scenic IT SEZ corridor.',
      ],
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#DDE3E8] text-[#3A0F34] font-sans px-6 flex flex-col justify-between selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <div className="max-w-xl mx-auto pt-16 pb-28 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-wide text-[#3A0F34]/60 hover:text-[#3A0F34] transition-colors mb-12 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Directory
        </Link>

        <header className="space-y-2 mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3A0F34] font-display">
            Changelog
          </h1>
          <p className="text-sm text-[#3A0F34]/70 font-light leading-relaxed">
            Public history of improvements, ecosystem expansions, and map feature updates.
          </p>
        </header>

        <div className="space-y-12">
          {updates.map((up) => (
            <div key={up.version} className="relative pl-6 border-l-2 border-[#3A0F34]/20 space-y-3">
              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#EAAA00] border-2 border-[#3A0F34]" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#3A0F34] text-[#EAAA00]">
                  {up.version}
                </span>
                <span className="text-xs text-[#3A0F34]/60 font-medium">{up.date}</span>
              </div>
              <h2 className="text-base font-bold text-[#3A0F34]">{up.title}</h2>
              <ul className="space-y-2 text-xs text-[#3A0F34]/80 leading-relaxed list-disc list-inside">
                {up.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <footer className="mt-20 border-t border-[#3A0F34]/15 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#3A0F34]/70">
            <nav className="flex flex-wrap items-center gap-4">
              <Link href="/" className="hover:text-[#3A0F34]">Home</Link>
              <Link href="/boost" className="hover:text-[#3A0F34]">Boost</Link>
              <Link href="/terms" className="hover:text-[#3A0F34]">Terms</Link>
              <Link href="/privacy" className="hover:text-[#3A0F34]">Privacy</Link>
            </nav>
            <div>© 2026 Vizag Startup Map</div>
          </div>
        </footer>
      </div>
    </main>
  );
}
