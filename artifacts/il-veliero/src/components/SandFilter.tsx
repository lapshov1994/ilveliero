import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SAND_TEXTURE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>" +
  "<filter id='s'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='7' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.85   0 0 0 0 0.7   0 0 0 0 0.42   0 0 0 0.85 0'/>" +
  "</filter>" +
  "<rect width='100%' height='100%' filter='url(%23s)'/>" +
  "</svg>\")";

const SAND_TEXTURE_FINE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" +
  "<filter id='sf'>" +
  "<feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' seed='12' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.95   0 0 0 0 0.82   0 0 0 0 0.55   0 0 0 0.7 0'/>" +
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
      gsap.set(coarseRef.current, { opacity: 0.55, scale: 1, x: 0, y: 0 });
      gsap.set(fineRef.current, { opacity: 0.35, x: 0, y: 0 });

      gsap.to(coarseRef.current, {
        opacity: 0.85,
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
        opacity: 0.6,
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
      <div
        ref={coarseRef}
        className="absolute -inset-8"
        style={{
          backgroundImage: SAND_TEXTURE,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        ref={fineRef}
        className="absolute -inset-8"
        style={{
          backgroundImage: SAND_TEXTURE_FINE,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
