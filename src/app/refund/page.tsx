import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CreditCard, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Vizag Startup Map',
  description:
    'Clear and transparent refund, cancellation, and billing policies for Vizag Startup Map Pro and Featured Listing subscriptions.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E4D64] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interactive Map</span>
        </Link>

        {/* Legal Advisory Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Legal Notice:</span> This is a standard draft cancellation and refund policy for Indian payment gateway compliance (Razorpay Subscriptions). Review with qualified legal counsel before production launch.
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-teal-100">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Subscriptions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: October 21, 2026 • Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">1. Overview of Subscription Plans</h2>
            <p>
              Vizag Startup Map offers two distinct subscription tiers billed in Indian Rupees (INR):
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm text-gray-600">
              <li><strong>Pro (Individuals):</strong> ₹199 per month or ₹1,499 per year. Provides CSV dataset exports, saved favourites, custom named watchlists, and sector/area alerts.</li>
              <li><strong>Featured Listing (Startups):</strong> ₹999 per month or ₹7,999 per year. Provides highlighted golden map pins, top search ranking, up to 5 job posts, and founder analytics.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">2. Cancellation Policy</h2>
            <p>
              You may cancel your subscription at any time directly through your <Link href="/account" className="text-[#0E4D64] font-semibold underline">Account Dashboard</Link> or by sending an email request to <strong>billing@vizagstartupmap.com</strong>.
            </p>
            <p>
              Upon cancellation, your subscription remains active until the end of your current paid billing period (month or year). You will retain full access to Pro or Featured features until that period concludes, after which your account quietly transitions to the Free tier with no subsequent charges.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">3. 7-Day Money-Back Guarantee for Annual Plans</h2>
            <p>
              If you purchase an annual subscription (Pro or Featured) and are not completely satisfied with our service, you are eligible for a full refund within <strong>7 days</strong> of the initial transaction date.
            </p>
            <p>
              Monthly subscription plans are non-refundable once billed, but can be canceled at any time to prevent renewal in subsequent months.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">4. Refund Processing Time</h2>
            <p>
              Approved refunds are credited directly back to the original payment source (UPI, Credit/Debit Card, or Net Banking) via Razorpay. Refunds typically appear in your account statement within 5 to 7 business days depending on your bank.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">5. Billing Support</h2>
            <p>
              If you have any questions or noticed an unexpected billing transaction, please contact our billing support desk: <strong>billing@vizagstartupmap.com</strong>. We resolve all inquiries within 24 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
