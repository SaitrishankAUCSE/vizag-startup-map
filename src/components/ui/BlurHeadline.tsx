'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BlurHeadlineProps {
  lines?: string[];
  className?: string;
  mixedCase?: boolean;
}

export const BlurHeadline: React.FC<BlurHeadlineProps> = ({
  lines = ['Vizag', 'Builds', 'by the Bay.'],
  className = '',
  mixedCase = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative select-none flex flex-col font-display font-extrabold tracking-[-0.03em] leading-[0.94] ${
        mixedCase ? '' : 'uppercase'
      } ${className}`}
      style={{
        fontSize: 'clamp(36px, 5.2vw, 76px)',
      }}
    >
      {lines.map((line, lineIndex) => {
        if (shouldReduceMotion) {
          return (
            <span
              key={lineIndex}
              className="relative text-[#3A0F34] block"
            >
              {line}
            </span>
          );
        }

        return (
          <div key={lineIndex} className="relative block overflow-visible">
            {/* Marigold Ghost 2 (shifted 22px, blurred 14px, 18% opacity) */}
            <motion.span
              aria-hidden="true"
              initial={{
                x: 22,
                filter: 'blur(14px)',
                opacity: 0.18,
              }}
              animate={{
                x: 0,
                filter: 'blur(0px)',
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                delay: lineIndex * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-0 top-0 text-[#EAAA00] pointer-events-none select-none"
            >
              {line}
            </motion.span>

            {/* Marigold Ghost 1 (shifted 10px, blurred 6px, 35% opacity) */}
            <motion.span
              aria-hidden="true"
              initial={{
                x: 10,
                filter: 'blur(6px)',
                opacity: 0.35,
              }}
              animate={{
                x: 0,
                filter: 'blur(0px)',
                opacity: 0,
              }}
              transition={{
                duration: 1.2,
                delay: lineIndex * 0.1 + 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-0 top-0 text-[#EAAA00] pointer-events-none select-none"
            >
              {line}
            </motion.span>

            {/* Sharp Aubergine front layer */}
            <motion.span
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: lineIndex * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative text-[#3A0F34] block z-10"
            >
              {line}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};
