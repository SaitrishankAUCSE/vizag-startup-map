import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { Flower } from '@/components/ui/Flower';
import { Button } from '@/components/ui/Button';
import { COPY } from '@/content/copy';
import { getEcosystemStats } from '@/lib/data';
import { Building2, GraduationCap, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Vizag Startup Map | Visakhapatnam Tech Ecosystem',
  description: 'The story of Visakhapatnam\'s transformation into a coastal technology and MedTech hub.',
};

export const revalidate = 300;

export default async function AboutPage() {
  const stats = await getEcosystemStats();

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-14 lg:py-20 px-6 lg:px-12">
        <Strips animate={false} />

        <div className="absolute right-[-20px] bottom-[-30px] w-[260px] lg:w-[340px] h-[340px] lg:h-[440px] pointer-events-none z-0 opacity-40">
          <Flower />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
          {/* Hero section */}
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/80 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34]">
              {COPY.hero.microLabel}
            </div>

            <h1 className="font-display font-extrabold uppercase text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[0.95] text-[#3A0F34]">
              {COPY.about.headline}
            </h1>

            <p className="font-sans text-base sm:text-lg leading-relaxed text-[#3A0F34]/85 max-w-2xl">
              {COPY.about.lead}
            </p>
          </div>

          {/* Real-time Ecosystem Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/60 border border-[#3A0F34]/15 rounded-2xl p-5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60">Total Ventures</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] mt-1">{stats.total || 53}</div>
              <div className="text-[11px] text-[#3A0F34]/70 mt-0.5">Verified on solid ground</div>
            </div>

            <div className="bg-white/60 border border-[#3A0F34]/15 rounded-2xl p-5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60">Startups & SaaS</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] mt-1">{stats.startups || 42}</div>
              <div className="text-[11px] text-[#3A0F34]/70 mt-0.5">From Seed to Series A</div>
            </div>

            <div className="bg-white/60 border border-[#3A0F34]/15 rounded-2xl p-5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60">Open Jobs</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] mt-1">{stats.jobs || 15}</div>
              <div className="text-[11px] text-[#3A0F34]/70 mt-0.5">At {stats.companies_hiring || 13} hiring hubs</div>
            </div>

            <div className="bg-white/60 border border-[#3A0F34]/15 rounded-2xl p-5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60">Incubators & Labs</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] mt-1">{stats.incubators || 6}</div>
              <div className="text-[11px] text-[#3A0F34]/70 mt-0.5">AMTZ, a-Hub, STPI & IIMV</div>
            </div>
          </div>

          {/* The Corridors */}
          <div className="space-y-4 pt-4 border-t border-[#3A0F34]/15">
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#3A0F34]">
              The Innovation Corridors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/40 border border-[#3A0F34]/15 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAAA00] uppercase tracking-wider bg-[#3A0F34] px-2.5 py-1 rounded-full w-fit">
                  <Compass className="w-3.5 h-3.5" /> Rushikonda Hills
                </div>
                <h3 className="font-display font-bold text-base text-[#3A0F34]">The Silicon Coast</h3>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
                  Hill No. 1, 2, and 3 house the sea-facing IT SEZ, Millennium Tower, STPI incubation labs, and companies like AquaExchange, Fluentgrid, and Imaginnovate.
                </p>
              </div>

              <div className="bg-white/40 border border-[#3A0F34]/15 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAAA00] uppercase tracking-wider bg-[#3A0F34] px-2.5 py-1 rounded-full w-fit">
                  <Building2 className="w-3.5 h-3.5" /> Gajuwaka AMTZ
                </div>
                <h3 className="font-display font-bold text-base text-[#3A0F34]">MedTech Zone</h3>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
                  Andhra Pradesh MedTech Zone (AMTZ) is one of the worlds largest integrated medical technology manufacturing and research clusters with over 100 hardware startups.
                </p>
              </div>

              <div className="bg-white/40 border border-[#3A0F34]/15 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAAA00] uppercase tracking-wider bg-[#3A0F34] px-2.5 py-1 rounded-full w-fit">
                  <GraduationCap className="w-3.5 h-3.5" /> Siripuram & AU
                </div>
                <h3 className="font-display font-bold text-base text-[#3A0F34]">University Incubation Core</h3>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
                  Andhra University a-Hub and the city core nurture early-stage student founders, cleantech ventures like GreenJams, and upskilling startups like EduMoon and InterviewBuddy.
                </p>
              </div>
            </div>
          </div>

          {/* Creator Spotlight */}
          <div className="bg-white/60 border border-[#3A0F34]/15 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-xl shadow-xs shrink-0">
                  TK
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#EAAA00] bg-[#3A0F34] px-2 py-0.5 rounded-full inline-block mb-1">
                    Creator & Architect
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#3A0F34]">
                    Venkata Sai Trishank Kamma
                  </h3>
                  <p className="text-xs text-[#3A0F34]/70 font-medium">
                    Software Development Engineer · Andhra University College of Engineering (AU CSE)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://linkedin.com/in/saitrishank"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-[#0077B5] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="https://github.com/SaitrishankAUCSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-[#1F2937] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  GitHub ↗
                </a>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[#3A0F34]/85 leading-relaxed">
              Trishank engineered the Vizag Startup Map from the ground up to bring spotlight to Visakhapatnam&apos;s burgeoning technology clusters — from AMTZ MedTech Zone to Rushikonda IT SEZ — providing an open, live canvas of verified ventures, hiring pipelines, and daily morning intelligence.
            </p>
          </div>

          {/* Philosophy & CTAs */}
          <div className="pt-4 border-t border-[#3A0F34]/15 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#3A0F34]/70 max-w-md">
              100% verified real-world community catalog. No paywalls, zero synthetic data, completely anchored on solid ground.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="primary">Explore Interactive Map</Button>
              </Link>
              <Link href="/submit">
                <Button variant="secondary">Submit Your Startup</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
