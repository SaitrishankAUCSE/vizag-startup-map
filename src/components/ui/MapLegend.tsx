'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const legendItems = [
    {
      label: 'Startup',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="#EAAA00"
            stroke="#3A0F34"
            strokeWidth="2.5"
          />
        </svg>
      ),
    },
    {
      label: 'Investor',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <polygon
            points="12,3 21,12 12,21 3,12"
            fill="#3A0F34"
            stroke="#DDE3E8"
            strokeWidth="1"
          />
        </svg>
      ),
    },
    {
      label: 'Incubator',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="#DDE3E8"
            stroke="#3A0F34"
            strokeWidth="2.5"
          />
          <circle cx="12" cy="12" r="3" fill="#EAAA00" />
        </svg>
      ),
    },
    {
      label: 'Campus',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            fill="#3A0F34"
          />
          <circle cx="12" cy="12" r="2.5" fill="#DDE3E8" />
        </svg>
      ),
    },
    {
      label: 'Coworking',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <polygon
            points="12,3 21,19 3,19"
            fill="#EAAA00"
            stroke="#3A0F34"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[#DDE3E8]/95 backdrop-blur-md border border-[#3A0F34]/20 rounded-md shadow-[0_8px_24px_rgba(58,15,52,0.14)] text-[#3A0F34] select-none text-xs transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 cursor-pointer hover:bg-[#3A0F34]/[0.06] rounded-t-md"
        aria-label="Toggle map legend"
      >
        <span className="font-sans font-bold text-[10px] uppercase tracking-[0.18em]">
          Map Legend
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 border-t border-[#3A0F34]/10 space-y-2">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              {item.icon}
              <span className="font-sans font-medium text-[11px]">
                {item.label}
              </span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-[#3A0F34]/10 flex items-center gap-2 text-[10px] text-[#3A0F34]/80">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#EAAA00] bg-transparent animate-pulse shrink-0" />
            <span>Pulsing ring = Hiring now</span>
          </div>
        </div>
      )}
    </div>
  );
};
