import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

type Section =
  | { kind: 'link'; label: string; href: string; subtitle: string }
  | { kind: 'anchor'; label: string; anchor: string; subtitle: string };

const SECTIONS: Section[] = [
  { kind: 'link', label: 'Blog', href: '/blog', subtitle: 'Cosa fare a San Vito Lo Capo' },
  { kind: 'link', label: 'Camere', href: '/rooms', subtitle: 'Quattro dimore, quattro venti' },
  { kind: 'link', label: 'Galleria', href: '/gallery', subtitle: 'Quaranta immagini di Sicilia' },
  { kind: 'link', label: 'About', href: '/about', subtitle: "La nostra storia, dal 1987" },
  { kind: 'anchor', label: 'Contact us', anchor: 'footer', subtitle: 'Indirizzo, telefono, email' },
];

export default function Navigation() {
  const { isOpen, close } = useNav();
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!overlayRef.current || !itemsRef.current) return;
    const items = itemsRef.current.querySelectorAll<HTMLElement>('.nav-row');

    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(
        overlayRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.inOut' }
      )
      .fromTo(
        items,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.06 },
        '-=0.2'
      );

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tlRef.current) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      tlRef.current.play();
    } else {
      document.body.style.overflow = '';
      tlRef.current.reverse();
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Smooth-scroll to in-page anchor. If the user is on a different route,
  // navigate home first then poll for the target node — the home route mounts
  // Hero/Story/etc. asynchronously and Lenis/GSAP take a couple of frames to
  // settle, so we keep retrying for up to ~2s before giving up.
  const scrollToAnchor = (anchorId: string) => {
    close();
    const MAX_ATTEMPTS = 120; // ~2s at 60fps
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts < MAX_ATTEMPTS) {
        requestAnimationFrame(() => tryScroll(attempts + 1));
      }
    };
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const onHome = window.location.pathname.replace(/\/$/, '') === baseUrl;
    if (!onHome) {
      setLocation('/');
      // Wait one full frame past the route change before polling — this
      // gives wouter time to swap the tree and Hero to begin mounting.
      requestAnimationFrame(() => requestAnimationFrame(() => tryScroll()));
    } else {
      tryScroll();
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu di navigazione"
      aria-hidden={!isOpen}
      className="fixed inset-0 z-[200] bg-[#0A1128] overflow-y-auto"
      style={{
        pointerEvents: isOpen ? 'all' : 'none',
        opacity: 0,
        transform: 'translateY(-100%)',
      }}
      data-testid="nav-overlay"
    >
      {/* Decorative rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* Brand mark in top-left while menu is open */}
      <div className="fixed top-6 left-8 md:top-8 md:left-12 text-white/60 text-[10px] tracking-[0.35em] uppercase">
        Il Veliero
      </div>

      {/* In-overlay close control. The trigger in the page header sits
          underneath this overlay (z-200), so on touch devices Escape is not
          available; this duplicate close control keeps the menu reachable. */}
      <button
        type="button"
        onClick={close}
        aria-label="Chiudi menu"
        data-testid="btn-menu-close"
        className="fixed top-5 right-6 md:top-7 md:right-10 inline-flex items-center gap-3 text-white hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none p-2 z-[210]"
      >
        <span className="w-5 h-5 inline-flex" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="5" r="2.4" />
            <line x1="12" y1="7.4" x2="12" y2="22" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <path d="M5 15a7 7 0 0 0 14 0" />
          </svg>
        </span>
        <span className="text-xs tracking-[0.25em] uppercase">Chiudi</span>
      </button>

      {/* Five centered links */}
      <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-32">
        <div className="w-full max-w-5xl mx-auto" ref={itemsRef}>
          {SECTIONS.map((section, i) => {
            const number = String(i + 1).padStart(2, '0');
            const rowClass =
              'nav-row group relative flex items-baseline justify-between gap-6 py-7 md:py-8 border-b border-white/10 hover:border-[#D4AF37]/40 transition-colors duration-500';
            const numberClass = 'text-[10px] md:text-xs tracking-[0.35em] uppercase text-white/30 font-light shrink-0 w-10';
            const labelClass =
              'text-5xl md:text-7xl lg:text-8xl font-serif text-white font-light tracking-tight transition-colors duration-500 group-hover:text-[#D4AF37] inline-block';
            const subClass = 'hidden md:block text-[11px] tracking-[0.25em] uppercase text-white/40 font-light text-right';

            const inner = (
              <>
                <span className={numberClass}>{number}</span>
                <span className={`${labelClass} flex-1 ml-4 md:ml-8`}>
                  <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">
                    {section.label}
                  </span>
                </span>
                <span className={subClass}>{section.subtitle}</span>
              </>
            );

            if (section.kind === 'anchor') {
              return (
                <button
                  key={section.label}
                  type="button"
                  onClick={() => scrollToAnchor(section.anchor)}
                  className={`${rowClass} text-left w-full bg-transparent border-0 border-b border-white/10 cursor-pointer`}
                  data-testid={`nav-link-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link
                key={section.label}
                href={section.href}
                onClick={close}
                className={rowClass}
                data-testid={`nav-link-${section.label.toLowerCase()}`}
              >
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Footer signature inside menu */}
        <div className="max-w-5xl mx-auto w-full mt-16 md:mt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white/40 text-[10px] tracking-[0.3em] uppercase">
          <span>San Vito Lo Capo · Sicilia</span>
          <span className="text-[#D4AF37]/70">+39 0923 000 000</span>
        </div>
      </div>
    </div>
  );
}
