import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import L7 from '@assets/7_1779216013206.jpeg';
import L8 from '@assets/8_1779216013206.jpeg';
import L9 from '@assets/9_1779216013206.jpeg';
import L10 from '@assets/10_1779216013206.jpeg';
import L11 from '@assets/11_1779216013206.jpeg';
import L12 from '@assets/12_1779216013206.jpeg';
import L13 from '@assets/13_1779216013206.jpeg';
import L13_2 from '@assets/13.2_1779216013206.jpeg';
import S14 from '@assets/14_1779216013206.jpeg';
import S14_1 from '@assets/14.1_1779216013206.jpeg';
import S15 from '@assets/15_1779216013206.jpeg';
import S16 from '@assets/16_1779216013206.jpeg';
import S17 from '@assets/17_1779216013206.jpeg';
import S19 from '@assets/19_1779216013206.jpeg';
import G20 from '@assets/20_1779216013206.jpeg';
import G21 from '@assets/21_1779216013206.jpeg';
import G22 from '@assets/22_1779217480992.jpeg';
import G23 from '@assets/23_1779217480992.jpeg';
import G24 from '@assets/24_1779217480992.jpeg';
import G25 from '@assets/25_1779217480992.jpeg';
import Q26 from '@assets/26_1779217480992.jpeg';
import Q27 from '@assets/27_1779217480992.jpeg';
import Q28 from '@assets/28_1779217480992.jpeg';

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER = '__placeholder__';

type Room = {
  name: string;
  tagline: string;
  description: string;
  photos: string[];
};

const ROOM_DESCRIPTION =
  "Camera arredata in stile mediterraneo, luminosa e accogliente: comfort moderno e atmosfera serena. Aria condizionata, Wi-Fi gratuito, bagno privato e pulizia giornaliera per una vacanza all'insegna del relax.";

const ROOMS: Room[] = [
  {
    name: 'Libeccio',
    tagline: 'Stile mediterraneo',
    description: ROOM_DESCRIPTION,
    photos: [Q26, Q27, Q28],
  },
  {
    name: 'Grecale',
    tagline: 'Stile mediterraneo',
    description: ROOM_DESCRIPTION,
    photos: [G20, G21, G22, G23, G24, G25],
  },
  {
    name: 'Scirocco',
    tagline: 'Stile mediterraneo',
    description: ROOM_DESCRIPTION,
    photos: [S14, S14_1, S15, S16, S17, S19],
  },
  {
    name: 'Tramontana',
    tagline: 'Stile mediterraneo',
    description: ROOM_DESCRIPTION,
    photos: [L7, L8, L9, L10, L11, L12, L13, L13_2],
  },
];

/** Reusable "Foto in arrivo" placeholder, used while the owner sends the
 *  remaining room photography. Keeps the carousel layout intact and the
 *  navy / sand / gold palette consistent — no Unsplash stand-ins. */
