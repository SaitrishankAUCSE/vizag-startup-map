'use client';

import React from 'react';
import { ArrowRight, ChevronDown, Lock } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-sans select-none transition-all duration-200 min-h-[44px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]';

  let variantClasses = '';

  if (variant === 'primary') {
    variantClasses =
      'bg-[#EAAA00] text-[#3A0F34] font-semibold text-[12px] uppercase tracking-[0.12em] px-5 py-3 rounded-full hover:bg-[#3A0F34] hover:text-[#EAAA00] border border-transparent shadow-sm';
  } else if (variant === 'secondary') {
    variantClasses =
      'bg-transparent text-[#3A0F34] font-medium text-[12px] uppercase tracking-[0.12em] px-5 py-3 rounded-full border-[1.5px] border-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8]';
  } else if (variant === 'ghost') {
    variantClasses =
      'bg-transparent text-[#3A0F34] font-medium text-[13px] px-2 py-2 group underline-offset-4 hover:underline';
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/* Circular arrow button: 48px circle, aubergine border, arrow icon; on hover fills marigold and arrow moves 4px right */
export interface CircularArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const CircularArrowButton: React.FC<CircularArrowButtonProps> = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center gap-3.5 group cursor-pointer min-h-[48px] select-none ${className}`}
      {...props}
    >
      <div className="w-12 h-12 rounded-full border-[1.5px] border-[#3A0F34] flex items-center justify-center transition-all duration-200 group-hover:bg-[#EAAA00] group-hover:border-[#EAAA00] text-[#3A0F34] shrink-0">
        <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
      {label && (
        <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.18em] text-[#3A0F34] group-hover:text-[#3A0F34]">
          {label}
        </span>
      )}
    </button>
  );
};

/* Filter chip: pill, aubergine 1.5px border; selected = aubergine fill with silver text; has a small chevron */
export interface FilterChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  count,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] border-[#3A0F34] font-sans text-[12px] font-medium transition-all duration-150 min-h-[38px] cursor-pointer ${
        selected
          ? 'bg-[#3A0F34] text-[#DDE3E8]'
          : 'bg-[#DDE3E8] text-[#3A0F34] hover:bg-[#3A0F34]/[0.08]'
      } ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            selected
              ? 'bg-[#EAAA00] text-[#3A0F34]'
              : 'bg-[#3A0F34]/15 text-[#3A0F34]'
          }`}
        >
          {count}
        </span>
      )}
      <ChevronDown
        className={`w-3.5 h-3.5 transition-transform ${
          selected ? 'rotate-180 text-[#DDE3E8]' : 'text-[#3A0F34]'
        }`}
      />
    </button>
  );
};

/* Segmented toggle (Map / Grid): two options in one pill, selected side filled aubergine */
export interface SegmentedToggleProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedToggle: React.FC<SegmentedToggleProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border-[1.5px] border-[#3A0F34] bg-[#DDE3E8] min-h-[40px] select-none ${className}`}
      role="group"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-[#3A0F34] text-[#DDE3E8]'
                : 'text-[#3A0F34] hover:text-[#3A0F34]/70'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* Pro Badge: small marigold fill pill with aubergine text. Lock icon for locked features */
export interface ProBadgeProps {
  showLock?: boolean;
  className?: string;
}

export const ProBadge: React.FC<ProBadgeProps> = ({
  showLock = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-[#EAAA00] text-[#3A0F34] font-sans font-bold text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${className}`}
    >
      {showLock && <Lock className="w-2.5 h-2.5" />}
      <span>PRO</span>
    </span>
  );
};
