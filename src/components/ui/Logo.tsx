'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Colors based on variant
  // 'dark' = aubergine text/pin on silver background
  // 'light' = silver text/pin on aubergine background
  const pinFill = variant === 'dark' ? '#3A0F34' : '#DDE3E8';
  const textColor = variant === 'dark' ? '#3A0F34' : '#DDE3E8';
  const waveStroke = variant === 'dark' ? '#DDE3E8' : '#3A0F34';
  const sunFill = '#EAAA00'; // always marigold

  const dimensionMap = {
    sm: { pin: 28, textVizag: 'text-xl', textSub: 'text-[7px]' },
    md: { pin: 36, textVizag: 'text-2xl', textSub: 'text-[8.5px]' },
    lg: { pin: 48, textVizag: 'text-3xl', textSub: 'text-[11px]' },
  };

  const dim = dimensionMap[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group cursor-pointer select-none transition-opacity ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Vizag Startup Map Home"
    >
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={dim.pin}
          height={dim.pin}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 ease-out"
        >
          {/* Outer pin body */}
          <path
            d="M32 61C32 61 10 40 10 24a22 22 0 0 1 44 0C54 40 32 61 32 61Z"
            fill={pinFill}
          />
          {/* Marigold Rising Sun - Rises 2.5px on hover */}
          <g
            className="transition-transform duration-300 ease-out"
            style={{
              transform: isHovered ? 'translateY(-2.5px)' : 'translateY(0px)',
            }}
          >
            <path d="M23 29a9 9 0 0 1 18 0Z" fill={sunFill} />
          </g>
          {/* Waves of Bay of Bengal - Shift sideways on hover */}
          <g
            className="transition-transform duration-300 ease-out"
            style={{
              transform: isHovered ? 'translateX(2px)' : 'translateX(0px)',
            }}
          >
            <path
              d="M20 34q3-3 6 0t6 0t6 0t6 0"
              stroke={waveStroke}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M24 39q2.5-2.5 5 0t5 0t5 0"
              stroke={waveStroke}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-extrabold tracking-[-0.03em] lowercase ${dim.textVizag}`}
            style={{ color: textColor }}
          >
            vizag
          </span>
          <span
            className={`font-sans font-semibold tracking-[0.3em] uppercase -mt-0.5 ${dim.textSub}`}
            style={{ color: textColor }}
          >
            STARTUP MAP
          </span>
        </div>
      )}
    </Link>
  );
};
