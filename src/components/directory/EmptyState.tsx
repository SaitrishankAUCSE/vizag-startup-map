'use client';

import React from 'react';
import { Compass, RotateCcw, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-200/80 my-4 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#0E4D64] mb-3 border border-teal-100">
        <Compass className="w-6 h-6 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">
        No ecosystem listings found
      </h3>
      <p className="text-xs text-gray-500 max-w-xs mb-4">
        Try broadening your filters, choosing a different area, or clearing your current search terms.
      </p>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
        <Link
          href="/submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0E4D64] text-white hover:bg-[#093345] transition-colors shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit your startup</span>
        </Link>
      </div>
    </div>
  );
}
