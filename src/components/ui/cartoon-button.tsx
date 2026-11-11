"use client";

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export interface CartoonButtonProps {
  label: string;
  variant?: 'marigold' | 'aubergine' | 'ice-silver' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  color?: string; // fallback custom class
  hasHighlight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function CartoonButton({
  label,
  variant = 'marigold',
  size = 'md',
  color,
  hasHighlight = true,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  href,
  onClick,
  className = '',
  style,
  type = 'button',
  'aria-label': ariaLabel,
}: CartoonButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  // Size mappings
  const sizeClasses = {
    sm: 'h-9 px-4 text-xs font-bold tracking-[0.1em]',
    md: 'h-11 px-5 text-xs sm:text-sm font-extrabold tracking-[0.12em]',
    lg: 'h-13 px-7 text-sm sm:text-base font-extrabold tracking-[0.14em]',
  }[size];

  // Variant themes mapped to Vizag Startup Map palette
  const variantClasses = {
    marigold:
      'bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[0_4px_0_0_#3A0F34] hover:shadow-[0_6px_0_0_#3A0F34] hover:bg-[#ffbe1a]',
    aubergine:
      'bg-[#3A0F34] text-[#DDE3E8] border-2 border-[#EAAA00] shadow-[0_4px_0_0_#EAAA00] hover:shadow-[0_6px_0_0_#EAAA00] hover:bg-[#4d1445]',
    'ice-silver':
      'bg-[#DDE3E8] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[0_4px_0_0_#3A0F34] hover:shadow-[0_6px_0_0_#3A0F34] hover:bg-white',
    outline:
      'bg-transparent text-[#3A0F34] border-2 border-[#3A0F34] shadow-[0_4px_0_0_#3A0F34] hover:bg-[#3A0F34]/5',
  }[variant];

  const buttonStyle = `
    relative inline-flex items-center justify-center gap-2 rounded-full font-display uppercase
    transition-all duration-150 ease-out select-none overflow-hidden group cursor-pointer
    ${color || variantClasses}
    ${sizeClasses}
    ${
      disabled || loading
        ? 'opacity-60 pointer-events-none cursor-not-allowed shadow-[0_2px_0_0_#3A0F34]'
        : 'hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_0_#3A0F34]'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
      {hasHighlight && !disabled && !loading && (
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-[-120%] w-16 h-28 bg-white/40 -translate-y-1/2 rotate-12 transition-all duration-700 ease-in-out group-hover:left-[220%] pointer-events-none"
        />
      )}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link
        href={href}
        className={buttonStyle}
        style={style}
        aria-label={ariaLabel || label}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={buttonStyle}
      style={style}
      aria-label={ariaLabel || label}
    >
      {content}
    </button>
  );
}

export default CartoonButton;

