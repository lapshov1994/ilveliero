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
  const layerRef = useRef<HTMLDivElement>(null);
  const coarseRef = useRef<HTMLDivElement>(null);
  const fineRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  // The sand filter is intentionally only present on the home page where it
  // sits over the white "story" sections and the dark hero photograph. On
  // inner pages (rooms / gallery / blog / about) the filter would either
  // muddy the white text on the dark footer or sit over photographs the
  // user wants to see clean.
  const isHome = location === '/' || location === '';

  useEffect(() => {
    if (!layerRef.current) return;
    if (!isHome) return;

    const ctx = gsap.context(() => {
      // Coarse layer uses NORMAL blend — guaranteed visible on any
      // background (bright video, white sections, navy footer). Alpha
      // is tuned so it reads clearly as warm sand grain without dimming
      // the underlying photograph too much.
      gsap.set(coarseRef.current, { opacity: 0.42, scale: 1, x: 0, y: 0 });
      gsap.set(fineRef.current, { opacity: 0.85, x: 0, y: 0 });

      gsap.to(coarseRef.current, {
        opacity: 0.55,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(coarseRef.current, {
        x: '+=14',
        y: '-=10',
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(fineRef.current, {
        opacity: 0.8,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(fineRef.current, {
        x: '-=22',
        y: '+=8',
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const hero = document.querySelector('.hero-section');
      if (hero) {
        gsap.set(layerRef.current, { opacity: 0 });
        gsap.to(layerRef.current, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        });
      } else {
        gsap.set(layerRef.current, { opacity: 1 });
      }
    });

    return () => ctx.revert();
  }, [location, isHome]);

  if (!isHome) return null;

  return (
    <div
      ref={layerRef}
      className="fixed inset-0 z-[90] pointer-events-none"
      aria-hidden="true"
      data-testid="sand-filter"
    >
      {/* Coarse warm-sand layer — NORMAL blend so it always reads, even
          over a fully-saturated bright video frame. Kept at low alpha so
          it never feels like a foggy haze. */}
      <div
        ref={coarseRef}
        className="absolute -inset-8"
        style={{
          backgroundImage: SAND_TEXTURE,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px',
        }}
      />
      {/* Fine cream highlight layer — soft-light keeps it subtle but
          adds the "sun glint" feel on darker areas (footer, hero edges). */}
      <div
        ref={fineRef}
        className="absolute -inset-8"
        style={{
          backgroundImage: SAND_TEXTURE_FINE,
          backgroundRepeat: 'repeat',
          backgroundSize: '140px 140px',
          mixBlendMode: 'soft-light',
        }}
      />
    </div>
  );
}
