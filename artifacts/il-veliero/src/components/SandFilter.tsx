import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

// Warm sand grain. The feComponentTransfer step turns the smooth
// turbulence into sharper, more visible specks (the discrete table
// values clip the low end to fully transparent and ramp up quickly,
// which reads as actual sand grains rather than a haze).
const SAND_TEXTURE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>" +
  "<filter id='s'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='7' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.6   0 0 0 0 0.42   0 0 0 0 0.18   0 0 0 1 0'/>" +
  "<feComponentTransfer><feFuncA type='discrete' tableValues='0 0 0 0.4 0.7 0.95 1'/></feComponentTransfer>" +
  "</filter>" +
  "<rect width='100%' height='100%' filter='url(%23s)'/>" +
  "</svg>\")";

// Bright cream highlights — paired with mix-blend-soft-light so the
// grain reads like sun glints on dark areas without ever turning the
// whole page into a beige fog.
const SAND_TEXTURE_FINE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" +
  "<filter id='sf'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' seed='12' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 1   0 0 0 0 0.92   0 0 0 0 0.7   0 0 0 1 0'/>" +
  "<feComponentTransfer><feFuncA type='discrete' tableValues='0 0 0.3 0.7 1'/></feComponentTransfer>" +
  "</filter>" +
  "<rect width='100%' height='100%' filter='url(%23sf)'/>" +
  "</svg>\")";

