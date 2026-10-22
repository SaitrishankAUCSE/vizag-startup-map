'use client';

import React, { useState } from 'react';
import { PRICING_CONFIG } from '@/config/pricing';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Building,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Lock,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (res: unknown) => void) => void;
    };
  }
}

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (product: 'pro' | 'featured') => {
    setLoadingProduct(product);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          interval: billingCycle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize subscription');
      }

      // Check if Razorpay script is present, otherwise load or simulate
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: 'Vizag Startup Map',
          description: `${product === 'pro' ? 'Pro Plan' : 'Featured Listing'} (${billingCycle})`,
          handler: function (response: { razorpay_payment_id: string; razorpay_subscription_id: string }) {
            alert(`Payment successful! Verification ID: ${response.razorpay_payment_id}. Your account will be upgraded immediately.`);
            window.location.href = '/account';
          },
          theme: { color: '#0E4D64' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for preview / dev
        alert(
          `Razorpay Subscription initiated in test mode!\nSubscription ID: ${data.subscriptionId}\nAmount: ${data.displayPrice}/${billingCycle === 'monthly' ? 'mo' : 'yr'}\n\nIn live production, the Razorpay payment modal opens here.`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout error';
      setCheckoutError(message);
    } finally {
      setLoadingProduct(null);
    }
  };

  const proPricing = PRICING_CONFIG.pro[billingCycle];
  const featuredPricing = PRICING_CONFIG.featured[billingCycle];

  return (
    <div className="space-y-12">
      {/* 1. Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 inline-flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Save 37%
            </span>
          </button>
        </div>
      </div>

      {checkoutError && (
        <div className="max-w-md mx-auto p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
          {checkoutError}
        </div>
      )}

      {/* 2. Three Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Card 1: Free Community */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                Community
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-950">Free Tier</h2>
            <p className="text-xs text-gray-500 mt-1 min-h-[32px]">
              Complete access to discover and explore the Visakhapatnam startup ecosystem.
            </p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-gray-950">₹0</span>
              <span className="text-xs text-gray-400 font-medium ml-1">/ forever</span>
            </div>

            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Full access to interactive Vizag map and clusters</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Filter by Area, Sector, and Funding Stage</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Submit startup profile with community moderation</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Post 1 active job opening on the careers board</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                <span>CSV directory dataset export</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                <span>Custom saved watchlists and email alerts</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <a
              href="/"
              className="block w-full text-center py-2.5 rounded-lg text-xs font-bold text-[#0E4D64] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              Explore Map for Free
            </a>
          </div>
        </div>

        {/* Card 2: Pro (Individuals, Researchers, Angels) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#0E4D64] shadow-md flex flex-col justify-between relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#0E4D64] text-white shadow-xs">
              Most Popular
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                For Individuals
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-950">Pro Subscription</h2>
            <p className="text-xs text-gray-500 mt-1 min-h-[32px]">
              For job seekers, researchers, investors, and ecosystem builders.
            </p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-gray-950">{proPricing.displayPrice}</span>
              <span className="text-xs text-gray-500 font-medium ml-1">
                / {billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
              {billingCycle === 'yearly' && (
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Billed ₹1,499 annually (equivalent to ₹125/month)
                </div>
              )}
            </div>

            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span className="font-semibold text-gray-900">Export filtered directory to CSV</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span>Save favourite startups and create named lists</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span>Instant email alerts for new startups in chosen sectors</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span>Job alerts when tracked startups post new roles</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span>Advanced filters: founded year, team size, funding range</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#0E4D64] shrink-0 mt-0.5" />
                <span>Ad-free, high-speed map and early data access</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => handleCheckout('pro')}
              disabled={loadingProduct === 'pro'}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#0E4D64] hover:bg-[#093345] transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>{loadingProduct === 'pro' ? 'Initializing Checkout...' : 'Upgrade to Pro'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Verified Razorpay Checkout • Cancel anytime
            </p>
          </div>
        </div>

        {/* Card 3: Featured Listing (For Startups) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                For Founders & Startups
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-950">Featured Listing</h2>
            <p className="text-xs text-gray-500 mt-1 min-h-[32px]">
              Boost your startup&apos;s prominence, hiring pipeline, and local investor reach.
            </p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-extrabold text-gray-950">{featuredPricing.displayPrice}</span>
              <span className="text-xs text-gray-500 font-medium ml-1">
                / {billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
              {billingCycle === 'yearly' && (
                <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                  Billed ₹7,999 annually (equivalent to ₹666/month)
                </div>
              )}
            </div>

            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-gray-900">Larger highlighted map pin with accent ring</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-gray-900">Top-of-list placement in all area & sector searches</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Prominent &quot;Featured&quot; badge across all directory views</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Extended company story and 3-photo gallery</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Post up to 5 active jobs (free listings get 1)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Founder analytics: total profile views & outbound clicks</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => handleCheckout('featured')}
              disabled={loadingProduct === 'featured'}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-gray-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>{loadingProduct === 'featured' ? 'Initializing Checkout...' : 'Get Featured Listing'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Verified Razorpay Checkout • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* 3. Detailed Comparison Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Detailed Feature Comparison</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Transparent breakdown of features included with each tier.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-5">Feature</th>
                <th className="py-3 px-4">Free Community</th>
                <th className="py-3 px-4 bg-teal-50/50 text-[#0E4D64]">Pro Plan</th>
                <th className="py-3 px-4 text-amber-900">Featured Listing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Interactive Map & All Filters</td>
                <td className="py-3.5 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                <td className="py-3.5 px-4 bg-teal-50/30"><Check className="w-4 h-4 text-emerald-600" /></td>
                <td className="py-3.5 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Export Filtered List to CSV</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
                <td className="py-3.5 px-4 bg-teal-50/30 font-bold text-[#0E4D64]">Unlimited CSV exports</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Save Favourites & Named Lists</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
                <td className="py-3.5 px-4 bg-teal-50/30 font-bold text-[#0E4D64]">Custom watchlists</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">New Startup & Job Email Alerts</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
                <td className="py-3.5 px-4 bg-teal-50/30 font-bold text-[#0E4D64]">Instant notifications</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Active Job Postings</td>
                <td className="py-3.5 px-4">1 active role</td>
                <td className="py-3.5 px-4 bg-teal-50/30">Job seeker tools</td>
                <td className="py-3.5 px-4 font-bold text-amber-800">Up to 5 active roles</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Map Pin Highlighting</td>
                <td className="py-3.5 px-4">Standard colored pin</td>
                <td className="py-3.5 px-4 bg-teal-50/30">Standard colored pin</td>
                <td className="py-3.5 px-4 font-bold text-amber-800">Larger pin + Accent Ring</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Search Result Priority</td>
                <td className="py-3.5 px-4">Alphabetical order</td>
                <td className="py-3.5 px-4 bg-teal-50/30">Alphabetical order</td>
                <td className="py-3.5 px-4 font-bold text-amber-800">Pinned at Top</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold text-gray-900">Founder Views & Clicks Analytics</td>
                <td className="py-3.5 px-4"><X className="w-4 h-4 text-gray-300" /></td>
                <td className="py-3.5 px-4 bg-teal-50/30"><X className="w-4 h-4 text-gray-300" /></td>
                <td className="py-3.5 px-4 font-bold text-amber-800"><Check className="w-4 h-4 text-emerald-600" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Frequently Asked Questions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">How does the 7-day money-back guarantee work?</h4>
            <p className="leading-relaxed">
              If you purchase an annual subscription and decide within 7 days that it does not fit your workflow, email us at billing@vizagstartupmap.com for an immediate full refund.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">What payment methods are supported?</h4>
            <p className="leading-relaxed">
              All transactions are processed through Razorpay Subscriptions supporting UPI (Google Pay, PhonePe, Paytm), Indian debit cards, credit cards, and net banking.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Can I cancel anytime?</h4>
            <p className="leading-relaxed">
              Yes. You can cancel your subscription with one click from your Account dashboard. You will retain full access until your billing period concludes, after which you return to the Free tier.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">How do I claim my startup before upgrading to Featured?</h4>
            <p className="leading-relaxed">
              Find your listing on the map, click &quot;Claim listing&quot;, and submit your company email domain or LinkedIn profile proof. Once approved, you can upgrade from your Founder dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
