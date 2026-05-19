import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Snowflake,
  Wifi,
  Bath,
  Sparkles,
  Coffee,
  Trees,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  { Icon: Snowflake, label: 'Camere Climatizzate' },
  { Icon: Wifi, label: 'Wi-Fi Gratuito' },
  { Icon: Bath, label: 'Bagno Privato' },
  { Icon: Sparkles, label: 'Pulizia Giornaliera' },
  { Icon: Coffee, label: 'Colazione' },
  { Icon: Trees, label: 'Giardino' },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scope all ScrollTriggers/tweens to a gsap.context so cleanup only
    // reverts THIS component's triggers, not unrelated ones from
    // SandFilter / OceanicAtmosphere / Hero.
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
          }
        );
      }

      if (gridRef.current) {
        const cells = gridRef.current.querySelectorAll<HTMLElement>('.service-cell');
        gsap.fromTo(
          cells,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-white text-[#0A1128] py-12 md:py-20 px-6 lg:px-20"
      data-testid="section-services"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-10 md:mb-14">
          <span className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-light block mb-6">
            I Nostri Servizi
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#0A1128] font-light leading-tight">
            Ogni dettaglio, <span className="italic text-gray-400">pensato per voi.</span>
          </h2>
        </div>

        {/* 2-per-row grid (denser, more compact) */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 md:gap-y-12 md:gap-x-10 max-w-4xl mx-auto"
        >
          {SERVICES.map(({ Icon, label }) => (
            <div
              key={label}
              className="service-cell flex flex-col items-center text-center"
              data-testid={`service-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon
                size={40}
                strokeWidth={1}
                color="#D4AF37"
                className="mb-6"
              />
              <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500 font-light">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
