import React from 'react';
import { useNav } from './NavigationContext';

interface Props {
  className?: string;
}

/**
 * Menu trigger — purely iconographic, no text label. The closed state shows
 * three minimal hamburger lines; the open state morphs to an oversized
 * anchor (≈ 70% bigger than the hamburger so the swap reads clearly even
 * when glanced quickly). Both states share the same outer click target so
 * the click area never jumps.
 */
export default function MenuTrigger({ className = '' }: Props) {
  const { toggle, isOpen } = useNav();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
      aria-expanded={isOpen}
      data-testid="btn-menu"
      className={`relative inline-flex items-center justify-center cursor-pointer bg-transparent border-none p-2 -m-2 ${className}`}
      style={{ width: 56, height: 56 }}
    >
      {/* Hamburger — visible only when closed */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        aria-hidden="true"
      >
        <span className="relative w-6 h-[18px]">
          <span className="absolute left-0 right-0 top-0 h-[1.5px] bg-current" />
          <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-current" />
          <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-current" />
        </span>
      </span>

      {/* Anchor — visible only when open. ~70% larger than the hamburger
          (10px → 17px equivalent — using a 38px svg to be visually punchy). */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="38"
          height="38"
        >
          <circle cx="12" cy="4.6" r="2.2" />
          <line x1="12" y1="6.8" x2="12" y2="22" />
          <line x1="6.5" y1="11.5" x2="17.5" y2="11.5" />
          <path d="M4 14a8 8 0 0 0 16 0" />
        </svg>
      </span>
    </button>
  );
}
