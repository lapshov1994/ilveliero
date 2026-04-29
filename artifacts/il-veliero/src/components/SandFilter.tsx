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

// Vertical mask that softens the filter at the very top (so hero text /
// marquee headings stay readable when the filter is active) and softens
// the bottom 25% of the viewport by 15% (per request — so editorial
// imagery in the lower sections stays cleaner).
const SAND_MASK_GRADIENT =
  'linear-gradient(to bottom, ' +
  'rgba(0,0,0,0.55) 0%, ' +
  'rgba(0,0,0,0.92) 18%, ' +
  'rgba(0,0,0,1) 45%, ' +
  'rgba(0,0,0,1) 70%, ' +
  'rgba(0,0,0,0.85) 100%)';

export default function SandFilter() {
  const layerRef = useRef<HTMLDivElement>(null);
  const coarseRef = useRef<HTMLDivElement>(null);
  const fineRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    if (!layerRef.current) return;

    const ctx = gsap.context(() => {
      // 15% lower than the previous starting opacities (was 0.55 / 0.35).
      gsap.set(coarseRef.current, { opacity: 0.46, scale: 1, x: 0, y: 0 });
      gsap.set(fineRef.current, { opacity: 0.3, x: 0, y: 0 });

      gsap.to(coarseRef.current, {
        opacity: 0.72,
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
        opacity: 0.5,
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
        // Cap reveal at 0.85 so hero text / marquee at the top stay readable
        gsap.to(layerRef.current, {
          opacity: 0.85,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        });
      } else {
        gsap.set(layerRef.current, { opacity: 0.85 });
      }

      // Per the brief: also keep a localised sand reveal on the FIRST
      // editorial image at the bottom of the home page (DimoreTeaser).
      // To avoid two ScrollTriggers fighting for the same opacity
      // property on `layerRef`, we use a SEPARATE overlay layer (`boostRef`
      // via the .sand-boost child) which scrubs independently from 0 to 1
      // and back to 0. The base layer's hero-driven opacity stays intact.
      const dimoreImg = document.querySelector(
        '#dimore-teaser .first-bottom-image'
      );
      const boost = layerRef.current?.querySelector('.sand-boost');
      if (dimoreImg && boost) {
        gsap.set(boost, { opacity: 0 });
        gsap.fromTo(
          boost,
          { opacity: 0 },
          {
            opacity: 0.45,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: dimoreImg,
              start: 'top 90%',
              end: 'top 35%',
              scrub: true,
            },
          }
        );
        gsap.to(boost, {
          opacity: 0,
          ease: 'sine.in',
          scrollTrigger: {
            trigger: dimoreImg,
            start: 'bottom 60%',
            end: 'bottom 10%',
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [location]);

  return (
    <div
      ref={layerRef}
      className="fixed inset-0 z-[90] pointer-events-none"
      style={{
        WebkitMaskImage: SAND_MASK_GRADIENT,
        maskImage: SAND_MASK_GRADIENT,
      }}
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
      {/* Localised "boost" overlay — only animated by the dimore-teaser
          ScrollTrigger so it never fights with the base hero reveal. */}
      <div
        className="sand-boost absolute -inset-8"
        style={{
          backgroundImage: SAND_TEXTURE,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          mixBlendMode: 'multiply',
          opacity: 0,
        }}
      />
    </div>
  );
}
