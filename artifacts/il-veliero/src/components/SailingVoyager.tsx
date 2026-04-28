import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SailingVoyager
 * --------------
 * A large, ghostly gold sailboat that drifts diagonally across the viewport
 * as the visitor scrolls through the Story / Family / Services span. It sits
 * BEHIND the page content (z-2) while the OceanicAtmosphere wave layer (z-5)
 * passes in front of it — producing a watermark, deeper-than-the-sea feel.
 *
 * Mounted once globally from App.tsx. The ScrollTrigger is bound to
 * `#voyager-track`; if that element does not exist on the current route
 * (e.g. inner pages /rooms, /gallery, /blog) the component renders nothing
 * to avoid a broken trigger and visual clutter.
 */
export default function SailingVoyager() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const isHome = location === '/' || location === '';

  useEffect(() => {
    if (!isHome || !wrapperRef.current) return;

    // Wait for the home route to commit and #voyager-track to exist.
    const track = document.getElementById('voyager-track');
    if (!track) return;

    const ctx = gsap.context(() => {
      gsap.to(wrapperRef.current, {
        x: '120vw',
        y: '40vh',
        rotation: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '#voyager-track',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });
    });

    return () => ctx.revert();
  }, [isHome]);

  // Render nothing on inner routes so the fixed wrapper doesn't leave a
  // static gold smudge on /rooms, /gallery, /blog.
  if (!isHome) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed top-[20%] left-[-20vw] w-[300px] z-[2] pointer-events-none"
      style={{ opacity: 0.12 }}
      aria-hidden="true"
      data-testid="background-voyager"
    >
      <svg
        viewBox="0 0 300 300"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* Mast */}
        <line
          x1="150" y1="30" x2="150" y2="220"
          stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"
        />

        {/* Pennant at the masthead */}
        <path
          d="M150 30 L172 36 L156 44 Z"
          fill="#D4AF37" stroke="#D4AF37" strokeWidth="1" strokeLinejoin="round"
        />

        {/* Mainsail — large triangle aft of the mast */}
        <path
          d="M150 40 L150 215 L240 215 Z"
          fill="#D4AF37" fillOpacity="0.10"
          stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round"
        />

        {/* Jib — smaller triangle forward of the mast */}
        <path
          d="M150 55 L150 200 L78 200 Z"
          fill="#D4AF37" fillOpacity="0.08"
          stroke="#D4AF37" strokeWidth="1.25" strokeLinejoin="round"
        />

        {/* Boom — horizontal spar at the foot of the mainsail */}
        <line
          x1="150" y1="215" x2="240" y2="215"
          stroke="#D4AF37" strokeWidth="1" strokeLinecap="round"
        />

        {/* Hull — slim curved keel silhouette */}
        <path
          d="M40 220 Q150 282 260 220 Q220 240 150 240 Q80 240 40 220 Z"
          fill="#D4AF37" fillOpacity="0.18"
          stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round"
        />

        {/* Waterline */}
        <line
          x1="20" y1="252" x2="280" y2="252"
          stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.6"
        />
      </svg>
    </div>
  );
}