export default function SandFilter() {
  const [location] = useLocation();
  const bodyLayerRef = useRef<HTMLDivElement>(null);
  const headerLayerRef = useRef<HTMLDivElement>(null);

  const isHome = location === '/' || location === '';

  /*
   * Geometry-of-sand explainer
   * --------------------------
   * The user wants:
   *   • the hero video, the booking widget AND the marquee strip to be
   *     SAND-FREE while the page is at scroll = 0;
   *   • the sand to "rise" up from below the marquee as the user
   *     scrolls, eventually filling the viewport;
   *   • the sand to be SOLID and visible everywhere below the hero,
   *     never disappearing.
   *
   * Implementation:
   *   • The body sand layer is `position: fixed` and its `top` is set
   *     each frame to `max(0, marqueeBottomYInViewport)`. At scroll = 0
   *     `top` ≈ height of (hero + booking + marquee), so the sand is
   *     entirely BELOW the marquee — none of it covers the video,
   *     widget, or marquee. As the user scrolls, the marquee bottom
   *     slides up the viewport, the sand's `top` shrinks toward 0, and
   *     once the marquee has fully scrolled off, `top = 0` and the
   *     sand fills the viewport.
   *   • Body sand opacity is constant (1.0): no fading, no flicker,
   *     no "sometimes the sand disappears". The visibility transition
   *     is handled purely by the `top` clip.
   *   • Header sand strip opacity is tied to scroll progress through
   *     the hero so the dark sticky header only gains its sandy band
   *     once it has actually started overlapping content (otherwise
   *     it would look like a band of warm noise on top of the video).
   */
  useEffect(() => {
    if (!isHome) return;
    const body = bodyLayerRef.current;
    const head = headerLayerRef.current;
    if (!body || !head) return;

    let heroEndDocY = 1; // absolute Y of the marquee bottom in document coords
    let lastTop = -1;
    let lastHeadOpacity = -1;
    let rafId = 0;
    let alive = true;

    // Cache the marquee element once and re-resolve only if it
    // disappears (e.g. route swap) — DOM lookups every frame are
    // wasteful but reading `getBoundingClientRect` is cheap.
    let heroEl: HTMLElement | null = null;
    const resolveHeroEl = () => {
      if (!heroEl || !heroEl.isConnected) {
        heroEl = document.querySelector<HTMLElement>('[data-hero-end]');
      }
      return heroEl;
    };

    const measure = () => {
      // The marquee section in Hero.tsx carries `data-hero-end`. Its
      // bottom edge is the line that separates the SAND-FREE hero
      // region (above) from the SANDY content region (below).
      const el = resolveHeroEl();
      if (el) {
        const r = el.getBoundingClientRect();
        const sy = window.scrollY || document.documentElement.scrollTop || 0;
        heroEndDocY = Math.max(1, r.bottom + sy);
      } else {
        heroEndDocY = window.innerHeight;
      }
    };

    const tick = () => {
      if (!alive) return;
      // Re-measure each frame so the sand boundary survives ANY late
      // layout shift above the marquee — image loads, font swaps,
      // mobile dynamic viewport, smooth-scroll bounces etc. The cost
      // is one cached getBoundingClientRect call per frame.
      measure();
      const sy = window.scrollY || document.documentElement.scrollTop || 0;

      // How far down the viewport the body-sand layer should START.
      // `heroEndDocY - sy` = where the marquee bottom sits in viewport
      // coords; clamped at 0 so once we scroll past the marquee the
      // sand is glued to the viewport top.
      const sandTop = Math.max(0, heroEndDocY - sy);
      if (Math.abs(sandTop - lastTop) > 0.5) {
        body.style.top = `${sandTop}px`;
        lastTop = sandTop;
      }

      // Header strip: 0 sand at the very top of the page (so the
      // header logo sits cleanly on the dark video) → 1 sand once we
      // have scrolled half-way through the hero. Tied to scroll, not
      // to a class, so the transition is perfectly smooth under
      // Lenis smooth scroll.
      const headProgress = Math.min(1, sy / Math.max(1, heroEndDocY * 0.6));
      if (Math.abs(headProgress - lastHeadOpacity) > 0.005) {
        head.style.opacity = String(headProgress);
        lastHeadOpacity = headProgress;
      }

      rafId = requestAnimationFrame(tick);
    };

    const onResize = () => measure();

    measure();
    requestAnimationFrame(measure);
    const settleTimer = window.setTimeout(measure, 1200);

    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    // Watch the marquee for size changes (e.g. font load shifts the
    // strip's height by a pixel or two) without polling forever.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      const el = resolveHeroEl();
      if (el) ro.observe(el);
    }

    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      window.clearTimeout(settleTimer);
      if (ro) ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome, location]);

  if (!isHome) return null;

  return (
    <div aria-hidden="true" data-testid="sand-filter">
      {/*
        Body sand — a fixed layer whose `top` is animated by the rAF
        tick above. Bottom/right/left = 0 so it always paints from
        `top` down to the bottom of the viewport. Opacity is locked
        at 1: visibility is controlled purely by the clip from `top`,
        which avoids the "sand pulses / disappears" feel of an
        opacity-tied implementation.
      */}
      {/*
        Outer opacity capped at 0.55: at this level the warm grain
        reads as a tactile film over light sections (Story / Family /
        Services / DimoreTeaser) without turning the dark navy footer
        into a wall of static. Visibility on / off is governed by the
        animated `top` clip below, NOT by opacity.
      */}
      <div
        ref={bodyLayerRef}
        className="fixed left-0 right-0 bottom-0 z-[105] pointer-events-none"
        style={{ top: '100vh', opacity: 0.55 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: SAND_TEXTURE,
            backgroundRepeat: 'repeat',
            backgroundSize: '240px 240px',
            opacity: 0.42,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: SAND_TEXTURE_FINE,
            backgroundRepeat: 'repeat',
            backgroundSize: '140px 140px',
            opacity: 0.75,
            mixBlendMode: 'soft-light',
          }}
        />
      </div>

      {/*
        Header sand strip — fixed at the very top of the viewport.
        Starts fully transparent (so the hero video shows through
        cleanly with no warm haze) and gains opacity as the user
        scrolls through the hero, perfectly matching the dark sticky
        header's own glassmorphic state change.
      */}
      <div
        ref={headerLayerRef}
        className="fixed top-0 left-0 right-0 h-[120px] z-[160] pointer-events-none"
        style={{
          opacity: 0,
          maskImage:
            'linear-gradient(to bottom, black 0px, black 80px, transparent 120px)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0px, black 80px, transparent 120px)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: SAND_TEXTURE,
            backgroundRepeat: 'repeat',
            backgroundSize: '240px 240px',
            opacity: 0.42,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: SAND_TEXTURE_FINE,
            backgroundRepeat: 'repeat',
            backgroundSize: '140px 140px',
            opacity: 0.75,
            mixBlendMode: 'soft-light',
          }}
        />
      </div>
    </div>
  );
}
