import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Free Access Policy | Vizag Startup Map',
  description:
    'Vizag Startup Map is 100% free for the community. Zero charges, zero fees, and no payments processed.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#3A0F34] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interactive Map</span>
        </Link>

        {/* Community Free Policy Notice */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">100% Free Community Platform:</span> Vizag Startup Map does not charge any subscription fees, listing fees, or transaction fees. No payment processing is enabled on this website.
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-[#3A0F34]/15 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero-Fee Community Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#3A0F34] tracking-tight">
              Refund & Free Access Policy
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <h2 className="text-base font-bold text-[#3A0F34]">1. No Monetary Charges or Subscriptions</h2>
            <p>
              Vizag Startup Map operates strictly as a free, open-access public interest atlas. We do not collect credit card numbers, bank account credentials, UPI handles, or recurring subscription fees from founders, researchers, or talent.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <h2 className="text-base font-bold text-[#3A0F34]">2. Cancellation & Refunds</h2>
            <p>
              Because no payments or subscriptions exist on the platform, no cancellation requests or monetary refunds are necessary. Any company or incubator listed on the map may request removal, updates, or edits at any time by contacting us directly.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <h2 className="text-base font-bold text-[#3A0F34]">3. Community Contact</h2>
            <p>
              For questions regarding listings, directory additions, or corrections, reach out to the editorial team: <strong>hello@vizagstartupmap.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
