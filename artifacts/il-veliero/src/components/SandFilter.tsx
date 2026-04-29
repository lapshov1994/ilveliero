import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  // The sand filter is intentionally only present on the home page where it
  // sits over the white "story" sections and the dark hero photograph. On
  // inner pages (rooms / gallery / blog / about) the filter would either
  // muddy the white text on the dark footer or sit over photographs the
  // user wants to see clean.
  const isHome = location === '/' || location === '';

  // Scroll-tied opacity. Initially the entire sand layer (body + header
  // strip) is fully transparent — the hero video and the header read
  // crisp at page load. As the user scrolls the hero out of view, the
  // sand fades in continuously (scrub) until the hero is mostly gone,
  // landing at full opacity for the rest of the page.
  useEffect(() => {
    if (!isHome) return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const hero = document.querySelector('.hero-section');
      if (!hero) {
        gsap.set(wrapperRef.current, { opacity: 1 });
        return;
      }
      gsap.set(wrapperRef.current, { opacity: 0 });
      gsap.to(wrapperRef.current, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          // Begin at the very first pixel of scroll, finish when the
          // booking widget pinned at the bottom of the hero is centred
          // in the viewport (~40vh of scroll). Linear ramp + 1s scrub
          // smoothing gives a buttery, continuous fade.
          start: 'top top',
          end: 'bottom 60%',
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
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
    <div ref={wrapperRef} aria-hidden="true" data-testid="sand-filter">
      {/* Body sand — original z (BELOW photos at z-110) and original
          opacity. The mask fades the layer to transparent in the top
          100px so this layer NEVER doubles up with the header strip
          below it — the perceived sand density is uniform across the
          page, exactly the texture the user previously approved. */}
      <div
        className="fixed inset-0 z-[105] pointer-events-none"
        style={{
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
          surface — no double exposure, no visible seam. */}
      <div
        className="fixed top-0 left-0 right-0 h-[120px] z-[160] pointer-events-none"
        style={{
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
