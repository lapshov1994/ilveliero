import React, { useEffect, useRef } from 'react';
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

  // The sand filter is intentionally only present on the home page where it
  // sits over the white "story" sections and the dark hero photograph. On
  // inner pages (rooms / gallery / blog / about) the filter would either
  // muddy the white text on the dark footer or sit over photographs the
  // user wants to see clean.
  const isHome = location === '/' || location === '';

  // Scroll-tied opacity — implemented as a DIRECT scroll listener
  // instead of a GSAP ScrollTrigger tween. Why:
  //   - GSAP scrub (with or without smoothing) animates opacity via a
  //     ticker, which under Lenis smooth-scroll + bursty touch input
  //     can briefly "catch up" and read as a wave / pop of sand.
  //   - A plain scroll handler that maps scrollY → opacity 1:1 has
  //     ZERO temporal delay: every pixel of scroll deterministically
  //     produces the corresponding opacity. There is no animation
  //     frame race, no scrub catch-up, no jump on load.
  //   - We also seed a small baseline (0.10) so there is no visible
  //     "0 → something" transition the very first time the user
  //     scrolls — the sand was always faintly there.
  useEffect(() => {
    if (!isHome) return;
    const body = bodyLayerRef.current;
    const head = headerLayerRef.current;
    if (!body || !head) return;

    // Progress targets the "Prenota Ora" CTA button: at the very first
    // pixel of scroll the sand is 0%, and it reaches 100% precisely
    // when that button has been scrolled up to the top edge of the
    // viewport. We re-measure the button's document-Y on every resize.
    let endScroll = 1; // never divide by zero
    let lastApplied = -1;
    let rafId = 0;
    let alive = true;

    const measure = () => {
      // Prefer the in-hero CTA. There are several "Prenota" CTAs on the
      // home page (booking widget, reviews section, footer) but the
      // first one in DOM order is the Hero booking widget, which is
      // exactly the anchor the user described.
      const btn = document.querySelector<HTMLElement>('[data-testid="btn-prenota"]');
      if (btn) {
        const r = btn.getBoundingClientRect();
        // Document-Y of the button = its viewport-Y plus current scroll.
        // Use the documentElement's scrollTop too, in case window.scrollY
        // is briefly stale under Lenis.
        const sy = window.scrollY || document.documentElement.scrollTop || 0;
        endScroll = Math.max(1, r.top + sy);
      } else {
        endScroll = window.innerHeight;
      }
    };

    // Continuous rAF tick — does NOT depend on the native 'scroll'
    // event firing. Lenis smooth-scroll occasionally swallows or
    // coalesces scroll events under fast wheel / touch flicks, which
    // is what made the previous listener feel binary. A per-frame
    // poll is cheap (one number compare + one style write at most)
    // and guarantees the opacity tracks scroll exactly.
    const tick = () => {
      if (!alive) return;
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      const tRaw = Math.min(1, Math.max(0, sy / endScroll));
      // Perceptual ramp — a pure-linear opacity curve looks like a
      // hard switch because the sand textures only become visible
      // around opacity ~0.4. A sqrt curve front-loads the visible
      // growth so the very first scroll already shows real grain.
      const t = Math.sqrt(tRaw);
      // Skip the style write when nothing changed (saves layout work
      // when the page is idle). Apply opacity DIRECTLY to each fixed
      // layer (no shared parent) — avoids an opacity-on-parent issue
      // where some browsers fail to propagate parent opacity onto
      // position:fixed descendants when the parent has zero size.
      if (Math.abs(t - lastApplied) > 0.001) {
        // Body layer: starts at 0 and grows to 1 (existing behaviour).
        body.style.opacity = String(t);
        // Header layer: keep a small baseline (0.18) at scroll-top so
        // the header always reads as "sand on navy" — never as flat
        // colour. This is the most expensive part of the brand feel
        // and must never be invisible.
        const headT = 0.18 + (1 - 0.18) * t;
        head.style.opacity = String(headT);
        lastApplied = t;
      }
      rafId = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
    };

    // Measure immediately, again after first paint, and once more
    // after the hero intro animation lands (~1.2s) so any layout
    // shift from the booking widget's fade-in is captured.
    measure();
    requestAnimationFrame(measure);
    const settleTimer = window.setTimeout(measure, 1200);

    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      window.clearTimeout(settleTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome, location]);

  if (!isHome) return null;

  // Two separate sand layers, both static (no animation):
  //
  // 1) Body layer at z-[105] — sits BELOW the photos (z-[110]) and the
  //    headers (z-[150]) so photos stay perfectly clean and the page is
  //    only sandified in the empty / background regions, exactly the
  //    look the user previously approved.
  //
  // 2) Header strip at z-[160] — a fixed band the height of the header
  //    that sits ABOVE the headers (z-[150]) and below the navigation
  //    panel (z-[200]) and the scroll progress bar (z-[165]). This is
  //    the ONLY place sand visibly overlaps the headers, so the rest of
  //    the page (chairs, table, photos, content) keeps its original
  //    sand-respects-photos behaviour. A small bottom fade-out softens
  //    the join into the body sand below.
  return (
    <div aria-hidden="true" data-testid="sand-filter">
      {/* Body sand — original z (BELOW photos at z-110) and original
          opacity. The mask fades the layer to transparent in the top
          100px so this layer NEVER doubles up with the header strip
          below it — the perceived sand density is uniform across the
          page, exactly the texture the user previously approved. */}
      <div
        ref={bodyLayerRef}
        className="fixed inset-0 z-[105] pointer-events-none"
        style={{
          opacity: 0,
          maskImage:
            'linear-gradient(to bottom, transparent 0px, transparent 80px, black 120px)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0px, transparent 80px, black 120px)',
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

      {/* Header sand strip — only paints in the top 120px (the header
          band), at the SAME opacity as the body layer, with a fade-out
          near the bottom that crosses the body layer's fade-in. The
          two layers therefore tile-up to a single, uniform sand
          surface — no double exposure, no visible seam. Starts at a
          small baseline (0.18) so the header is sandified even at the
          very top of the page. */}
      <div
        ref={headerLayerRef}
        className="fixed top-0 left-0 right-0 h-[120px] z-[160] pointer-events-none"
        style={{
          opacity: 0.18,
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
