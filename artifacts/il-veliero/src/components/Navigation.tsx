import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import gsap from 'gsap';
import { useNav } from './NavigationContext';
import MenuTrigger from './MenuTrigger';
import shipLogoUrl from '@assets/sailing-ship-silhouette-000000-xl_1777459411002.png';

type Section =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'anchor'; label: string; anchor: string };

/**
 * Five flat top-level entries. Galleria and About are real, dedicated routes;
 * Blog, Camere, and Contact us all jump to anchors on the home page so the
 * site stays focused and short.
 */
const SECTIONS: Section[] = [
  { kind: 'anchor', label: 'Blog',       anchor: 'cosa-fare' },
  { kind: 'anchor', label: 'Camere',     anchor: 'dimore-teaser' },
  { kind: 'link',   label: 'Galleria',   href:   '/gallery' },
  { kind: 'link',   label: 'About',      href:   '/about' },
  { kind: 'anchor', label: 'Contact us', anchor: 'footer' },
];

/**
 * Top-of-page horizontal bar that reveals right→left across the viewport,
 * matching the visual height of the home / inner page header so it reads as
 * the same band of UI just re-skinned. Items stagger in from the right edge
 * so the eye follows the wipe direction.
 *
 * The bar contains its own brand mark on the left and its own MenuTrigger on
 * the right (the trigger button thus always appears on top of the panel —
 * no z-index gymnastics required against the underlying page header).
 */
export default function Navigation() {
  const { isOpen, close } = useNav();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [, setLocation] = useLocation();

  // Build the open/close timeline once.
  useEffect(() => {
    if (
      !panelRef.current ||
      !backdropRef.current ||
      !itemsRef.current ||
      !brandRef.current ||
      !triggerWrapRef.current
    ) return;
    const items = itemsRef.current.querySelectorAll<HTMLElement>('.nav-item');

    // GSAP fully owns visibility/opacity via autoAlpha and clipPath; React
    // never re-applies these or it would clobber GSAP on re-render.
    gsap.set(backdropRef.current, { autoAlpha: 0 });
    gsap.set(panelRef.current, {
      autoAlpha: 1,
      clipPath: 'inset(0% 0% 0% 100%)',
    });
    gsap.set(brandRef.current, { autoAlpha: 0, x: 12 });
    gsap.set(triggerWrapRef.current, { autoAlpha: 0 });

    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
        0
      )
      // Right → left reveal of the bar itself.
      .fromTo(
        panelRef.current,
        { clipPath: 'inset(0% 0% 0% 100%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' },
        0
      )
      // The trigger appears as soon as the right edge starts unrolling so
      // there is always a visible close affordance.
      .to(triggerWrapRef.current, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0)
      // Links cascade in from the right — `from: 'end'` so the rightmost
      // link appears first, following the wipe direction.
      .fromTo(
        items,
        { x: 24, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power3.out',
          stagger: { each: 0.06, from: 'end' },
        },
        0.15
      )
      // Brand on the left appears last, after the wipe has crossed it.
      .to(brandRef.current, { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.4);

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
      {/* Invisible click-catch behind the bar so a tap outside the bar
          closes the menu. The bar itself sits on top, so clicks on its own
          area are received normally. */}
      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[180] bg-black/10 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        data-testid="nav-backdrop"
      />

      {/* Full-width horizontal bar at the top of the viewport. Same vertical
          rhythm as the page headers (px-8 py-6) and a thin gold underline so
          it reads as a re-skinned header rather than a new component. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        aria-hidden={!isOpen}
        className={`fixed top-0 left-0 right-0 z-[200] bg-[#0A1128] text-white border-b border-[#D4AF37]/25 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)] ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        data-testid="nav-overlay"
      >
        <div className="flex items-center justify-between gap-6 px-8 py-6">
          {/* Brand mark — mirrors the page header so the swap looks like a
              re-styling of the same band. */}
          <div ref={brandRef} className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-7 h-7"
              style={{
                backgroundColor: '#FFFFFF',
                WebkitMaskImage: `url(${shipLogoUrl})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskImage: `url(${shipLogoUrl})`,
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
                maskPosition: 'center',
              }}
              aria-hidden="true"
            />
            <div className="text-base tracking-[0.3em] font-serif uppercase text-white leading-none">
              il veliero
              <span className="text-[#D4AF37] ml-2 text-xs opacity-80">★★★</span>
            </div>
          </div>

          {/* Horizontal links. On narrow screens we still keep them in a row
              and let them shrink — five short Italian words easily fit. */}
          <ul
            ref={itemsRef}
            className="flex items-center gap-3 sm:gap-6 md:gap-10 flex-1 justify-end pr-4"
          >
            {SECTIONS.map((section) => {
              const itemClass =
                'nav-item group inline-flex items-center text-[11px] sm:text-xs tracking-[0.3em] uppercase text-white/85 hover:text-[#D4AF37] transition-colors duration-300';
              const labelInner = (
                <span className="relative inline-block pb-1">
                  {section.label}
                  <span className="absolute left-0 right-0 bottom-0 h-px bg-[#D4AF37] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </span>
              );

              if (section.kind === 'anchor') {
                return (
                  <li key={section.label}>
                    <button
                      type="button"
                      onClick={() => scrollToAnchor(section.anchor)}
                      className={`${itemClass} bg-transparent border-0 cursor-pointer p-0`}
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

          {/* The trigger lives inside the bar so it sits naturally on top
              of it — clicking the anchor closes the menu. */}
          <div ref={triggerWrapRef} className="flex-shrink-0">
            <MenuTrigger className="text-white hover:text-[#D4AF37] transition-colors" />
          </div>
        </div>
      </div>
    </>
  );
}
