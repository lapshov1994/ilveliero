import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible.
 *
 * Trigger rules (current user spec):
 *   • A trigger fires on EVERY tap (pointerdown / touchstart / click),
 *     every keypress, every mouse movement (pointermove), every wheel
 *     event, and every scroll event.
 *   • Triggers are throttled to one every 3 s — i.e. ~1 s SHORTER
 *     than the 4 s surf wash. Successive waves therefore overlap by
 *     about a second and crossfade into one another, so under any
 *     continuous user activity the surf reads as one unbroken
 *     ocean loop instead of a chopped staccato of half-waves.
 *   • Each accepted trigger plays a 4 s surf wash with long
 *     ~1.4 s / ~1.6 s fades so a single isolated gesture also
 *     decays to silence smoothly.
 *   • Every SECOND accepted trigger ALSO plays a real seagull cry on
 *     top of the surf — the gull is heard every other gesture
 *     (~6 s apart under continuous activity), never on consecutive
 *     ones.
 *
 * Browser autoplay policy:
 *   Chrome and Safari only allow an AudioContext to start (or resume
 *   from suspended) inside a "user activation" event — i.e. a real
 *   tap / click / key press. pointermove, wheel and scroll do NOT
 *   count. So the context is created and resumed inside the
 *   ACTIVATING_EVENTS handler only; the PASSIVE_EVENTS handler just
 *   plays sound when the context is already running. Without this
 *   split a visitor who only hovers / scrolls (never clicks) would
 *   create the context but it would stay forever muted.
 */
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;

// Surf wash is 4 s long. Triggers are throttled to 3 s — i.e. ~1 s
// SHORTER than the wave itself — so a fresh wave starts while the
// previous wave is still in its long fade-out tail. The two crossfade
// over each other and the listener never hears a silent gap between
// waves. Result: under continuous mouse / scroll activity the sound
// reads as one unbroken ocean loop, exactly as the user requested.
const MIN_GAP_MS = 3000;
const SURF_DURATION = 4;

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
      // Brown-noise pad — long enough that each surf grain (4 s) plus
      // a small head/tail margin can pull from a random offset.
      noiseBufferRef.current = makeNoiseBuffer(ctx, 6.0);

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

    /** Naturally-shaped 1.5 s surf wash. */
    const playSurf = (ctx: AudioContext) => {
      const noise = noiseBufferRef.current;
      if (!noise) return;
      const now = ctx.currentTime;
      const dur = SURF_DURATION;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      const offset = Math.random() * Math.max(0, noise.duration - dur - 0.05);

      // Soft, deep ocean-rumble character:
      //   • lowpass at 600 Hz so the noise reads as deep wash, not hiss;
      //   • peak gain 0.3 — gentle, never harsh;
      //   • long ~1.4 s fade-in and ~1.6 s fade-out. Combined with the
      //     1 s overlap between successive waves (MIN_GAP_MS = 3 s,
      //     SURF_DURATION = 4 s) the tail of one wave crossfades into
      //     the head of the next, so under continuous activity the
      //     listener hears one unbroken ocean loop — never a chopped
      //     staccato. The long fade-out also means a single isolated
      //     gesture decays naturally to silence over ~1.6 s instead
      //     of cutting off abruptly.
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      lp.Q.value = 0.4;

      const peak = 0.3;
      const fadeIn = Math.min(1.4, dur * 0.4);
      const fadeOut = Math.min(1.6, dur * 0.45);
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
     * "Real" user-activation events. Only these grant Chrome / Safari
     * the right to start (or resume) an AudioContext under the
     * autoplay policy. We MUST create + resume the context inside
     * one of these handlers — pointermove, wheel and scroll do not
     * count as activation and will leave the context stuck in
     * `suspended` state, producing total silence.
     */
    const ACTIVATING_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'click'] as const;

    /**
     * "Passive" events. These can also play surf, but ONLY if the
     * context has already been primed by an activating event — they
     * cannot prime it themselves.
     */
    const PASSIVE_EVENTS = ['pointermove', 'wheel', 'scroll'] as const;

    /** Shared, throttled "play one wave (and maybe a gull)" routine. */
    const playOnce = (ctx: AudioContext) => {
      const now = performance.now();
      if (now - lastFiredRef.current < MIN_GAP_MS) return;
      lastFiredRef.current = now;
      triggerCountRef.current += 1;
      // Gull on every SECOND accepted trigger — so consecutive
      // gestures never produce two gull cries in a row.
      const playGullThisTime = triggerCountRef.current % 2 === 0;
      playSurf(ctx);
      if (playGullThisTime) playGull(ctx);
    };

    /**
     * Activating handler. Primes (creates + resumes) the AudioContext
     * the first time, then plays a wave. Because it runs synchronously
     * inside a real user-activation event, Chrome / Safari will
     * actually allow `ctx.resume()` to succeed.
     */
    const onActivatingGesture = () => {
      void ensureContext().then((ctx) => {
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          // resume() inside the activation call stack is allowed.
          ctx.resume().catch(() => undefined);
        }
        playOnce(ctx);
      });
    };

    /**
     * Passive handler — fires on mouse motion, wheel, and scroll.
     * It does NOT try to create or resume the context (that would be
     * silently rejected by the browser autoplay policy and would
     * leave us in a "context exists but stays muted" state). Instead
     * it only plays when the activating handler has already primed
     * everything.
     */
    const onPassiveGesture = () => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== 'running') return;
      playOnce(ctx);
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    ACTIVATING_EVENTS.forEach((evt) => window.addEventListener(evt, onActivatingGesture, opts));
    PASSIVE_EVENTS.forEach((evt) => window.addEventListener(evt, onPassiveGesture, opts));

    return () => {
      ACTIVATING_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivatingGesture, opts),
      );
      PASSIVE_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onPassiveGesture, opts),
      );
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
