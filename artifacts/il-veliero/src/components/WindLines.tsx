import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll<HTMLElement>('.wind-line');

    lines.forEach((line) => {
      const duration = gsap.utils.random(15, 25);
      const delay = gsap.utils.random(0, 15);

      gsap.set(line, {
        x: '-20vw',
        y: gsap.utils.random(5, 95) + 'vh',
        opacity: gsap.utils.random(0.06, 0.14),
      });

      gsap.fromTo(
        line,
        { x: '-20vw' },
        {
          x: '120vw',
          duration,
          ease: 'none',
          delay,
          repeat: -1,
          onRepeat() {
            gsap.set(line, {
              y: gsap.utils.random(5, 95) + 'vh',
              opacity: gsap.utils.random(0.06, 0.14),
            });
          },
        }
      );
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          style={{ top: 0, left: 0 }}
        />
      ))}
    </div>
  );
}
