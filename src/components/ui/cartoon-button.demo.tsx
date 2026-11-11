"use client";

import React from 'react';
import { CartoonButton } from '@/components/ui/cartoon-button';
import { Sparkles, ArrowRight, Plus, Check } from 'lucide-react';

export function CartoonButtonDemo() {
  return (
    <div className="p-8 bg-[#DDE3E8] rounded-3xl space-y-6 max-w-2xl mx-auto border border-[#3A0F34]/20 shadow-sm">
      <div>
        <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#3A0F34]">
          Vizag Startup Map · Tactile Action Buttons
        </h3>
        <p className="text-xs text-[#3A0F34]/70 mt-1">
          Used exclusively on primary community touchpoints (+ Submit, Apply, View Map).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <CartoonButton
          label="Add Your Startup"
          variant="marigold"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => alert('Add startup clicked')}
        />

        <CartoonButton
          label="Explore Jobs"
          variant="aubergine"
          size="md"
          icon={<Sparkles className="w-4 h-4 text-[#EAAA00]" />}
          onClick={() => alert('Explore jobs clicked')}
        />

        <CartoonButton
          label="Apply on Patra Corp ↗"
          variant="marigold"
          size="sm"
          onClick={() => alert('Apply clicked')}
        />

        <CartoonButton
          label="Reserve Spotlight"
          variant="ice-silver"
          size="md"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        />

        <CartoonButton
          label="Verifying..."
          variant="marigold"
          size="md"
          loading
          disabled
        />
      </div>
    </div>
  );
}

export default CartoonButtonDemo;

