import React, { useEffect, useRef } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const rooms = [
  {
    id: '01',
    name: 'Scirocco',
    subtitle: 'Il Mare nei Tuoi Occhi',
    size: '35 m²',
    features: ['Vista mare panoramica', 'Vasca idromassaggio', 'Colazione privata'],
    photo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=900&auto=format&fit=crop',
    accent: 'Lusso · Suite',
  },
  {
    id: '02',
    name: 'Mistral',
    subtitle: 'Il Vento sul Terrazzo',
    size: '28 m²',
    features: ['Terrazza privata', 'Vista giardino e mare', 'Lounge esterno'],
    photo: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=900&auto=format&fit=crop',
    accent: 'Deluxe · Terrazza',
  },
  {
    id: '03',
    name: 'Gelsomino',
    subtitle: 'Il Giardino Segreto',
    size: '22 m²',
    features: ['Accesso diretto al giardino', 'Profumo di zagara', 'Atmosfera intima'],
    photo: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=900&auto=format&fit=crop',
    accent: 'Superior · Giardino',
  },
  {
    id: '04',
    name: 'Tramontana',
    subtitle: "Il Vento dalla Montagna",
    size: '30 m²',
    features: ['Vista su Monte Monaco', 'Soffitti a volta', 'Camino in pietra'],
    photo: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=900&auto=format&fit=crop',
    accent: 'Classic · Vista monte',
  },
];

export default function Rooms() {
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    cardsRef.current.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 80%' },
          delay: i * 0.1,
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
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">Le Nostre Dimore</span>
          <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight">
            Camere &<br/><span className="italic">Suite</span>
          </h1>
        </div>
      </section>

      {/* Rooms */}
      <section className="py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-32">
          {rooms.map((room, i) => (
            <article
              key={room.id}
              ref={el => { cardsRef.current[i] = el; }}
              className={`grid grid-cols-1 md:grid-cols-12 gap-12 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
            >
              {/* Photo */}
              <div className="md:col-span-7 overflow-hidden aspect-[4/3] relative">
                <div className="absolute top-4 left-4 z-10 text-[8rem] font-serif text-white opacity-20 leading-none select-none">
                  {room.id}
                </div>
                <img
                  src={room.photo}
                  alt={room.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  loading="lazy"
                />
              </div>

              {/* Text */}
              <div className="md:col-span-5 [direction:ltr] flex flex-col justify-center">
                <span className="text-[10px] tracking-[0.3em] text-[#D4AF37] uppercase font-bold block mb-4">{room.accent}</span>
                <h2 className="text-4xl md:text-5xl font-serif mb-2 leading-tight">{room.name}</h2>
                <p className="font-serif italic text-xl text-gray-400 mb-6">{room.subtitle}</p>
                <p className="text-xs text-[#D4AF37] tracking-[0.2em] uppercase mb-8">{room.size}</p>
                <ul className="space-y-2 mb-10">
                  {room.features.map(f => (
                    <li key={f} className="text-sm text-gray-500 flex items-center gap-3">
                      <span className="w-1 h-px bg-[#D4AF37] inline-block flex-shrink-0 w-4" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="bg-[#D4AF37] text-[#0A1128] px-8 py-3.5 uppercase text-[11px] tracking-[0.2em] font-bold inline-block w-fit relative overflow-hidden group hover:shadow-lg transition-shadow duration-500">
                  <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[3px]">Richiedi Disponibilità</span>
                  <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
