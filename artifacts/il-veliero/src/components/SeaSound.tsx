import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Trigger rules (per latest user request):
 *   • A trigger fires on touch, click, AND on desktop wheel/scroll
 *     so that audio plays both on tap and on scroll-listing.
 *   • A throttle of 700 ms between triggers prevents the surf bursts
 *     from merging into one continuous wash while the user scrolls.
 *   • Every trigger plays a 1.5-second surf wash with a slow fade
 *     in / fade out so it sounds like a real wave, not a chopped clip.
 *   • Every SECOND trigger also plays a real seagull cry on top of
 *     the surf — i.e. the gull is heard every other touch, never on
 *     consecutive ones.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;

// Throttle a touch wider than the surf's perceived attack so two
// quick gestures during a scroll never sound like a single chopped
// burst. With SURF_DURATION ≈ 2.5 s the wash trails off naturally
// inside this window and a fresh trigger lands as a clearly second
// wave, not a clip-edit.
const MIN_GAP_MS = 1100;
const SURF_DURATION = 2.5;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const lastFiredRef = useRef<number>(0);
  const triggerCountRef = useRef<number>(0);

  useEffect(() => {
    /** Brown-noise buffer — sounds like ocean wash once low-passed. */
    const makeNoiseBuffer = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
      return buf;
    };

    /**
     * Create the AudioContext and decode the seagull MP3 lazily, on
     * the first user gesture. Browsers reject audio output before a
     * user gesture, so this MUST happen inside an event handler call
     * stack (it does — onGesture awaits this).
     */
    const ensureContext = async (): Promise<AudioContext | null> => {
      if (ctxRef.current) return ctxRef.current;

      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;

      const ctx = new Ctor();
      ctxRef.current = ctx;
      noiseBufferRef.current = makeNoiseBuffer(ctx, 4.5);

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          /* ignore */
        }
      }

      try {
        const r = await fetch(SEAGULL_URL);
        const ab = await r.arrayBuffer();
        gullBufferRef.current = await ctx.decodeAudioData(ab);
      } catch {
        /* ignore — surf will still play */
      }

      return ctx;
    };

    /** Long, naturally-shaped surf wash. */
    const playSurf = (ctx: AudioContext) => {
      const noise = noiseBufferRef.current;
      if (!noise) return;
      const now = ctx.currentTime;
      const dur = SURF_DURATION;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      const offset = Math.random() * Math.max(0, noise.duration - dur - 0.05);

      // Softer surf:
      //   • lowpass dropped to 580 Hz so the noise reads as deep
      //     ocean rumble rather than wind-on-mic crackle;
      //   • peak gain reduced to 0.28 — a gentle wash, not a hiss;
      //   • fade-in / fade-out lengthened to ~0.9 s each so the wash
      //     swells in and decays out smoothly with no audible cut.
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 580;
      lp.Q.value = 0.4;

      const peak = 0.28;
      const fadeIn = Math.min(0.95, dur * 0.4);
      const fadeOut = Math.min(1.05, dur * 0.45);
      const sustainStart = now + fadeIn;
      const sustainEnd = now + dur - fadeOut;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, sustainStart);
      g.gain.setValueAtTime(peak, Math.max(sustainStart + 0.01, sustainEnd));
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(now, offset, dur + 0.05);
      src.stop(now + dur + 0.05);

      setTimeout(() => {
        try {
          src.disconnect();
          lp.disconnect();
          g.disconnect();
        } catch {
          /* ignore */
        }
      }, (dur + 0.5) * 1000);
    };

    /** One seagull cry, with pitch & stereo variation. */
    const playGull = (ctx: AudioContext) => {
      const buffer = gullBufferRef.current;
      if (!buffer) return;
      const now = ctx.currentTime;

      const sliceDur = 0.9 + Math.random() * 0.7;
      const maxStart = Math.max(0, buffer.duration - sliceDur - 0.05);
      const startOffset = Math.random() * maxStart;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const rate = 0.9 + Math.random() * 0.2;
      src.playbackRate.value = rate;
      const ctxDur = sliceDur / rate;

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.6;

      const peakGain = 0.95;
      const fadeTail = Math.min(0.18, ctxDur * 0.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      g.gain.setValueAtTime(peakGain, now + Math.max(0.05, ctxDur - fadeTail));
      g.gain.exponentialRampToValueAtTime(0.0005, now + ctxDur);

      if (pan) {
        src.connect(g).connect(pan).connect(ctx.destination);
      } else {
        src.connect(g).connect(ctx.destination);
      }

      src.start(now, startOffset, sliceDur + 0.05);
      src.stop(now + ctxDur + 0.05);

      setTimeout(() => {
        try {
          src.disconnect();
          g.disconnect();
          if (pan) pan.disconnect();
        } catch {
          /* ignore */
        }
      }, (ctxDur + 0.5) * 1000);
    };

    /**
     * Single throttled handler. Surf on every accepted trigger;
     * seagull only on every second accepted trigger.
     */
    const onGesture = () => {
      const now = performance.now();
      if (now - lastFiredRef.current < MIN_GAP_MS) return;
      lastFiredRef.current = now;
      triggerCountRef.current += 1;
      // Gull on every SECOND accepted trigger — i.e. 2nd, 4th, 6th… —
      // so consecutive taps never produce two gull cries in a row.
      const playGullThisTime = triggerCountRef.current % 2 === 0;

      void ensureContext().then((ctx) => {
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => undefined);
        }
        playSurf(ctx);
        if (playGullThisTime) playGull(ctx);
      });
    };

    // pointerdown covers BOTH touch and mouse-click in one event,
    // and wheel covers desktop trackpad / mouse-wheel scrolling.
    // Both are passive — we never preventDefault.
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('wheel', onGesture, { passive: true });
    window.addEventListener('keydown', onGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('wheel', onGesture);
      window.removeEventListener('keydown', onGesture);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
        ctxRef.current = null;
      }
    };
  }, []);

  return null;
}
