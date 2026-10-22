'use client';

import React, { useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface SampleDataBannerProps {
  hasSampleData: boolean;
}

export function SampleDataBanner({ hasSampleData }: SampleDataBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!hasSampleData || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-2 text-xs md:text-sm text-amber-900 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2 overflow-hidden">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <p className="truncate">
          <strong className="font-semibold text-amber-950">Sample Data:</strong> Showing preview listings for Visakhapatnam. Real startups, hubs, and colleges are being indexed.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        <Link
          href="/submit"
          className="inline-flex items-center gap-1 font-medium text-amber-900 hover:text-amber-950 underline underline-offset-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add your startup</span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-800 hover:text-amber-950 rounded hover:bg-amber-200/50"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
