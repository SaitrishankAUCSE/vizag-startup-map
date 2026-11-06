'use client';

import React, { useState } from 'react';
import { PRICING_CONFIG } from '@/config/pricing';
import { Check, Lock, Sparkles, X, ShieldCheck, QrCode, CreditCard, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CartoonButton } from '@/components/ui/cartoon-button';

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutName, setCheckoutName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const proPrice =
    billingCycle === 'monthly'
      ? PRICING_CONFIG.pro.monthly.displayPrice
      : PRICING_CONFIG.pro.yearly.displayPrice;

  const featuredPrice =
    billingCycle === 'monthly'
      ? PRICING_CONFIG.featured.monthly.displayPrice
      : PRICING_CONFIG.featured.yearly.displayPrice;

  const handleSimulatePayment = (success: boolean) => {
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      setStatusMessage('Please enter a valid billing email address.');
      setPaymentStatus('failed');
      return;
    }

    setPaymentStatus('processing');
    setStatusMessage('Contacting Razorpay Secure Gateway…');

    setTimeout(() => {
      if (success) {
        setPaymentStatus('success');
        setStatusMessage('Payment verified! Your Pro Ecosystem Pass has been activated.');
      } else {
        setPaymentStatus('failed');
        setStatusMessage('Payment authorization declined by issuing bank. Please retry or choose another payment method.');
      }
    }, 1200);
  };

  return (
    <div className="space-y-16">
      {/* Monthly / Yearly Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1 rounded-full border border-[#3A0F34] bg-[#DDE3E8]">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-[#3A0F34] text-[#DDE3E8]'
                : 'text-[#3A0F34] hover:opacity-75'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-[#3A0F34] text-[#DDE3E8]'
                : 'text-[#3A0F34] hover:opacity-75'
            }`}
          >
            <span>Yearly</span>
            <span className="text-[9px] font-bold bg-[#EAAA00] text-[#3A0F34] px-1.5 py-0.5 rounded-full">
              Save ~35%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Tall Columns like vertical strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* 1. Free Community Plan */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
              COMMUNITY
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mt-1">
              Free Access
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Complete access to browse, search, and navigate the Visakhapatnam startup atlas.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">₹0</span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">/ forever</span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#3A0F34]/15 text-xs text-[#3A0F34]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Browse full interactive map & pins</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Filter by area, sector, stage, and hiring</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>View startup details, website & contacts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Submit free community listing</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full border-[1.5px] border-[#3A0F34] text-xs font-semibold uppercase tracking-[0.14em] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors"
            >
              START WITH FREE
            </Link>
          </div>
        </div>

        {/* 2. Pro Plan (Aubergine Column with Silver Text & Marigold Button) */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] border border-[#3A0F34] p-8 rounded-2xl flex flex-col justify-between shadow-xl relative transform md:-translate-y-2">
          {/* Top Marigold Tag */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[9.5px] font-bold uppercase tracking-[0.18em] shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3A0F34]" />
            <span>MOST POPULAR</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#EAAA00]">
              RESEARCHERS & TALENT
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#DDE3E8] mt-1">
              Pro Member
            </h3>
            <p className="text-xs text-[#DDE3E8]/80 mt-2 min-h-[36px]">
              Ecosystem intelligence, CSV downloads, saved lists, and instant job alerts.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#EAAA00]">
                {proPrice}
              </span>
              <span className="text-xs text-[#DDE3E8]/70 ml-1">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#DDE3E8]/20 text-xs text-[#DDE3E8]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>1-Click CSV & JSON directory export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Direct founder & leadership LinkedIn handles</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Instant job alerts when tracked startups hire</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Save favorites, private notes & custom lists</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Advanced filters: founding year, team size, funding</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Monthly Vizag Ecosystem Intelligence Report</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <CartoonButton
              label="GO PRO"
              variant="marigold"
              size="md"
              className="w-full"
              onClick={() => {
                setShowCheckoutModal(true);
                setPaymentStatus('idle');
                setStatusMessage('');
              }}
            />
          </div>
        </div>

        {/* 3. Featured Listing Plan */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
              FOUNDERS & VENTURES
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mt-1">
              Featured Listing
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Top-tier visibility on the map, featured badges, and talent recruitment tools.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">
                {featuredPrice}
              </span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#3A0F34]/15 text-xs text-[#3A0F34]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Highlighted pin with double ring on map</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Top placement in search and directory lists</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Post up to 5 active open job listings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Extended profile & photo showcase</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Monthly viewer traffic analytics</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 space-y-2">
            <CartoonButton
              label="RESERVE SPOTLIGHT →"
              variant="aubergine"
              size="md"
              className="w-full"
              href="/ad-slots/submit"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table Below */}
      <div className="pt-12 border-t border-[#3A0F34]/15">
        <h4 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mb-6 text-center">
          Feature Comparison
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#3A0F34]/20 text-[#3A0F34]/60 uppercase tracking-[0.14em]">
                <th className="py-3 px-4 font-semibold">Capability</th>
                <th className="py-3 px-4 font-semibold text-center">Free</th>
                <th className="py-3 px-4 font-semibold text-center text-[#3A0F34] bg-[#3A0F34]/10 rounded-t-lg">
                  Pro
                </th>
                <th className="py-3 px-4 font-semibold text-center">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A0F34]/10 text-[#3A0F34]">
              <tr>
                <td className="py-3 px-4 font-medium">Interactive Map & Clusters</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Area & Sector Filters</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">CSV Data Export</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#EAAA00]">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Instant Email Job Alerts</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#EAAA00]">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Top Placement & Highlighted Pin</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center font-bold text-[#EAAA00]">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Job Postings Included</td>
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">1</td>
                <td className="py-3 px-4 text-center font-bold">5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Interactive Razorpay Pro Checkout Modal ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#DDE3E8] border-2 border-[#3A0F34] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#3A0F34]/10 text-[#3A0F34] transition-colors cursor-pointer"
              aria-label="Close checkout modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-[#EAAA00] text-[#3A0F34]">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                  Razorpay Secure Subscription
                </span>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#3A0F34]">
                  Pro Ecosystem Pass
                </h3>
              </div>
            </div>

            <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-4 my-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#3A0F34]">Selected Plan</p>
                <p className="text-[11px] text-[#3A0F34]/70">
                  {billingCycle === 'monthly' ? 'Monthly Pass (Renews every 30 days)' : 'Annual Pass (Renews yearly · Save 35%)'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-2xl text-[#3A0F34]">
                  {proPrice}
                </span>
              </div>
            </div>

            {/* Merchant Verification Notice matching live state */}
            <div className="bg-[#EAAA00]/15 border border-[#EAAA00]/60 rounded-xl p-3 mb-4 text-[11px] text-[#3A0F34] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3A0F34] shrink-0 mt-0.5" />
              <span>
                <strong>Razorpay Test & Live Gateways:</strong> Live merchant website verification is currently active for <code>vizag-startup-map.vercel.app</code>. Instant test-mode simulation is enabled below.
              </span>
            </div>

            {paymentStatus === 'success' ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-display font-extrabold text-xl text-[#3A0F34]">
                  Subscription Activated!
                </h4>
                <p className="text-xs text-[#3A0F34]/75 max-w-sm mx-auto">
                  {statusMessage} A receipt has been dispatched to {checkoutEmail}.
                </p>
                <div className="pt-2">
                  <CartoonButton
                    label="Go to My Account"
                    variant="marigold"
                    size="md"
                    href="/account"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A0F34] mb-1">
                    Receipt Email Address *
                  </label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="founder@yourstartup.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#3A0F34]/30 bg-white text-sm text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A0F34] mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#3A0F34] bg-[#3A0F34] text-[#DDE3E8]'
                          : 'border-[#3A0F34]/20 bg-white text-[#3A0F34] hover:bg-[#3A0F34]/5'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#3A0F34] bg-[#3A0F34] text-[#DDE3E8]'
                          : 'border-[#3A0F34]/20 bg-white text-[#3A0F34] hover:bg-[#3A0F34]/5'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-[#3A0F34] bg-[#3A0F34] text-[#DDE3E8]'
                          : 'border-[#3A0F34]/20 bg-white text-[#3A0F34] hover:bg-[#3A0F34]/5'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Netbanking</span>
                    </button>
                  </div>
                </div>

                {paymentStatus === 'failed' && (
                  <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <CartoonButton
                    label={`Pay ${proPrice} Securely`}
                    variant="marigold"
                    size="lg"
                    className="w-full"
                    loading={paymentStatus === 'processing'}
                    disabled={paymentStatus === 'processing'}
                    onClick={() => handleSimulatePayment(true)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSimulatePayment(false)}
                    className="w-full py-1 text-[11px] font-semibold text-[#3A0F34]/50 hover:text-[#3A0F34] transition-colors cursor-pointer text-center"
                  >
                    Simulate Payment Failure (Test Resilience)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
