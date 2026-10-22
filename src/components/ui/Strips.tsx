'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StripsProps {
  className?: string;
  animate?: boolean;
}

export const Strips: React.FC<StripsProps> = ({
  className = '',
  animate = true,
}) => {
  // 9 columns on desktop (lg), 4 columns on mobile
  // We can render 9 columns and hide the last 5 on mobile via CSS classes
  const columns = Array.from({ length: 9 });

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-full grid grid-cols-4 lg:grid-cols-9">
        {columns.map((_, index) => (
          <motion.div
            key={index}
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={
              animate
                ? {
                    duration: 0.6,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }
                : { duration: 0 }
            }
            className={`h-full border-r border-[#3A0F34]/[0.12] ${
              index >= 4 ? 'hidden lg:block' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};
