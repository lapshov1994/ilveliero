import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';

type Section =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'anchor'; label: string; anchor: string };

/**
 * Five flat top-level entries. Galleria and About are real, dedicated routes;
 * Blog, Camere, and Contact us all jump to anchors on the home page so the
 * site stays focused and short.
 *  - Blog       → "Cosa fare a San Vito" carousel inside the footer
 *  - Camere     → DimoreTeaser section (rooms preview on the home page)
 *  - Galleria   → /gallery (dedicated)
 *  - About      → /about (dedicated)
 *  - Contact us → footer with address / phone / email
 */
const SECTIONS: Section[] = [
  { kind: 'anchor', label: 'Blog',       anchor: 'cosa-fare' },
  { kind: 'anchor', label: 'Camere',     anchor: 'dimore-teaser' },
  { kind: 'link',   label: 'Galleria',   href:   '/gallery' },
  { kind: 'link',   label: 'About',      href:   '/about' },
  { kind: 'anchor', label: 'Contact us', anchor: 'footer' },
];

export default function Navigation() {
  const { isOpen, close } = useNav();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [, setLocation] = useLocation();

  // Build the open/close timeline once.
  useEffect(() => {
    if (!panelRef.current || !backdropRef.current || !itemsRef.current) return;
    const items = itemsRef.current.querySelectorAll<HTMLElement>('.nav-item');

    // Initial state: hidden via autoAlpha (which sets visibility: hidden +
    // opacity: 0). This avoids relying on inline React styles that React
    // would re-apply on every render and clobber GSAP.
    gsap.set([backdropRef.current, panelRef.current], { autoAlpha: 0 });

    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
        0
      )
      .fromTo(
        panelRef.current,
        { y: -16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' },
        0
      )
      .fromTo(
        items,
        { x: 16, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out', stagger: 0.05 },
        0.1
      );

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  // Drive the timeline from the open state.
  useEffect(() => {
    if (!tlRef.current) return;
    if (isOpen) tlRef.current.play();
    else tlRef.current.reverse();
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Smooth-scroll to in-page anchor. If on a different route, navigate home
  // first then poll up to ~2s for the target to mount.
  const scrollToAnchor = (anchorId: string) => {
    close();
    const MAX_ATTEMPTS = 120;
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
      requestAnimationFrame(() => requestAnimationFrame(() => tryScroll()));
    } else {
      tryScroll();
    }
  };

  return (
    <>
      {/* Soft backdrop — clicking it closes the menu without obscuring more
          than a third of the page. GSAP fully owns visibility/opacity via
          `autoAlpha`; we never re-set those properties from React or React
          would clobber GSAP on every re-render. */}
      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[180] bg-black/35 backdrop-blur-[2px] ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        data-testid="nav-backdrop"
      />

      {/* Compact slide-down panel anchored to the top-right of the viewport.
          Sized like a premium hotel mini-menu — never fullscreen. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        aria-hidden={!isOpen}
        className={`fixed z-[200] top-3 right-3 md:top-4 md:right-6 w-[min(20rem,calc(100vw-1.5rem))] bg-[#0A1128] text-white rounded-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 overflow-hidden ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        data-testid="nav-overlay"
      >
        {/* Top brand row — leaves space for the trigger button to sit above
            the panel; we deliberately do NOT cover the trigger. */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/50">Il Veliero</span>
          <span className="text-[#D4AF37] text-xs">★★★</span>
        </div>

        <ul ref={itemsRef} className="py-2">
          {SECTIONS.map((section) => {
            const itemClass =
              'nav-item group relative flex items-center justify-between gap-4 px-5 py-3 text-base font-light tracking-wide transition-colors duration-300 hover:bg-white/5';
            const labelInner = (
              <>
                <span className="font-serif text-[1.05rem] text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                  {section.label}
                </span>
                <span className="text-[#D4AF37]/60 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            );

            if (section.kind === 'anchor') {
              return (
                <li key={section.label}>
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(section.anchor)}
                    className={`${itemClass} w-full text-left bg-transparent border-0 cursor-pointer`}
                    data-testid={`nav-link-${section.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {labelInner}
                  </button>
                </li>
              );
            }
            return (
              <li key={section.label}>
                <Link
                  href={section.href}
                  onClick={close}
                  className={itemClass}
                  data-testid={`nav-link-${section.label.toLowerCase()}`}
                >
                  {labelInner}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between text-[9px] tracking-[0.3em] uppercase text-white/40">
          <span>San Vito Lo Capo</span>
          <span className="text-[#D4AF37]/70">+39 0923 000 000</span>
        </div>
      </div>
    </>
  );
}
