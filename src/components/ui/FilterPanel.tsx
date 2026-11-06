'use client';

import React from 'react';
import { X, Filter, Check } from 'lucide-react';
import { FilterState } from '@/types';
import { AREAS, STAGES, SECTORS } from '@/config/constants';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onClose: () => void;
  onClearAll: () => void;
  totalResults: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClose,
  onClearAll,
  totalResults,
}) => {
  const types = ['startup', 'investor', 'incubator', 'campus', 'coworking'];
  const typeLabels: Record<string, string> = {
    startup: 'Startups',
    investor: 'Investors',
    incubator: 'Incubators',
    campus: 'Campuses',
    coworking: 'Coworking',
  };

  const Chip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-[0.08em] border transition-all cursor-pointer flex items-center gap-1 select-none active:scale-95 ${
        active
          ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-xs'
          : 'bg-white/60 hover:bg-white text-[#3A0F34] border-[#3A0F34]/20 hover:border-[#3A0F34]'
      }`}
    >
      {active && <Check className="w-3 h-3 text-[#EAAA00] stroke-[3]" />}
      <span>{label}</span>
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/65">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  return (
    <div className="absolute top-[76px] sm:top-[82px] left-1/2 -translate-x-1/2 z-[1300] w-full max-w-[460px] px-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#DDE3E8]/98 backdrop-blur-2xl border border-[#3A0F34]/20 rounded-2xl shadow-[0_16px_50px_rgba(58,15,52,0.25)] flex flex-col max-h-[calc(100vh-100px)] overflow-hidden">
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#3A0F34]/12 bg-[#DDE3E8] shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#3A0F34]" />
            <span className="font-display font-extrabold text-sm text-[#3A0F34]">Filters</span>
            <span className="bg-[#3A0F34]/10 text-[#3A0F34] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {totalResults} results
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-bold text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer underline-offset-2 hover:underline"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 text-[#3A0F34] cursor-pointer transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Smooth, Effortless Scrolling */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          {/* Type */}
          <Section title="Ecosystem Type">
            {types.map((t) => (
              <Chip
                key={t}
                label={typeLabels[t]}
                active={filters.type === t}
                onClick={() => onFilterChange({ type: filters.type === t ? 'all' : t })}
              />
            ))}
          </Section>

          {/* Area / Neighborhood */}
          <Section title="Neighborhood / Corridor">
            {AREAS.map((a) => (
              <Chip
                key={a}
                label={a}
                active={filters.area === a}
                onClick={() => onFilterChange({ area: filters.area === a ? 'all' : a })}
              />
            ))}
          </Section>

          {/* Sector */}
          <Section title="Industry & Sector">
            {SECTORS.map((s) => (
              <Chip
                key={s}
                label={s}
                active={filters.sector === s}
                onClick={() => onFilterChange({ sector: filters.sector === s ? 'all' : s })}
              />
            ))}
          </Section>

          {/* Funding Stage */}
          <Section title="Funding Stage">
            {STAGES.map((s) => (
              <Chip
                key={s}
                label={s}
                active={filters.stage === s}
                onClick={() => onFilterChange({ stage: filters.stage === s ? 'all' : s })}
              />
            ))}
          </Section>
        </div>

        {/* Pinned Footer: Always Visible and Clickable */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#3A0F34]/12 bg-[#DDE3E8] shrink-0">
          <span className="text-xs text-[#3A0F34]/70 font-semibold">
            Showing <strong className="text-[#3A0F34] font-extrabold">{totalResults}</strong> listings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-xl px-4 py-2 text-xs font-display font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};
