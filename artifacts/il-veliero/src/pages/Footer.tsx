import React, { useRef } from 'react';
import { Link } from 'wouter';

const SVLC_CARDS = [
  {
    n: '01',
    kicker: 'Natura',
    title: 'Riserva dello Zingaro',
    body:
      "Sette chilometri di costa intatta, calette nascoste e il profumo del finocchietto selvatico al mattino. Si entra all'alba, si esce solo dopo il bagno più lento dell'estate.",
  },
  {
    n: '02',
    kicker: 'Tramonto',
    title: 'Camminare al Faro',
    body:
      "Trenta minuti di passeggiata lenta lungo gli scogli, fino al faro bianco di Capo San Vito. Il sole scende dietro Monte Cofano e per qualche minuto il mare diventa rame.",
  },
  {
    n: '03',
    kicker: 'Storia',
    title: 'Tonnara di Scopello',
    body:
      "I faraglioni, le case dei pescatori, l'eco silenzioso di un mestiere che non c'è più. Una giornata fuori dal tempo, a venti minuti d'auto dalla nostra porta.",
  },
  {
    n: '04',
    kicker: 'Sapori',
    title: 'Cous Cous Fest, settembre',
    body:
      "Per dieci giorni, San Vito è capitale del Mediterraneo. Cuochi da tutto il mondo, musica, e quel mare che fa da sfondo a un rituale gentile e antichissimo.",
  },
];

export default function Footer() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <footer
      id="footer"
      className="bg-[#0A1128] text-white pt-14 pb-10 px-6 lg:px-20 relative overflow-hidden"
    >

      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

      {/* Decorative local "sand" texture — sits behind the content but on top
          of the navy background, giving the footer the same warm grain as
          the rest of the page without obscuring the white text the way the
          global multiply-blended sand filter would. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.83  0 0 0 0 0.69  0 0 0 0 0.22  0 0 0 0.85 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '220px 220px',
        }}
        data-testid="footer-sand-texture"
      />

      {/* The outer max-w wrapper used to be `relative z-10`. The z-10
          created a stacking context that trapped its descendants below
          the global SandFilter (z-[105]) — even children with z-[110]
          could not escape. We keep `relative` (so the absolute decorative
          overlays above still position against the footer outer) and
          drop the explicit z so this wrapper no longer creates a
          stacking context. The content sits visually above the
          decorative overlays via DOM order alone (they are written
          first as siblings of the footer outer). */}
      <div className="max-w-7xl mx-auto relative">

        {/* "Cosa fare" carousel — replaces the old "Inizia il tuo viaggio" headline.
            z-[110] + isolate lifts this section above the global SandFilter
            (z-[105]) so the cards are clearly visible — exactly the same
            treatment the room photos elsewhere on the page get. The
            heading and the rest of the footer remain at default z so
            they keep their warm sand grain on top. */}
        <section
          id="cosa-fare"
          className="relative z-[110] isolate mb-10 border-b border-white/10 pb-10"
          data-testid="cosa-fare-section"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] block mb-4 font-bold">
                Il diario di San Vito
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight">
                Cosa fare a <br className="hidden md:block" />
                <span className="italic text-[#D4AF37]">San Vito Lo Capo?</span>
              </h2>
            </div>
            <div className="flex items-end gap-6">
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => scrollByCard(-1)}
                  aria-label="Scorri a sinistra"
                  className="w-12 h-12 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white/70 transition-colors duration-300 flex items-center justify-center text-xl font-thin"
                  data-testid="carousel-prev"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollByCard(1)}
                  aria-label="Scorri a destra"
                  className="w-12 h-12 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white/70 transition-colors duration-300 flex items-center justify-center text-xl font-thin"
                  data-testid="carousel-next"
                >
                  →
                </button>
              </div>
              <Link
                href="/blog"
                className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-[#D4AF37] transition-colors duration-300 border-b border-white/30 hover:border-[#D4AF37] pb-1"
                data-testid="link-cosa-fare-all"
              >
                Tutti gli articoli →
              </Link>
            </div>
          </div>

          {/* Horizontal scrollable track */}
          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth -mx-6 px-6 lg:-mx-20 lg:px-20"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(212,175,55,0.4) transparent',
            }}
            data-testid="carousel-track"
          >
            {SVLC_CARDS.map((c) => (
              <Link
                key={c.n}
                href="/blog"
                data-card
                data-testid={`card-${c.n}`}
                className="snap-start shrink-0 w-[80vw] sm:w-[360px] md:w-[380px] bg-[#0A1128] hover:bg-[#0E1633] border border-white/10 hover:border-[#D4AF37]/40 p-8 md:p-10 transition-all duration-500 group flex flex-col"
              >
                {/* Header — the large "01 / 02 / 03 / 04" numerals were
                    removed at the user's request; only the colour-coded
                    kicker remains. */}
                <div className="flex items-baseline mb-8">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">
                    {c.kicker}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif text-white leading-tight mb-5 group-hover:text-[#D4AF37] transition-colors duration-500">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60 font-light flex-1">
                  {c.body}
                </p>
                <span className="mt-8 text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-[#D4AF37] transition-colors duration-500 inline-flex items-center gap-3">
                  Leggi <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 text-sm font-light text-white/60">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl tracking-[0.2em] font-serif uppercase text-white mb-6 flex items-center">
              il veliero <span className="text-[#D4AF37] ml-2 text-xs">★★★</span>
            </div>
            <p className="tracking-[0.15em] uppercase text-[9px] leading-loose text-white/40">
              Autentico Artigianato Siciliano <br/>
              Mare e Vento
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-white uppercase tracking-[0.2em] text-[10px] mb-6 font-medium">Posizione</h4>
            <p className="mb-2 hover:text-white transition-colors cursor-default">Via Savoia 15</p>
            <p className="mb-2 hover:text-white transition-colors cursor-default">91010 San Vito Lo Capo (TP)</p>
            <p className="hover:text-white transition-colors cursor-default">Sicilia, Italia</p>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white uppercase tracking-[0.2em] text-[10px] mb-6 font-medium">Contatti</h4>
            <p className="mb-2 hover:text-[#D4AF37] cursor-pointer transition-colors">+39 0923 000000</p>
            <p className="mb-2 hover:text-[#D4AF37] cursor-pointer transition-colors">info@ilveliero.it</p>
            <p className="hover:text-[#D4AF37] cursor-pointer transition-colors mt-6 uppercase text-[10px] tracking-widest block">
              Instagram ↗
            </p>
          </div>

          {/* Legal */}
          <div className="md:text-right flex flex-col md:items-end justify-between h-full">
            <div>
              <p className="mb-3 hover:text-white cursor-pointer transition-colors text-xs">Privacy Policy</p>
              <p className="mb-3 hover:text-white cursor-pointer transition-colors text-xs">Cookie Policy</p>
            </div>
            <p className="mt-12 text-[9px] uppercase tracking-[0.2em] text-white/30">
              © 2026 Il Veliero.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
