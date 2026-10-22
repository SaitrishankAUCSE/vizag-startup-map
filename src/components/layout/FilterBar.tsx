'use client';

import React from 'react';
import {
  Search,
  Filter,
  X,
  Briefcase,
  Waves,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  LISTING_TYPES,
  AREAS,
  STAGES,
  SECTORS,
} from '@/config/constants';
import { FilterState } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.area !== 'all' ||
    filters.stage !== 'all' ||
    filters.sector !== 'all' ||
    filters.hiringOnly ||
    Boolean(filters.search) ||
    Boolean(filters.maxBeachDistance) ||
    Boolean(filters.foundedYearMax);

  return (
    <div className="bg-[#FBF9F5] border-b border-[#E6E0D4] px-3 md:px-5 py-2.5 z-20 shadow-xs">
      {/* Upper Filter Row: Type Pills & Search Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar">
          {LISTING_TYPES.map((type) => {
            const isSelected = filters.type === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onFilterChange({ type: type.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#0E4D64] text-white border-[#0E4D64] shadow-xs font-semibold'
                    : 'bg-white text-gray-700 border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {type.id !== 'all' && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : type.color }}
                  />
                )}
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Result Counter */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, sector..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/30 focus:border-[#0E4D64] text-gray-800 placeholder-gray-400"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 whitespace-nowrap border border-gray-200/60">
            <span>{totalResults}</span>
            <span className="font-normal text-gray-500 ml-1">results</span>
          </div>
        </div>
      </div>

      {/* Secondary Filter Row: Dropdowns, Hiring Toggle, Beach & Founded Year */}
      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-200/50">
        {/* Area Dropdown */}
        <div className="relative">
          <select
            value={filters.area}
            onChange={(e) => onFilterChange({ area: e.target.value })}
            className={`appearance-none text-xs pl-2.5 pr-7 py-1.2 rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 ${
              filters.area !== 'all'
                ? 'bg-[#0E4D64]/10 text-[#0E4D64] border-[#0E4D64]/40 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="all">All Areas</option>
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Stage Dropdown */}
        <div className="relative">
          <select
            value={filters.stage}
            onChange={(e) => onFilterChange({ stage: e.target.value })}
            className={`appearance-none text-xs pl-2.5 pr-7 py-1.2 rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 ${
              filters.stage !== 'all'
                ? 'bg-[#0E4D64]/10 text-[#0E4D64] border-[#0E4D64]/40 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="all">All Stages</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sector Dropdown */}
        <div className="relative">
          <select
            value={filters.sector}
            onChange={(e) => onFilterChange({ sector: e.target.value })}
            className={`appearance-none text-xs pl-2.5 pr-7 py-1.2 rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 ${
              filters.sector !== 'all'
                ? 'bg-[#0E4D64]/10 text-[#0E4D64] border-[#0E4D64]/40 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="all">All Sectors</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Hiring Now Toggle */}
        <button
          onClick={() => onFilterChange({ hiringOnly: !filters.hiringOnly })}
          className={`px-2.5 py-1.2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            filters.hiringOnly
              ? 'bg-[#E04F36] text-white border-[#E04F36] shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Briefcase
            className={`w-3.5 h-3.5 ${
              filters.hiringOnly ? 'text-white' : 'text-[#E04F36]'
            }`}
          />
          <span>Hiring Now</span>
        </button>

        {/* Beach Distance Filter */}
        <div className="relative">
          <select
            value={filters.maxBeachDistance || ''}
            onChange={(e) =>
              onFilterChange({
                maxBeachDistance: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={`appearance-none text-xs pl-2.5 pr-7 py-1.2 rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 ${
              filters.maxBeachDistance
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="">Beach distance (Any)</option>
            <option value="2">Within 2 km of coast</option>
            <option value="5">Within 5 km of coast</option>
            <option value="10">Within 10 km of coast</option>
          </select>
          <Waves className="w-3.5 h-3.5 text-teal-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Founded Year Filter */}
        <div className="relative">
          <select
            value={filters.foundedYearMax || ''}
            onChange={(e) =>
              onFilterChange({
                foundedYearMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={`appearance-none text-xs pl-2.5 pr-7 py-1.2 rounded-lg border font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 ${
              filters.foundedYearMax
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <option value="">Founded year (Any)</option>
            <option value="2024">Founded by 2024</option>
            <option value="2022">Founded by 2022</option>
            <option value="2020">Founded by 2020</option>
            <option value="2018">Founded by 2018</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-amber-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.2 rounded-lg text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
