import React, { useEffect, useRef } from 'react';
import InnerPageHeader from '@/components/InnerPageHeader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const articles = [
  {
    id: '01',
    date: 'Aprile 2026',
    category: 'Territorio',
    title: 'La Sicilia attraverso gli occhi dei Valenti',
    excerpt: 'Tre generazioni di ospitalità in un luogo fuori dal tempo. Vi raccontiamo come siamo arrivati a San Vito, e perché non siamo mai ripartiti.',
    readTime: '5 min',
    photo: 'https://images.unsplash.com/photo-1533939311960-40f6a4b5d3ab?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '02',
    date: 'Marzo 2026',
    category: 'Natura',
    title: 'I sentieri segreti della Riserva dello Zingaro',
    excerpt: 'Calette nascoste, profumo di finocchietto selvatico e il silenzio del Mediterraneo antico. Una guida autentica per chi vuole davvero esplorare.',
    readTime: '7 min',
    photo: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: '03',
    date: 'Febbraio 2026',
    category: 'Cultura',
    title: "L'arte della colazione siciliana",
    excerpt: "Granita di mandorla, brioscia col tuppo e caffè d'orzo. Ogni mattina da noi è un rituale lento. Vi spieghiamo come replicarlo a casa.",
    readTime: '4 min',
    photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=900&auto=format&fit=crop',
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
            Storie<br/><span className="italic">di Sicilia</span>
          </h1>
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
