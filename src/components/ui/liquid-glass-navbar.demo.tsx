"use client";

import React from 'react';
import { LiquidNavbar } from '@/components/ui/liquid-glass-navbar';

export function LiquidNavbarDemo() {
  return (
    <div className="min-h-[220px] w-full flex flex-col items-center justify-center gap-6 p-8 bg-[#DDE3E8] rounded-3xl border border-[#3A0F34]/20">
      <div className="text-center">
        <h4 className="font-display font-extrabold text-xl uppercase tracking-tight text-[#3A0F34]">
          Liquid Glass Waterline Navbar
        </h4>
        <p className="text-xs text-[#3A0F34]/70 mt-0.5">
          Deep Aubergine + Marigold Fluid Droplet Physics & Wave Shaders
        </p>
      </div>

      <LiquidNavbar tone="aubergine" sound={false} />
    </div>
  );
}

export default LiquidNavbarDemo;
