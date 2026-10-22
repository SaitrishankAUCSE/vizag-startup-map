'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BlurHeadlineProps {
  lines?: string[];
  className?: string;
}

export const BlurHeadline: React.FC<BlurHeadlineProps> = ({
  lines = ['Vizag', 'builds', 'by the bay.'],
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative select-none flex flex-col font-display font-extrabold uppercase tracking-[-0.03em] leading-[0.92] ${className}`}
      style={{
        // clamp dynamically to fit screens cleanly
        fontSize: 'clamp(38px, 4.8vw, 76px)',
      }}
    >
      {lines.map((line, lineIndex) => {
        const isFirst = lineIndex === 0;
        const isLast = lineIndex === lines.length - 1;
        const keepsPermanentTrail = isFirst || isLast;

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
            {/* Ghost 2 (16px shift, 12px blur, 20% opacity) */}
            <motion.span
              aria-hidden="true"
              initial={{
                x: 28,
                filter: 'blur(16px)',
                opacity: 0.45,
              }}
              animate={{
                x: keepsPermanentTrail ? 14 : 0,
                filter: keepsPermanentTrail ? 'blur(10px)' : 'blur(0px)',
                opacity: keepsPermanentTrail ? 0.22 : 0,
              }}
              transition={{
                duration: 1.2,
                delay: lineIndex * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-0 top-0 text-[#3A0F34] pointer-events-none select-none"
            >
              {line}
            </motion.span>

            {/* Ghost 1 (8px shift, 6px blur, 35% opacity) */}
            <motion.span
              aria-hidden="true"
              initial={{
                x: 18,
                filter: 'blur(10px)',
                opacity: 0.6,
              }}
              animate={{
                x: keepsPermanentTrail ? 7 : 0,
                filter: keepsPermanentTrail ? 'blur(5px)' : 'blur(0px)',
                opacity: keepsPermanentTrail ? 0.35 : 0,
              }}
              transition={{
                duration: 1.2,
                delay: lineIndex * 0.15 + 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-0 top-0 text-[#3A0F34] pointer-events-none select-none"
            >
              {line}
            </motion.span>

            {/* Sharp front layer */}
            <motion.span
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                delay: lineIndex * 0.15,
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
