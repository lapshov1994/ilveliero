import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Room = {
  name: string;
  tagline: string;
  size: string;
  view: string;
  description: string;
  photos: string[];
};

const ROOMS: Room[] = [
  {
    name: 'Scirocco',
    tagline: 'Suite vista mare',
    size: '35 m²',
    view: 'Vista sul Monte Cofano',
    description:
      "Avvolta nei toni caldi della terra siciliana, la suite Scirocco ti accoglie con la sua ampia finestra a tutta altezza affacciata sull'orizzonte. Letto a baldacchino in ferro battuto, pavimento in cotto antico e una terrazza privata per i tramonti più lenti.",
    photos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Mistral',
    tagline: 'Camera con terrazza',
    size: '28 m²',
    view: 'Terrazza privata sul giardino',
    description:
      'Fresca, luminosa e ventilata, la camera Mistral porta dentro di sé il respiro del nord. Tessuti naturali in lino bianco, dettagli in ceramica di Caltagirone e una terrazza intima dove fare colazione tra le bouganville.',
    photos: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551776235-dde6d482980b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Gelsomino',
    tagline: 'Camera nel giardino',
    size: '22 m²',
    view: 'Affaccio sul patio fiorito',
    description:
      "Profumata di gelsomino e zagara, questa camera intima si apre direttamente sul patio interno dell'antica dimora. Volte a botte imbiancate a calce, un piccolo angolo lettura e il canto delle rondini al risveglio.",
    photos: [
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Levante',
    tagline: 'Suite familiare',
    size: '42 m²',
    view: 'Doppio affaccio mare e giardino',
    description:
      "La più ampia delle nostre dimore, pensata per chi viaggia in famiglia o desidera spazio per perdersi. Due ambienti comunicanti, un grande bagno in marmo di Custonaci e una loggia con divano per le ore più dolci del pomeriggio.",
    photos: [
      'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559599238-308793637427?q=80&w=1200&auto=format&fit=crop',
    ],
  },
];

export default function DimoreTeaser() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);

  const [activeRoom, setActiveRoom] = useState(0);
  // Track the current photo index for each room independently so
  // switching rooms preserves where the user was in each carousel.
  const [photoIdx, setPhotoIdx] = useState<number[]>(() => ROOMS.map(() => 0));

  const room = ROOMS[activeRoom];
  const currentPhoto = photoIdx[activeRoom] ?? 0;
  const totalPhotos = room.photos.length;

  // ── Entry animation ─────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
        },
      );
      gsap.fromTo(
        carouselRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        },
      );
      gsap.fromTo(
        textRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ── Cross-fade whenever the visible photo changes ──────────────────
  useEffect(() => {
    if (!photoLayerRef.current) return;
    gsap.fromTo(
      photoLayerRef.current,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
    );
  }, [activeRoom, currentPhoto]);

  const setPhotoForActive = (next: number) => {
    setPhotoIdx((prev) => {
      const copy = [...prev];
      copy[activeRoom] = (next + totalPhotos) % totalPhotos;
      return copy;
    });
  };

  const prevPhoto = () => setPhotoForActive(currentPhoto - 1);
  const nextPhoto = () => setPhotoForActive(currentPhoto + 1);

  return (
    <section
      id="dimore-teaser"
      ref={containerRef}
      // No z-index here so the carousel inside can lift itself ABOVE the
      // global SandFilter (z-90) without the rest of the section also
      // jumping above it. position:relative is kept for the absolute "04"
      // decoration but without a z-index it does NOT create a stacking
      // context — that's the whole trick.
      className="relative bg-white text-[#0A1128] py-20 md:py-28 px-6 lg:px-20 overflow-hidden"
      data-testid="dimore-teaser"
    >
      {/* Giant decorative section number */}
      <div className="absolute top-16 right-10 text-[18rem] font-serif text-black opacity-[0.02] select-none pointer-events-none leading-none">
        04
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* ── Section header + room tabs ────────────────────────────── */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">
            Le Nostre Dimore
          </span>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-2xl mb-10">
            Quattro stanze,<br />
            <span className="italic">quattro storie.</span>
          </h2>

          {/* Room tabs */}
          <div
            role="tablist"
            aria-label="Seleziona una dimora"
            className="flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-b border-[#0A1128]/10 py-5"
          >
            {ROOMS.map((r, i) => {
              const isActive = i === activeRoom;
              return (
                <button
                  key={r.name}
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`room-tab-${i}`}
                  onClick={() => setActiveRoom(i)}
                  className="group relative flex items-baseline gap-3 transition-colors duration-300"
                >
                  <span
                    className={`font-serif text-lg md:text-xl transition-colors duration-300 ${
                      isActive ? 'text-[#0A1128]' : 'text-[#0A1128]/40 group-hover:text-[#0A1128]/70'
                    }`}
                  >
                    {r.name}
                  </span>
                  <span
                    className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#0A1128]/30 group-hover:text-[#0A1128]/50'
                    }`}
                  >
                    {r.tagline}
                  </span>
                  <span
                    className={`absolute -bottom-[22px] left-0 h-[2px] bg-[#D4AF37] transition-all duration-500 ease-out ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Carousel + text ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: photo carousel.
              z-[95] + isolate lifts the photo (and only the photo) ABOVE
              the global SandFilter at z-90, so the room images render
              clean and pristine while the rest of the section keeps
              the warm sand grain. */}
          <div
            ref={carouselRef}
            className="relative z-[95] isolate aspect-[4/5] w-full overflow-hidden bg-[#0A1128]/5 select-none"
            data-testid="room-carousel"
          >
            <div
              ref={photoLayerRef}
              key={`${activeRoom}-${currentPhoto}`}
              className="absolute inset-0"
            >
              <img
                src={room.photos[currentPhoto]}
                alt={`${room.name} — foto ${currentPhoto + 1} di ${totalPhotos}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Left arrow — main navigation control the user asked for */}
            <button
              type="button"
              aria-label="Foto precedente"
              data-testid="carousel-prev"
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/85 hover:bg-white text-[#0A1128] backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-x-1 z-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18 L9 12 L15 6" />
              </svg>
            </button>

            {/* Right arrow — convenience */}
            <button
              type="button"
              aria-label="Foto successiva"
              data-testid="carousel-next"
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/85 hover:bg-white text-[#0A1128] backdrop-blur-sm shadow-lg transition-all duration-300 hover:translate-x-1 z-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6 L15 12 L9 18" />
              </svg>
            </button>

            {/* Counter + dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/85 backdrop-blur-sm z-20">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#0A1128] font-bold tabular-nums">
                {String(currentPhoto + 1).padStart(2, '0')} / {String(totalPhotos).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1.5">
                {room.photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Vai alla foto ${i + 1}`}
                    onClick={() => setPhotoForActive(i)}
                    className={`h-[3px] transition-all duration-300 ${
                      i === currentPhoto ? 'w-6 bg-[#D4AF37]' : 'w-3 bg-[#0A1128]/30 hover:bg-[#0A1128]/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: text block */}
          <div ref={textRef} className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-bold">
                {String(activeRoom + 1).padStart(2, '0')} · {String(ROOMS.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-serif mb-2">{room.name}</h3>
            <p className="text-sm tracking-[0.15em] uppercase text-[#0A1128]/50 mb-6">
              {room.tagline}
            </p>

            <p className="text-sm leading-relaxed text-gray-600 mb-8 max-w-md">
              {room.description}
            </p>

            <dl className="space-y-3 mb-10 text-sm">
              <div className="flex items-baseline gap-4">
                <dt className="w-28 text-[10px] tracking-[0.2em] uppercase text-[#0A1128]/40">
                  Superficie
                </dt>
                <dd className="font-serif text-[#0A1128]">{room.size}</dd>
              </div>
              <div className="flex items-baseline gap-4">
                <dt className="w-28 text-[10px] tracking-[0.2em] uppercase text-[#0A1128]/40">
                  Affaccio
                </dt>
                <dd className="font-serif text-[#0A1128]">{room.view}</dd>
              </div>
            </dl>

            <a
              href="#footer"
              className="bg-[#D4AF37] text-[#0A1128] px-10 py-4 uppercase text-[11px] tracking-[0.2em] font-bold inline-block w-fit relative overflow-hidden group hover:shadow-lg transition-shadow duration-500"
            >
              <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[3px]">
                Prenota {room.name}
              </span>
              <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
