import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SandFilter() {
  const layerRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layerRef.current || !tintRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(tintRef.current, { opacity: 0.55 });
      gsap.to(tintRef.current, {
        opacity: 0.95,
        duration: 4.2,
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
  }, []);

  return (
    <div
      ref={layerRef}
      className="fixed inset-0 z-[90] pointer-events-none"
      aria-hidden="true"
      data-testid="sand-filter"
    >
      <div
        ref={tintRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(228, 196, 136, 0.18) 0%, rgba(212, 175, 55, 0.10) 45%, rgba(186, 138, 76, 0.14) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
