import React, { useEffect } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const photos = [
  { src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop', alt: 'Sicilia' },
  { src: 'https://images.unsplash.com/photo-1533939311960-40f6a4b5d3ab?q=80&w=600&auto=format&fit=crop', alt: 'San Vito' },
  { src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=700&auto=format&fit=crop', alt: 'Suite' },
  { src: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800&auto=format&fit=crop', alt: 'Zingaro' },
  { src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop', alt: 'Terrazza' },
  { src: 'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=700&auto=format&fit=crop', alt: 'Famiglia' },
  { src: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop', alt: 'Colazione' },
  { src: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop', alt: 'Gelsomino' },
  { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop', alt: 'Vista' },
  { src: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=700&auto=format&fit=crop', alt: 'Spiaggia' },
  { src: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?q=80&w=600&auto=format&fit=crop', alt: 'Mare' },
  { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe837?q=80&w=800&auto=format&fit=crop', alt: 'Hotel' },
];

export default function Gallery() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%' },
        }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="bg-white min-h-screen text-[#0A1128]">
      <InnerPageHeader />

      {/* Page hero */}
      <section className="pt-40 pb-20 px-6 lg:px-20 border-b border-[#0A1128]/5">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">Galleria</span>
          <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight">
            Immagini<br/><span className="italic">di Sicilia</span>
          </h1>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="gallery-item break-inside-avoid overflow-hidden group cursor-pointer"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
