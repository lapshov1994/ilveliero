import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import hotelImg1 from '@assets/1_1779216013206.jpeg';
import hotelImg2 from '@assets/2_1779216013206.jpeg';

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const containerRef = useRef<HTMLElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const image1WrapRef = useRef<HTMLDivElement>(null);
  const image2WrapRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Symmetric parallax: image starts ABOVE its centred resting position
    // and ends BELOW it. The image element is sized h-[130%] with -top-[15%]
    // so it has ~15% overflow on BOTH sides of the wrapper. As long as the
    // tween range (-40..+40 px) stays smaller than the available overflow,
    // the photo always covers the wrapper edge-to-edge — no exposed grey
    // background can appear at the top or bottom.
    gsap.fromTo(
      image1Ref.current,
      { y: -40 },
      {
        y: 40,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // image2 (welcome lifebuoy + chair) is rendered at its natural
    // aspect with no overflow padding, so a y-tween would either
    // expose blank background or get clipped at the photo edge. The
    // wrapper-level fade-in below already gives this photo a clean
    // entrance.

    [text1Ref.current, text2Ref.current].forEach((text) => {
      if (!text) return;
      gsap.fromTo(
        text,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
          },
        }
      );
    });

    // Image reveal — staggered fade-in + upward translate.
    // Targets the WRAPPER divs so it doesn't collide with the parallax y
    // tween already running on the inner <img> elements.
    [image1WrapRef.current, image2WrapRef.current].forEach((wrap, idx) => {
      if (!wrap) return;
      gsap.fromTo(
        wrap,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          delay: idx * 0.15,
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="majolica-bg relative bg-white text-[#0A1128] py-12 md:py-20 px-6 lg:px-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative">

        {/* Section heading */}
        <div className="mb-14 md:mb-24">
          <h2 className="text-sm tracking-[0.3em] text-[#D4AF37] uppercase mb-6">Hotel Il Veliero</h2>
          <p className="text-4xl md:text-6xl font-serif max-w-2xl leading-tight">
            Nel cuore di <br/>
            <span className="italic text-gray-400">San Vito Lo Capo.</span>
          </p>
        </div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-0 relative">

          {/* Left block — Garden & Breakfast (7 cols).
              No z-index here on purpose: it would create a stacking
              context that clamps the inner photo's z-[110] back down
              to z-10 in the global order, and the sand layer (z-105)
              would re-cover it. Keeping z auto lets the photo float
              freely above the sand at the root level. */}
          <div className="md:col-span-7 relative">
            <div ref={image1WrapRef} className="relative z-[110] isolate overflow-hidden aspect-[4/3] w-full bg-gray-100">
              <img
                ref={image1Ref}
                src={hotelImg1}
                alt="Hotel Il Veliero — la struttura nel cuore di San Vito Lo Capo"
                className="absolute -top-[15%] left-0 w-full h-[130%] object-cover scale-105"
              />
            </div>

            {/* Text overlaps photo from below — desktop overlays the bottom-right
                corner of the photo for an editorial feel; mobile sits cleanly
                full-width below the photo so nothing looks misaligned. */}
            <div
              ref={text1Ref}
              className="relative md:absolute md:-bottom-16 md:-right-24 bg-white p-8 md:p-12 shadow-2xl w-full md:w-[80%] mt-6 md:mt-0"
            >
              <h3 className="text-3xl font-serif mb-4">Un'accoglienza familiare</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Nel cuore di San Vito Lo Capo, a pochi passi dal mare cristallino
                della Sicilia occidentale, Hotel Il Veliero vi accoglie in un
                ambiente curato, familiare e profondamente legato al territorio.
                Le sue camere luminose, l'atmosfera autentica e la posizione
                strategica lo rendono il punto di partenza ideale per scoprire
                le meraviglie naturali e culturali della zona.
              </p>
            </div>
          </div>

          {/* Right block — Sea & Cleanliness (4 cols, shifted down).
              Same reasoning as the left block: no z-index so the inner
              photo's z-[110] isolates can rise above the sand layer. */}
          <div className="md:col-span-4 md:col-start-9 mt-14 md:mt-32 relative">
            {/* Natural-aspect frame — no fixed ratio, no parallax crop.
                The full photo (lifebuoy + chair, top to bottom) is
                always visible; nothing important is sacrificed to a
                grid-imposed aspect ratio. */}
            <div ref={image2WrapRef} className="relative z-[110] isolate w-full bg-gray-100 mb-8">
              <img
                ref={image2Ref}
                src={hotelImg2}
                alt="Hotel Il Veliero — ambiente curato e atmosfera familiare"
                className="block w-full h-auto"
              />
            </div>

            <div ref={text2Ref} className="px-4 md:px-0">
              <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase font-bold block mb-3">
                Comfort mediterraneo
              </span>
              <h3 className="text-2xl font-serif mb-4">Camere in stile siciliano</h3>
              <p className="text-sm leading-relaxed text-gray-600 mb-6">
                Le camere arredate in stile mediterraneo offrono comfort moderno
                e un'atmosfera serena. Ogni dettaglio è pensato per garantire
                una vacanza all'insegna del relax: aria condizionata, Wi-Fi
                gratuito, bagno privato e pulizia giornaliera.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
