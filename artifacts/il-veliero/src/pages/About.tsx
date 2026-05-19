import React, { useEffect, useRef } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      const blocks = document.querySelectorAll('.about-block');
      blocks.forEach((b) => {
        gsap.fromTo(
          b,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: b, start: 'top 85%' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="bg-white min-h-screen text-[#0A1128]">
      <InnerPageHeader />

      {/* Page hero — z-[95] keeps the content above the global sand filter */}
      <section className="pt-40 pb-20 px-6 lg:px-20 border-b border-[#0A1128]/5 relative z-[95] bg-white">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">La nostra storia</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light leading-[0.95]">
            Il Veliero,<br/><span className="italic">dal 1987.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-base md:text-lg font-light text-gray-600 leading-relaxed">
            Una casa di famiglia diventata albergo, una passione siciliana per
            l'ospitalità tramandata di generazione in generazione. Questo è il
            racconto, in poche pagine, di chi siamo e di come siamo arrivati
            fin qui.
          </p>
        </div>
      </section>

      {/* Long-form story */}
      <section className="py-20 md:py-28 px-6 lg:px-20 relative z-[95] bg-white">
        <div className="max-w-3xl mx-auto space-y-20">

          <article className="about-block">
            <div className="flex items-baseline gap-6 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">Capitolo 01</span>
              <span className="text-4xl font-serif text-[#0A1128]/10 select-none">1987</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-6">
              Una casa, un'idea, due fratelli.
            </h2>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
              Il Veliero nasce nell'estate del 1987, quando Giovanni e Maria
              Valenti decidono di trasformare la grande casa di famiglia, a
              due passi dalla Tonnara, in una piccola pensione. Allora era
              così: cinque stanze, una colazione lunga sul terrazzo e il
              vento di tramontana che entrava dalla finestra della cucina.
              Niente di più, niente di meno.
            </p>
          </article>

          <article className="about-block">
            <div className="flex items-baseline gap-6 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">Capitolo 02</span>
              <span className="text-4xl font-serif text-[#0A1128]/10 select-none">1996</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-6">
              Il primo Cous Cous Fest.
            </h2>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
              San Vito Lo Capo cambia per sempre nel settembre del 1996, con
              la prima edizione del Cous Cous Fest. La pensione diventa la
              casa dei cuochi che arrivano da tutto il Mediterraneo. Da
              allora, ogni settembre, il giardino del Veliero ospita lunghe
              tavole sotto i gelsomini. È in quegli anni che Maria comincia
              a scrivere il quaderno delle ricette che ancora oggi usiamo
              in cucina.
            </p>
          </article>

          <article className="about-block">
            <div className="flex items-baseline gap-6 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">Capitolo 03</span>
              <span className="text-4xl font-serif text-[#0A1128]/10 select-none">2008</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-6">
              Le quattro dimore.
            </h2>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
              Il restauro del 2008 trasforma il Veliero in un piccolo albergo
              diffuso. Le stanze diventano quattro vere e proprie dimore —
              Libeccio, Scirocco, Grecale e la quarta camera — ognuna pensata
              attorno a un vento, a una vista, a un ricordo della famiglia.
              È in quegli anni che entra in scena Lorenzo, figlio di
              Giovanni, oggi alla guida della casa con sua moglie Anna.
            </p>
          </article>

          <article className="about-block">
            <div className="flex items-baseline gap-6 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">Capitolo 04</span>
              <span className="text-4xl font-serif text-[#0A1128]/10 select-none">Oggi</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-6">
              Quattro generazioni, lo stesso vento.
            </h2>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
              Oggi il Veliero è ancora una casa a conduzione familiare. La
              colazione si serve sul terrazzo che dà sul giardino, le
              biciclette aspettano in cortile, e ogni mattina qualcuno della
              famiglia accoglie gli ospiti per il primo caffè. Continuiamo
              a fare le cose come ce le hanno insegnate i nonni: con
              attenzione, con calma, con rispetto per il vento e per il
              tempo che ci vuole.
            </p>
          </article>

          {/* Signature line */}
          <div className="about-block pt-12 border-t border-[#0A1128]/10">
            <p className="font-serif italic text-2xl md:text-3xl text-[#0A1128] leading-snug">
              "Le case migliori non si vendono, si raccontano."
            </p>
            <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">
              — Lorenzo Valenti
            </p>
          </div>

        </div>
      </section>

      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase relative z-[95]">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
