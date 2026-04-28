import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DimoreTeaser() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(imageRef.current,
      { x: -40, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' }
      }
    );
    gsap.fromTo(textRef.current,
      { x: 40, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' }
      }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative bg-white text-[#0A1128] py-32 px-6 lg:px-20 overflow-hidden">
      <div className="absolute top-16 right-10 text-[18rem] font-serif text-black opacity-[0.02] select-none pointer-events-none leading-none">04</div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">

        {/* Left: large photo */}
        <div ref={imageRef} className="overflow-hidden aspect-[4/5] w-full">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop"
            alt="Scirocco Suite"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          />
        </div>

        {/* Right: text block */}
        <div ref={textRef} className="flex flex-col justify-center">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-6">Le Nostre Dimore</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Ogni stanza,<br/><span className="italic">una storia.</span>
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 mb-10 max-w-sm">
            Tre camere d'autore — ognuna con un nome, un carattere e un'anima. Scirocco, Mistral e Gelsomino ti aspettano per regalarti notti indimenticabili.
          </p>

          <div className="space-y-4 mb-12">
            {[
              { name: 'Scirocco', desc: 'Vista mare · 35 m²' },
              { name: 'Mistral', desc: 'Terrazza privata · 28 m²' },
              { name: 'Gelsomino', desc: 'Giardino · 22 m²' },
            ].map((room) => (
              <div key={room.name} className="flex items-center gap-4 group">
                <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                <span className="font-serif text-lg">{room.name}</span>
                <span className="text-xs text-gray-400 tracking-widest uppercase">{room.desc}</span>
              </div>
            ))}
          </div>

          <Link
            href="/rooms"
            className="bg-[#D4AF37] text-[#0A1128] px-10 py-4 uppercase text-[11px] tracking-[0.2em] font-bold inline-block w-fit relative overflow-hidden group hover:shadow-lg transition-shadow duration-500"
          >
            <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[3px]">Scopri le Camere</span>
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </Link>
        </div>
      </div>
    </section>
  );
}
