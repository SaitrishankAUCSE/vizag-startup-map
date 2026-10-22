'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FlowerProps {
  className?: string;
}

export const Flower: React.FC<FlowerProps> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative select-none pointer-events-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* Warm Marigold Atmosphere Radial Glow */}
      <div
        className="absolute inset-0 w-[140%] h-[140%] rounded-full opacity-35 filter blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(234, 170, 0, 0.45) 0%, rgba(234, 170, 0, 0.12) 40%, transparent 70%)',
          transform: 'translate(-15%, -15%)',
        }}
      />

      {/* Gentle organic botanical sway */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                rotate: [-1.5, 1.5, -1.5],
              }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        style={{ transformOrigin: 'bottom right' }}
        className="relative w-full h-full"
      >
        <svg
          viewBox="0 0 340 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_16px_30px_rgba(58,15,52,0.22)]"
        >
          <defs>
            {/* Soft glowing rim filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Petal shading for organic depth */}
            <linearGradient id="lilyAubergine" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#4A1444" />
              <stop offset="50%" stopColor="#3A0F34" />
              <stop offset="100%" stopColor="#2D0B28" />
            </linearGradient>

            <linearGradient id="backPetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#330C2E" />
              <stop offset="100%" stopColor="#250822" />
            </linearGradient>
          </defs>

          {/* Gracefully arched slender stem */}
          <path
            d="M 245 440 C 235 340 195 240 170 175"
            stroke="#3A0F34"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Slender botanical leaf */}
          <path
            d="M 215 310 C 160 300 115 330 95 375 C 135 375 185 350 215 310 Z"
            fill="#3A0F34"
            opacity="0.85"
          />

          {/* Marigold Rim Light Layer */}
          <g filter="url(#softGlow)" opacity="0.6">
            {/* Rear Petal Left */}
            <path
              d="M 170 175 C 130 140 70 100 50 120 C 35 140 75 180 170 175 Z"
              stroke="#EAAA00"
              strokeWidth="2"
              fill="none"
            />
            {/* Rear Petal Right */}
            <path
              d="M 170 175 C 210 130 270 95 295 115 C 310 135 270 175 170 175 Z"
              stroke="#EAAA00"
              strokeWidth="2"
              fill="none"
            />
            {/* Center Tall Petal */}
            <path
              d="M 170 175 C 145 95 140 30 170 10 C 200 30 195 95 170 175 Z"
              stroke="#EAAA00"
              strokeWidth="2"
              fill="none"
            />
            {/* Front Petal Left Flaring */}
            <path
              d="M 170 175 C 110 200 65 240 60 285 C 95 285 140 240 170 175 Z"
              stroke="#EAAA00"
              strokeWidth="2"
              fill="none"
            />
            {/* Front Petal Right Flaring */}
            <path
              d="M 170 175 C 225 195 275 235 285 280 C 250 285 200 240 170 175 Z"
              stroke="#EAAA00"
              strokeWidth="2"
              fill="none"
            />
          </g>

          {/* Rear Petals (Darker, adds 3D depth) */}
          <path
            d="M 170 175 C 130 140 70 100 50 120 C 35 140 75 180 170 175 Z"
            fill="url(#backPetal)"
          />
          <path
            d="M 170 175 C 210 130 270 95 295 115 C 310 135 270 175 170 175 Z"
            fill="url(#backPetal)"
          />

          {/* Center Tall Upright Petal (Curved S-flare) */}
          <path
            d="M 170 175 C 145 95 140 30 170 10 C 200 30 195 95 170 175 Z"
            fill="url(#lilyAubergine)"
          />

          {/* Foreground Flaring Petals (Curving outward gracefully like a true lily) */}
          <path
            d="M 170 175 C 110 200 65 240 60 285 C 95 285 140 240 170 175 Z"
            fill="url(#lilyAubergine)"
          />
          <path
            d="M 170 175 C 225 195 275 235 285 280 C 250 285 200 240 170 175 Z"
            fill="url(#lilyAubergine)"
          />

          {/* Petal midrib veins (Delicate Aubergine & Marigold whispers) */}
          <path
            d="M 170 175 Q 168 95 170 20"
            stroke="#EAAA00"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <path
            d="M 170 175 Q 115 220 75 275"
            stroke="#EAAA00"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M 170 175 Q 225 215 270 270"
            stroke="#EAAA00"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Long arching lily filaments with glowing golden anthers */}
          <g>
            {/* Filament 1 - Left */}
            <path
              d="M 170 175 C 155 145 130 125 115 105"
              stroke="#EAAA00"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <ellipse cx="114" cy="103" rx="3.5" ry="6" transform="rotate(-35 114 103)" fill="#EAAA00" />

            {/* Filament 2 - Center Left */}
            <path
              d="M 170 175 C 165 135 155 100 152 75"
              stroke="#EAAA00"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <ellipse cx="152" cy="73" rx="3.5" ry="6" transform="rotate(-10 152 73)" fill="#EAAA00" />

            {/* Filament 3 - Center Right */}
            <path
              d="M 170 175 C 175 135 185 100 188 75"
              stroke="#EAAA00"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <ellipse cx="188" cy="73" rx="3.5" ry="6" transform="rotate(10 188 73)" fill="#EAAA00" />

            {/* Filament 4 - Right */}
            <path
              d="M 170 175 C 185 145 210 125 225 105"
              stroke="#EAAA00"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <ellipse cx="226" cy="103" rx="3.5" ry="6" transform="rotate(35 226 103)" fill="#EAAA00" />

            {/* Central Pistil */}
            <circle cx="170" cy="175" r="5" fill="#EAAA00" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
