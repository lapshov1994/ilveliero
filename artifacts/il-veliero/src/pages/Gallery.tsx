import React, { useEffect } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import g1 from '@assets/1_1779216013206.jpeg';
import g2 from '@assets/2_1779216013206.jpeg';
import g3 from '@assets/3_1779216013206.jpeg';
import g4 from '@assets/4_1779216013206.jpeg';
import p7 from '@assets/7_1779216013206.jpeg';
import p8 from '@assets/8_1779216013206.jpeg';
import p9 from '@assets/9_1779216013206.jpeg';
import p10 from '@assets/10_1779216013206.jpeg';
import p11 from '@assets/11_1779216013206.jpeg';
import p12 from '@assets/12_1779216013206.jpeg';
import p13 from '@assets/13_1779216013206.jpeg';
import p13_2 from '@assets/13.2_1779216013206.jpeg';
import p14 from '@assets/14_1779216013206.jpeg';
import p14_1 from '@assets/14.1_1779216013206.jpeg';
import p15 from '@assets/15_1779216013206.jpeg';
import p16 from '@assets/16_1779216013206.jpeg';
import p17 from '@assets/17_1779216013206.jpeg';
import p19 from '@assets/19_1779216013206.jpeg';
import p20 from '@assets/20_1779216013206.jpeg';
import p21 from '@assets/21_1779216013206.jpeg';
import p22 from '@assets/22_1779217480992.jpeg';
import p23 from '@assets/23_1779217480992.jpeg';
import p24 from '@assets/24_1779217480992.jpeg';
import p25 from '@assets/25_1779217480992.jpeg';
import p26 from '@assets/26_1779217480992.jpeg';
import p27 from '@assets/27_1779217480992.jpeg';
import p28 from '@assets/28_1779217480992.jpeg';

gsap.registerPlugin(ScrollTrigger);

/* The owner has supplied 20 real photographs of the hotel and the
 * rooms so far. We render them as the first 20 tiles of the gallery
 * grid; the remaining 20 slots stay as "Foto in arrivo" placeholders
 * (same visual rhythm as before) so the layout is locked in and the
 * page reads as intentional rather than half-finished. As more
 * photography arrives, simply append to PHOTOS below. */
const PHOTOS: string[] = [
  g1, g2, g3, g4,
  p7, p8, p9, p10, p11, p12, p13, p13_2,
  p14, p14_1, p15, p16, p17, p19,
  p20, p21, p22, p23, p24, p25, p26, p27, p28,
];

const TOTAL_SLOTS = 40;

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
            Le immagini del nostro hotel, delle camere, del giardino e del
            mare di San Vito Lo Capo. La galleria viene aggiornata man
            mano che arrivano le nuove fotografie.
          </p>
        </div>
      </section>

      {/* 40-slot grid — first 20 are real photographs, the remaining
          tiles are "Foto in arrivo" placeholders that keep the layout
          rhythm until the rest of the photography is delivered. */}
      <section className="py-20 px-6 lg:px-20 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const photo = PHOTOS[i];
            if (photo) {
              return (
                <div
                  key={i}
                  className="gallery-item aspect-square relative overflow-hidden bg-[#0A1128]/[0.04] border border-[#0A1128]/10 hover:border-[#D4AF37]/40 transition-colors duration-500 group"
                  data-testid={`gallery-photo-${i + 1}`}
                >
                  <img
                    src={photo}
                    alt={`Hotel Il Veliero — foto ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              );
            }
            return (
              <div
                key={i}
                className="gallery-item aspect-square relative overflow-hidden bg-gradient-to-br from-[#0A1128]/[0.04] to-[#0A1128]/[0.01] border border-[#0A1128]/10 hover:border-[#D4AF37]/40 transition-colors duration-500 flex items-center justify-center group"
                data-testid={`gallery-photo-${i + 1}`}
              >
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#0A1128]/40 font-light group-hover:text-[#D4AF37] transition-colors duration-500">
                  Foto in arrivo
                </span>
                <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-[#D4AF37]/20 transition-colors duration-500" />
              </div>
            );
          })}
        </div>
      </section>

      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase relative z-10">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
