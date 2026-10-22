import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Vizag Startup Map',
  description:
    'Terms and Conditions for accessing and using the Vizag Startup Map directory, API, and premium subscription services.',
};

export default function TermsPage() {
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
            <span className="font-bold">Legal Notice:</span> This is a standard draft policy for Vizag Startup Map. Please review with qualified legal counsel before commercial launch in India.
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-teal-100">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: October 21, 2026 • Governed under the laws of Andhra Pradesh, India
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or utilizing the Vizag Startup Map website, interactive map, directory, founder portal, or premium subscriptions (collectively, the &quot;Service&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the Service immediately.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">2. Description of Service</h2>
            <p>
              Vizag Startup Map provides a free-to-use discovery platform and interactive map highlighting startups, venture funds, incubators, universities, and coworking hubs operating across Visakhapatnam and greater Andhra Pradesh. Premium features, including dataset CSV exports, custom watchlists, and Featured Listings, are offered under paid subscription plans.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">3. Directory Submissions and Organization Verification</h2>
            <p>
              Founders and community contributors may submit organization profiles for directory inclusion. All submissions undergo administrative review before publication. Submitting false, defamatory, or infringing content is strictly prohibited. Organization owners claiming listings must verify authenticity via work email or verified LinkedIn credentials.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">4. Paid Subscriptions and Billing</h2>
            <p>
              Subscribers to &quot;Pro&quot; or &quot;Featured Listing&quot; plans are billed recurringly in Indian Rupees (INR) via Razorpay Subscriptions. Subscriptions automatically renew at the close of each billing interval (monthly or yearly) unless canceled prior to the renewal date via the Account dashboard.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">5. Acceptable Use and Data Scraping</h2>
            <p>
              You agree not to systematically scrape, extract, or harvest directory listings or user contact information without prior written authorization. Pro subscribers may export filtered CSV datasets strictly for internal research, recruiting, and networking purposes.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">6. Limitation of Liability</h2>
            <p>
              Vizag Startup Map is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties regarding the accuracy, completeness, or ongoing availability of third-party company profiles, funding claims, or job postings.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">7. Contact Information</h2>
            <p>
              For inquiries regarding these Terms of Service or organization listings, contact us at: <strong>legal@vizagstartupmap.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
