import React from 'react';
import { useNav } from './NavigationContext';

interface Props {
  className?: string;
}

export default function MenuTrigger({ className = '' }: Props) {
  const { toggle, isOpen } = useNav();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
      aria-expanded={isOpen}
      data-testid="btn-menu"
      className={`relative inline-flex items-center gap-3 cursor-pointer bg-transparent border-none p-0 ${className}`}
    >
      {/* Hamburger lines — visible only when closed */}
      <span
        className={`relative w-5 h-[14px] flex-shrink-0 transition-opacity duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <span className="absolute left-0 right-0 top-0 h-[1.5px] bg-current" />
        <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-current" />
        <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-current" />
      </span>

      {/* Anchor icon — visible only when open */}
      <span
        className={`absolute left-0 inline-flex w-5 h-5 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="5" r="2.4" />
          <line x1="12" y1="7.4" x2="12" y2="22" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <path d="M5 15a7 7 0 0 0 14 0" />
        </svg>
      </span>

      {/* Word "Menu" — fades to anchor word position */}
      <span className="relative inline-flex items-center min-w-[3.5rem]">
        <span
          className={`text-xs tracking-[0.25em] uppercase transition-opacity duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
          data-testid="menu-label-closed"
        >
          Menu
        </span>
        <span
          className={`absolute inset-0 flex items-center text-xs tracking-[0.25em] uppercase transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          data-testid="menu-label-open"
        >
          Chiudi
        </span>
      </span>

      <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#D4AF37] origin-left scale-x-0 hover:scale-x-100 transition-transform duration-300" />
    </button>
  );
}
