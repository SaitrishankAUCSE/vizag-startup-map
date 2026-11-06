import React from 'react';
import { Strips } from '@/components/ui/Strips';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative">
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        <Strips animate={false} />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0F34] flex items-center justify-center animate-bounce shadow-lg border border-[#EAAA00]">
            <span className="w-4 h-4 rounded-full bg-[#EAAA00]" />
          </div>
          <span className="font-display font-extrabold uppercase tracking-[0.18em] text-xs text-[#3A0F34]/70 animate-pulse">
            Loading Vizag Tech Ecosystem…
          </span>
        </div>
      </main>
    </div>
  );
}
