import React, { useEffect } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 40 placeholder slots — to be filled with real hotel photography later.
// We render a numbered tile for each one so the layout, density and
// rhythm are locked in and reviewable today.
const PLACEHOLDER_COUNT = 40;

export default function Gallery() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      const items = document.querySelectorAll('.gallery-item');
      items.forEach((item) => {
        gsap.fromTo(item,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 90%' },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white min-h-screen text-[#0A1128]">
      <InnerPageHeader />

      {/* Page hero */}
      <section className="pt-40 pb-20 px-6 lg:px-20 border-b border-[#0A1128]/5 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">Galleria</span>
          <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight">
            Immagini<br/><span className="italic">di Sicilia</span>
          </h1>
          <p className="mt-8 max-w-xl text-sm md:text-base font-light text-gray-500 leading-relaxed">
            Quaranta immagini per raccontare il nostro hotel, le tre dimore, il giardino e il mare di San Vito Lo Capo. Le fotografie originali verranno aggiunte nelle prossime settimane.
          </p>
        </div>
      </section>

      {/* 40-slot grid */}
      <section className="py-20 px-6 lg:px-20 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <div
              key={i}
              className="gallery-item aspect-square relative overflow-hidden bg-gradient-to-br from-[#0A1128]/[0.04] to-[#0A1128]/[0.01] border border-[#0A1128]/10 hover:border-[#D4AF37]/40 transition-colors duration-500 flex items-center justify-center group cursor-pointer"
              data-testid={`gallery-photo-${i + 1}`}
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#0A1128]/40 font-light group-hover:text-[#D4AF37] transition-colors duration-500">
                Foto {String(i + 1).padStart(2, '0')}
              </span>
              <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-[#D4AF37]/20 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase relative z-10">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
