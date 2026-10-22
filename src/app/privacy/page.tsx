import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vizag Startup Map',
  description:
    'Privacy Policy and data protection practices for visitors, founders, and subscribers of Vizag Startup Map.',
};

export default function PrivacyPage() {
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
            <span className="font-bold">Legal Notice:</span> This is a standard draft privacy policy compliant with Indian Digital Personal Data Protection (DPDP) principles. Please review with qualified legal counsel before commercial launch.
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-teal-100">
              <Lock className="w-3.5 h-3.5" />
              <span>Data Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: October 21, 2026 • Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you submit a startup, submit an ownership claim, post a job, or subscribe to a paid plan:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm text-gray-600">
              <li><strong>Public directory data:</strong> Organization name, website, LinkedIn, logo, office address, geographical coordinates, sector, team size, and open job roles.</li>
              <li><strong>Private verification data:</strong> Founder contact email, work email domain, and verification proof URLs. These are stored securely and never published publicly.</li>
              <li><strong>Account and payment data:</strong> Email address for login authentication and Razorpay subscription IDs. We do not store credit card or bank credentials on our servers.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">2. How We Use Information</h2>
            <p>
              We use collected data solely to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm text-gray-600">
              <li>Maintain and display the interactive Visakhapatnam startup ecosystem map and directory.</li>
              <li>Authenticate founder ownership and job posting permissions.</li>
              <li>Process recurring subscription payments via Razorpay.</li>
              <li>Send requested email alerts regarding new ecosystem additions or job roles.</li>
              <li>Provide aggregate analytics (profile views and website clicks) to verified founders.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">3. Data Security and Row Level Security (RLS)</h2>
            <p>
              All application data is protected by strict PostgreSQL Row Level Security (RLS) policies. Only public directory attributes are readable by anonymous visitors. Sensitive submission records and billing tokens are accessible only by authorized administrative credentials.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">4. Third-Party Service Providers</h2>
            <p>
              We integrate with trusted infrastructure providers operating under strict security standards:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-xs sm:text-sm text-gray-600">
              <li><strong>Supabase:</strong> Encrypted PostgreSQL database and authentication infrastructure.</li>
              <li><strong>Razorpay:</strong> PCI-DSS Level 1 certified payment gateway handling INR recurring subscriptions.</li>
              <li><strong>Vercel:</strong> Secure global application hosting.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-gray-950">5. Your Rights and Data Deletion</h2>
            <p>
              You may request access to, correction of, or permanent deletion of your organization profile or account at any time by contacting our data protection officer at: <strong>privacy@vizagstartupmap.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
