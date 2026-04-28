import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WindLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll<HTMLElement>('.wind-line');

    lines.forEach((line, i) => {
      const duration = gsap.utils.random(15, 25);
      const topVh = (i + 1) * 14;
      const startX = i < 3 ? `${i * 25}vw` : '-20vw';

      gsap.set(line, {
        x: startX,
        top: topVh + 'vh',
        opacity: gsap.utils.random(0.05, 0.15),
      });

      gsap.to(line, {
        x: '120vw',
        duration,
        repeat: -1,
        ease: 'none',
        delay: i < 3 ? 0 : i * 1.5,
        onRepeat: () => {
          gsap.set(line, {
            top: gsap.utils.random(5, 90) + 'vh',
            x: '-20vw',
            opacity: gsap.utils.random(0.05, 0.15),
          });
        },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="wind-line absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          style={{ top: 0, left: 0 }}
        />
      ))}
    </div>
  );
}
