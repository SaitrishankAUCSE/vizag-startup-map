import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing Plans | Vizag Startup Map',
  description:
    'Choose between Free Community Access, Pro for Researchers & Job Seekers (₹199/mo), and Featured Listing for Startups (₹999/mo) in Visakhapatnam.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-[#0E4D64] text-white px-4 md:px-8 flex items-center justify-between border-b border-[#093345] shadow-xs">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-teal-100 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Interactive Map</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-teal-100 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E04F36] hover:bg-[#c93e27] text-white transition-all shadow-xs"
          >
            Add Startup (Free)
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/10 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Transparent Ecosystem Pricing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950">
            Simple, fair pricing for Visakhapatnam
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            The map and ecosystem directory will always remain 100% free for visitors.
            Upgrade for advanced intelligence tools or boost your startup&apos;s local visibility.
          </p>
        </div>

        <PricingClient />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#E6E0D4] bg-white text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Vizag Startup Map. Billed in Indian Rupees (INR) via Razorpay.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <Link href="/terms" className="hover:text-gray-900 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-gray-900 hover:underline">
              Refund & Cancellation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