function PhotoPlaceholder({ roomName, full = false }: { roomName: string; full?: boolean }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-[#0A1128]/[0.04] border border-[#D4AF37]/30 ${
        full ? 'aspect-auto' : ''
      }`}
      data-testid="room-photo-placeholder"
    >
      <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-2">
        Foto in arrivo
      </span>
      <span className="text-[10px] tracking-[0.2em] uppercase text-[#0A1128]/40 font-light">
        {roomName}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Segmented pill switch
   --------------------
   A horizontal track with a gold "knob" that slides under the active room.
   The knob is a separate absolutely-positioned element — its left/width
   are animated with GSAP whenever the active index changes, so the slide
   reads as a continuous physical motion (the very thing the user asked
   for: "тумблер с кругляшком, который как ползунок можно перемещать").

   The whole control is also drag-aware: pointerdown anywhere on the track
   starts a drag, pointermove updates the active index in real time as the
   knob follows the pointer, and pointerup commits it. Keyboard navigation
   (arrow left/right + Home/End) is included for a11y.
   ────────────────────────────────────────────────────────────────────── */
function RoomToggle({
  rooms,
  activeIndex,
  onChange,
}: {
  rooms: Room[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const draggingRef = useRef(false);

  // Move the knob to sit exactly under the active segment. Using a layout
  // effect so we measure after the DOM is laid out but BEFORE paint, which
  // prevents a one-frame jump on first render.
  const positionKnob = (i: number, animate = true) => {
    const seg = segmentRefs.current[i];
    const track = trackRef.current;
    const knob = knobRef.current;
    if (!seg || !track || !knob) return;
    const trackRect = track.getBoundingClientRect();
    const segRect = seg.getBoundingClientRect();
    const left = segRect.left - trackRect.left;
    const width = segRect.width;
    if (animate) {
      gsap.to(knob, { left, width, duration: 0.55, ease: 'power3.out' });
    } else {
      gsap.set(knob, { left, width });
    }
  };

  useLayoutEffect(() => {
    positionKnob(activeIndex, false);
    // Reposition on resize so the knob follows when segments reflow.
    const onResize = () => positionKnob(activeIndex, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    positionKnob(activeIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Map a pointer X (page coords) to the segment index under it.
  const indexAtX = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return activeIndex;
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const w = rect.width / rooms.length;
    const i = Math.floor(x / w);
    return Math.max(0, Math.min(rooms.length - 1, i));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    onChange(indexAtX(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const next = indexAtX(e.clientX);
    if (next !== activeIndex) onChange(next);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(rooms.length - 1, activeIndex + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(0, activeIndex - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(rooms.length - 1);
    }
  };

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label="Seleziona una dimora"
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative w-full select-none touch-none rounded-full bg-[#0A1128]/[0.045] ring-1 ring-[#0A1128]/10 p-1.5 cursor-grab active:cursor-grabbing"
      data-testid="room-toggle"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* The sliding knob — a gold pill under the active segment. */}
      <div
        ref={knobRef}
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 rounded-full bg-[#D4AF37] shadow-[0_6px_18px_-6px_rgba(212,175,55,0.55)]"
        style={{ left: 0, width: 0 }}
      />
      {/* The segments themselves — buttons so they remain accessible to
          screen readers and to keyboard users without needing to track
          the knob. */}
      <div className="relative flex">
        {rooms.map((r, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={r.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`room-panel-${i}`}
              ref={(el) => { segmentRefs.current[i] = el; }}
              data-testid={`room-tab-${i}`}
              onClick={(e) => {
                // Click also triggers onPointerDown which already set
                // the active index — but if someone uses Enter/Space
                // via keyboard navigation we still want to handle it.
                e.preventDefault();
                onChange(i);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`relative z-10 flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-3 md:py-3.5 transition-colors duration-300 ${
                isActive ? 'text-[#0A1128]' : 'text-[#0A1128]/45 hover:text-[#0A1128]/70'
              }`}
            >
              <span className="block text-center font-serif text-[13px] sm:text-base md:text-lg leading-none truncate">
                {r.name}
              </span>
              {/* Tagline hidden on the narrowest viewports — at <420 px the
                  4-segment pill simply doesn't have room for two lines per
                  cell and the tagline starts wrapping awkwardly. */}
              <span className={`hidden sm:block text-center text-[9px] sm:text-[10px] tracking-[0.18em] uppercase mt-1 leading-none transition-colors duration-300 ${
                isActive ? 'text-[#0A1128]/65' : 'text-[#0A1128]/35'
              }`}>
                {r.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DimoreTeaser() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);

  const [activeRoom, setActiveRoom] = useState(0);
  const [photoIdx, setPhotoIdx] = useState<number[]>(() => ROOMS.map(() => 0));
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const room = ROOMS[activeRoom];
  const currentPhoto = photoIdx[activeRoom] ?? 0;
  const totalPhotos = room.photos.length;

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

  // Lightbox: keyboard navigation + body-scroll lock while open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, currentPhoto, activeRoom]);

  return (
    <section
      id="dimore-teaser"
      ref={containerRef}
      className="relative bg-white text-[#0A1128] py-12 md:py-20 px-6 lg:px-20 overflow-hidden"
      data-testid="dimore-teaser"
    >
      <div className="max-w-7xl mx-auto relative">
        {/* ── Section header + room toggle ────────────────────────── */}
        <div ref={headerRef} className="mb-8 md:mb-12">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">
            Le Nostre Dimore
          </span>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-2xl mb-10">
            Quattro stanze,<br />
            <span className="italic">quattro storie.</span>
          </h2>

          <RoomToggle rooms={ROOMS} activeIndex={activeRoom} onChange={setActiveRoom} />
        </div>

        {/* ── Carousel + text ────────────────────────────────────────
            z-[110] + isolate lifts the photo block above BOTH the
            global SandFilter (z-90) AND the film-grain overlay
            (z-100). Isolate creates its own stacking context so only
            the carousel rises — the rest of the section keeps its
            warm grain. */}
        {/* items-start (was items-center) — with the per-room "Prenota …"
            button and the "01 · 04" line removed, the right-hand text
            column is shorter than the photo. items-center was producing
            large empty bands above and below the room copy. items-start
            keeps the room title aligned to the top of the photo, which
            is the look the user expects. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Carousel container — aspect-[4/3] (was 4/5) matches the
              native landscape proportion of the room photography, and
              the inner <img> uses object-cover so the photo fills the
              frame edge-to-edge with no white letterbox bands above or
              below. The original "show the photo whole, never crop"
              behaviour is still available via the fullscreen lightbox
              button in the corner — the lightbox keeps object-contain. */}
          <div
            ref={carouselRef}
            id={`room-panel-${activeRoom}`}
            role="tabpanel"
            className="relative z-[110] isolate aspect-[4/3] w-full overflow-hidden bg-[#0A1128]/5 select-none"
            data-testid="room-carousel"
          >
            <div
              ref={photoLayerRef}
              key={`${activeRoom}-${currentPhoto}`}
              className="absolute inset-0"
            >
              {room.photos[currentPhoto] === PLACEHOLDER ? (
                <PhotoPlaceholder roomName={room.name} />
              ) : (
                <img
                  src={room.photos[currentPhoto]}
                  alt={`${room.name} — foto ${currentPhoto + 1} di ${totalPhotos}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>

            {/* Fullscreen / zoom — opens the current photo in a true
                full-viewport lightbox. On mobile this lets the guest
                pinch-zoom the room photography natively (the lightbox
                container has `touch-action: pinch-zoom`). */}
            <button
              type="button"
              aria-label="Apri foto a schermo intero"
              data-testid="carousel-fullscreen"
              onClick={() => setLightboxOpen(true)}
              className="absolute right-4 top-4 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-white/85 hover:bg-white text-[#0A1128] backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 z-20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V4h5" />
                <path d="M20 9V4h-5" />
                <path d="M4 15v5h5" />
                <path d="M20 15v5h-5" />
              </svg>
            </button>

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

            {/* Indicator strip — only the dots, the "01 / 05" numeric
                pagination was removed at the user's request. */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-white/85 backdrop-blur-sm z-20">
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

          <div ref={textRef} className="flex flex-col justify-start">
            <h3 className="text-3xl md:text-4xl font-serif mb-2">{room.name}</h3>
            <p className="text-sm tracking-[0.15em] uppercase text-[#0A1128]/50 mb-6">
              {room.tagline}
            </p>

            <p className="text-sm leading-relaxed text-gray-600 mb-8 max-w-md">
              {room.description}
            </p>


            {/* Per-room "Prenota Camera …" CTA was removed
                at the user's request — guests use the global booking
                widget at the top of the hero to start a reservation. */}
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────
          Full-viewport overlay that opens when the guest clicks the
          fullscreen icon on the carousel. The image is rendered with
          `object-contain` inside `100vw × 100vh` so it always fits the
          screen without cropping; `touch-action: pinch-zoom` lets
          mobile users natively pinch-zoom the photo. Keyboard:
          ←/→ to flip photos, Esc to close. */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${room.name} — foto ${currentPhoto + 1} di ${totalPhotos}`}
          data-testid="room-lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Image container — clicks INSIDE here don't close the
              lightbox so the guest can pinch-zoom freely. */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
            style={{ touchAction: 'pinch-zoom' }}
            onClick={(e) => e.stopPropagation()}
          >
            {room.photos[currentPhoto] === PLACEHOLDER ? (
              <div className="w-[80vw] max-w-2xl aspect-[4/3]">
                <PhotoPlaceholder roomName={room.name} />
              </div>
            ) : (
              <img
                src={room.photos[currentPhoto]}
                alt={`${room.name} — foto ${currentPhoto + 1} di ${totalPhotos}`}
                className="max-w-full max-h-full object-contain select-none"
                loading="lazy"
                decoding="async"
                draggable={false}
                data-testid="lightbox-image"
              />
            )}
          </div>

          {/* Close (top-right) */}
          <button
            type="button"
            aria-label="Chiudi"
            data-testid="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors duration-300 z-10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6 L18 18 M18 6 L6 18" />
            </svg>
          </button>

          {/* Prev / Next inside the lightbox */}
          <button
            type="button"
            aria-label="Foto precedente"
            data-testid="lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors duration-300 z-10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18 L9 12 L15 6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Foto successiva"
            data-testid="lightbox-next"
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors duration-300 z-10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6 L15 12 L9 18" />
            </svg>
          </button>

          {/* Caption / counter */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-[10px] tracking-[0.2em] uppercase font-medium tabular-nums">
            {room.name} · {String(currentPhoto + 1).padStart(2, '0')} / {String(totalPhotos).padStart(2, '0')}
          </div>
        </div>
      )}
    </section>
  );
}
