import React, { useEffect } from 'react';
import { Router as WouterRouter, Switch, Route } from 'wouter';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { NavProvider } from '@/components/NavigationContext';
import Navigation from '@/components/Navigation';
import Cursor from '@/components/Cursor';
import SandFilter from '@/components/SandFilter';

import Hero from '@/pages/Hero';
import Story from '@/pages/Story';
import Family from '@/pages/Family';
import Services from '@/components/Services';
import DimoreTeaser from '@/pages/DimoreTeaser';
import Footer from '@/pages/Footer';
import Gallery from '@/pages/Gallery';
import About from '@/pages/About';

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <Hero />
      <div id="voyager-track">
        <Story />
        <Family />
        <Services />
      </div>
      <DimoreTeaser />
      <Footer />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    // Hash-link interception. Lenis hijacks scrolling so the browser's
    // built-in #anchor jump no longer works. We intercept clicks on
    // in-page hash links AND honour an initial #section in the URL.
    const scrollToHash = (hash: string) => {
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (!el) return;
      // Small offset so the navigation bar (≈70 px) doesn't cover headers.
      lenis.scrollTo(el as HTMLElement, { offset: -70, duration: 1.4 });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      history.replaceState(null, '', href);
      scrollToHash(href);
    };
    document.addEventListener('click', onClick);

    if (window.location.hash) {
      // Wait one frame for layout/Lenis to settle.
      requestAnimationFrame(() => scrollToHash(window.location.hash));
    }

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <NavProvider>
        <div className="bg-white min-h-screen relative cursor-none md:cursor-none">
          {/* Grain texture — refined film grain (sits below menu overlay z-[200]) */}
          <div
            className="fixed inset-0 z-[100] pointer-events-none opacity-[0.06] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              backgroundSize: '180px 180px',
            }}
          />
          {/* Global overlays */}
          <Cursor />
          <SandFilter />
          <Navigation />

          {/* Routes */}
          <main>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/gallery" component={Gallery} />
              <Route path="/galleria" component={Gallery} />
              <Route path="/about" component={About} />
              {/* Anything else falls back to the home page so old /rooms and
                  /blog URLs still land somewhere meaningful. */}
              <Route component={HomePage} />
            </Switch>
          </main>
        </div>
      </NavProvider>
    </WouterRouter>
  );
}
