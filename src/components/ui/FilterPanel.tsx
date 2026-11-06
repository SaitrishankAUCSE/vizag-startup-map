'use client';

import React from 'react';
import { X } from 'lucide-react';
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
    startup: 'Startups', investor: 'Investors', incubator: 'Incubators', campus: 'Campuses', coworking: 'Coworking',
  };

  const Chip = ({
    label, active, onClick,
  }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] border transition-all cursor-pointer ${
        active
          ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34]'
          : 'bg-transparent text-[#3A0F34] border-[#3A0F34]/30 hover:border-[#3A0F34]'
      }`}
    >
      {label}
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/60">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  return (
    <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-[1200] w-full max-w-[480px] px-3 fade-in">
      <div className="bg-[#DDE3E8] border border-[#3A0F34]/15 rounded-2xl shadow-[0_12px_40px_rgba(58,15,52,0.2)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#3A0F34]">Filters</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClearAll}
              className="text-[11px] font-semibold text-[#3A0F34]/60 hover:text-[#3A0F34] cursor-pointer underline-offset-2 hover:underline">
              Clear all
            </button>
            <button type="button" onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/8 text-[#3A0F34] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type */}
        <Section title="Type">
          {types.map((t) => (
            <Chip key={t} label={typeLabels[t]} active={filters.type === t}
              onClick={() => onFilterChange({ type: filters.type === t ? 'all' : t })} />
          ))}
        </Section>

        {/* Area */}
        <Section title="Area">
          {AREAS.map((a) => (
            <Chip key={a} label={a} active={filters.area === a}
              onClick={() => onFilterChange({ area: filters.area === a ? 'all' : a })} />
          ))}
        </Section>

        {/* Sector */}
        <Section title="Sector">
          {SECTORS.map((s) => (
            <Chip key={s} label={s} active={filters.sector === s}
              onClick={() => onFilterChange({ sector: filters.sector === s ? 'all' : s })} />
          ))}
        </Section>

        {/* Stage */}
        <Section title="Stage">
          {STAGES.map((s) => (
            <Chip key={s} label={s} active={filters.stage === s}
              onClick={() => onFilterChange({ stage: filters.stage === s ? 'all' : s })} />
          ))}
        </Section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#3A0F34]/12">
          <span className="text-xs text-[#3A0F34]/60">
            <span className="font-bold text-[#3A0F34]">{totalResults}</span> results
          </span>
          <button type="button" onClick={onClose}
            className="bg-[#3A0F34] text-[#DDE3E8] rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors cursor-pointer">
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};
