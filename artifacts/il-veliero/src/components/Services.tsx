import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Coffee,
  Palmtree,
  Bike,
  Wifi,
  Sparkles,
  Ship,
  Dog,
  Car,
  Baby,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  { Icon: Coffee, label: 'Colazione in Camera' },
  { Icon: Palmtree, label: 'Giardino e Terrazza' },
  { Icon: Bike, label: 'Biciclette Free' },
  { Icon: Wifi, label: 'Free Wifi' },
  { Icon: Sparkles, label: 'Pulizia Giornaliera' },
  { Icon: Ship, label: 'Escursione in Barca' },
  { Icon: Dog, label: 'Animali Ammessi' },
  { Icon: Car, label: 'Parcheggio Adiacente' },
  { Icon: Baby, label: 'Baby-sitter su richiesta' },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white text-[#0A1128] py-32 md:py-48 px-6 lg:px-20"
      data-testid="section-services"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-24 md:mb-32">
          <span className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-light block mb-6">
            I Nostri Servizi
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#0A1128] font-light leading-tight">
            Ogni dettaglio, <span className="italic text-gray-400">pensato per voi.</span>
          </h2>
        </div>

        {/* 3x3 grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-20 gap-x-12 md:gap-y-24 md:gap-x-16"
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
