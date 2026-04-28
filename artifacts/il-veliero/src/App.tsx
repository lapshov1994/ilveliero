import React, { useEffect } from 'react';
import { Router as WouterRouter, Switch, Route } from 'wouter';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { NavProvider } from '@/components/NavigationContext';
import Navigation from '@/components/Navigation';
import Cursor from '@/components/Cursor';
import WindLines from '@/components/WindLines';

import Hero from '@/pages/Hero';
import Story from '@/pages/Story';
import Family from '@/pages/Family';
import DimoreTeaser from '@/pages/DimoreTeaser';
import Footer from '@/pages/Footer';
import Rooms from '@/pages/Rooms';
import Gallery from '@/pages/Gallery';
import Blog from '@/pages/Blog';

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <Family />
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

    return () => {
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <NavProvider>
        <div className="bg-white min-h-screen overflow-x-hidden relative cursor-none md:cursor-none">
          {/* Global overlays */}
          <Cursor />
          <WindLines />
          <Navigation />
          {/* Grain texture */}
          <div
            className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              backgroundSize: '128px 128px',
            }}
          />

          {/* Routes */}
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/blog" component={Blog} />
          </Switch>
        </div>
      </NavProvider>
    </WouterRouter>
  );
}
