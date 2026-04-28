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
          {/* Grain texture — diagnostic visible */}
          <div className="fixed inset-0 z-[999] pointer-events-none opacity-[0.08] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          {/* Global overlays */}
          <Cursor />
          <WindLines />
          <Navigation />

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
