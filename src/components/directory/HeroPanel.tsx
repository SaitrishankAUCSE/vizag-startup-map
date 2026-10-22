'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Strips } from '@/components/ui/Strips';
import { Flower } from '@/components/ui/Flower';
import { BlurHeadline } from '@/components/ui/BlurHeadline';
import { CircularArrowButton } from '@/components/ui/Button';
import { COPY } from '@/content/copy';

interface HeroPanelProps {
  onExplore: () => void;
  stats: {
    startups: number;
    investors: number;
    incubators: number;
  };
}

export const HeroPanel: React.FC<HeroPanelProps> = ({ onExplore, stats }) => {
  return (
    <>
      {/* Desktop Hero Panel: Left 42% of the screen with vertical strips */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex absolute top-14 left-0 bottom-0 w-[42%] max-w-[580px] bg-[#DDE3E8] border-r border-[#3A0F34]/[0.15] z-20 flex-col justify-between p-8 xl:p-10 overflow-hidden shadow-[12px_0_40px_rgba(58,15,52,0.1)]"
      >
        {/* Background Vertical Strips */}
        <Strips animate={true} />

        {/* Botanical Lily Illustration: Anchored in bottom-right corner as a delicate framing accent */}
        <div className="absolute right-[-15px] bottom-[-20px] w-[220px] xl:w-[250px] h-[290px] xl:h-[330px] pointer-events-none z-[1] opacity-75">
          <Flower />
        </div>

        {/* Tiny Vertical coordinates on the right edge */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none z-10"
          style={{ writingMode: 'vertical-rl' }}
        >
          <span className="font-sans font-semibold text-[10px] uppercase tracking-[0.22em] text-[#3A0F34]/50">
            {COPY.hero.coordinates}
          </span>
        </div>

        {/* Top: Tiny Label & Sample Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="micro-label text-[#3A0F34]">
            {COPY.hero.microLabel}
          </span>
          <span className="px-2.5 py-0.5 rounded-full border border-[#3A0F34]/25 text-[9px] font-bold uppercase tracking-wider text-[#3A0F34] bg-[#DDE3E8]/90">
            {COPY.hero.sampleBadge}
          </span>
        </div>

        {/* Middle: Headline with motion blur trail */}
        <div className="relative z-10 my-auto py-4 overflow-visible max-w-[420px]">
          <BlurHeadline lines={COPY.hero.headline} />
        </div>

        {/* Bottom Section: Editorial Paragraph, Circular Arrow Button, and Stat Row */}
        <div className="relative z-10 space-y-4 pt-2">
          <p className="font-sans text-[13px] xl:text-[14px] leading-relaxed text-[#3A0F34]/85 max-w-[340px]">
            {COPY.hero.description}
          </p>

          <div>
            <CircularArrowButton
              label={COPY.hero.exploreButton}
              onClick={onExplore}
            />
          </div>

          {/* Stat Row */}
          <div className="pt-3 border-t border-[#3A0F34]/15">
            <span className="font-sans font-bold text-[9.5px] uppercase tracking-[0.16em] text-[#3A0F34]/75">
              {stats.startups} STARTUPS • {stats.investors} INVESTORS • {stats.incubators} INCUBATORS
            </span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Hero Panel: Bottom 52% of the screen */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex lg:hidden absolute bottom-0 left-0 right-0 h-[52%] max-h-[420px] bg-[#DDE3E8] border-t border-[#3A0F34]/20 z-20 flex-col justify-between p-5 overflow-hidden shadow-2xl rounded-t-2xl"
      >
        <Strips animate={false} />

        <div className="relative z-10 flex items-center justify-between">
          <span className="micro-label text-[10px] text-[#3A0F34]">
            {COPY.hero.microLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[#3A0F34]/25 text-[8.5px] font-bold uppercase tracking-wider text-[#3A0F34]">
            {COPY.hero.sampleBadge}
          </span>
        </div>

        <div className="relative z-10 my-1">
          <BlurHeadline lines={COPY.hero.headline} />
        </div>

        <div className="relative z-10 space-y-2.5">
          <p className="font-sans text-[12px] leading-snug text-[#3A0F34]/90 line-clamp-2">
            {COPY.hero.description}
          </p>

          <CircularArrowButton
            label={COPY.hero.exploreButton}
            onClick={onExplore}
          />

          <div className="pt-1.5 border-t border-[#3A0F34]/15">
            <span className="font-sans font-bold text-[8.5px] uppercase tracking-[0.12em] text-[#3A0F34]/70">
              {stats.startups} STARTUPS • {stats.investors} INVESTORS • {stats.incubators} INCUBATORS
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
};
