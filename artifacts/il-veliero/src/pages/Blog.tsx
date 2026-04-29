import React, { useEffect, useRef } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// "Cosa fare a San Vito Lo Capo?" — the four core stories that also
// appear as the home-page carousel above the footer. Landing on /blog
// shows the long-form version of the same four pieces.
const articles = [
  {
    id: '01',
    date: 'Aprile 2026',
    category: 'Natura',
    title: 'Riserva dello Zingaro, sette chilometri di costa intatta',
    excerpt:
      "Calette nascoste, profumo di finocchietto selvatico e il silenzio del Mediterraneo antico. Si entra all'alba, si esce solo dopo il bagno più lento dell'estate — una guida lenta per chi vuole davvero esplorare.",
    readTime: '7 min',
    photo: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '02',
    date: 'Marzo 2026',
    category: 'Tramonto',
    title: 'Camminare al Faro, trenta minuti di luce che cambia',
    excerpt:
      "Una passeggiata lenta lungo gli scogli, fino al faro bianco di Capo San Vito. Il sole scende dietro Monte Cofano e per qualche minuto il mare diventa rame. Il rituale che insegniamo a tutti i nostri ospiti.",
    readTime: '4 min',
    photo: 'https://images.unsplash.com/photo-1533939311960-40f6a4b5d3ab?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '03',
    date: 'Febbraio 2026',
    category: 'Storia',
    title: 'Tonnara di Scopello, il silenzio dei faraglioni',
    excerpt:
      "I faraglioni, le case dei pescatori, l'eco silenzioso di un mestiere che non c'è più. Vi accompagniamo dentro a una giornata fuori dal tempo, a venti minuti d'auto dalla nostra porta.",
    readTime: '6 min',
    photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '04',
    date: 'Settembre 2026',
    category: 'Sapori',
    title: 'Cous Cous Fest, dieci giorni di Mediterraneo',
    excerpt:
      "Per dieci giorni a settembre, San Vito è capitale del Mediterraneo. Cuochi da tutto il mondo, musica fino a notte fonda e quel mare che fa da sfondo a un rituale gentile e antichissimo.",
    readTime: '5 min',
    photo: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=900&auto=format&fit=crop',
  },
];

export default function Blog() {
  const articlesRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    articlesRef.current.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
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
          <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-4">Il Diario</span>
          <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight">
            Cosa fare a<br/><span className="italic">San Vito Lo Capo?</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg font-light text-gray-500 leading-relaxed">
            Quattro storie scelte dalla famiglia Valenti — i luoghi, i ritmi e i sapori che insegniamo a tutti i nostri ospiti. Da leggere prima di arrivare, o la sera in terrazza.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-24">
          {articles.map((article, i) => (
            <article
              key={article.id}
              ref={el => { articlesRef.current[i] = el; }}
              className={`grid grid-cols-1 md:grid-cols-12 gap-10 items-start group cursor-pointer ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
            >
              {/* Photo */}
              <div className="md:col-span-7 overflow-hidden aspect-[16/9] relative">
                <div className="absolute top-4 left-4 z-10 text-[7rem] font-serif text-white opacity-15 leading-none select-none">
                  {article.id}
                </div>
                <img
                  src={article.photo}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000"
                  loading="lazy"
                />
              </div>

              {/* Text */}
              <div className="md:col-span-5 [direction:ltr] flex flex-col justify-center pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] tracking-[0.3em] text-[#D4AF37] uppercase font-bold">{article.category}</span>
                  <span className="w-4 h-px bg-[#D4AF37]/40" />
                  <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">{article.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif mb-4 leading-snug group-hover:text-[#D4AF37] transition-colors duration-500">
                  {article.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 mb-8">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#0A1128] group-hover:text-[#D4AF37] transition-colors duration-500">
                  <span>Leggi l'articolo</span>
                  <span className="text-base leading-none group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  <span className="text-gray-400 ml-2">{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#0A1128] text-white/40 py-8 px-6 lg:px-20 text-center text-[10px] tracking-[0.2em] uppercase">
        © 2026 Il Veliero · San Vito Lo Capo · Sicilia
      </footer>
    </div>
  );
}
