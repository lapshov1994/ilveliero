import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible component. There is no UI and no toggle. The
 * sea is only heard while the user is actively touching the page —
 * moving the mouse, scrolling, or touching the screen. The instant
 * the user stops, the sound fades back to silence.
 *
 * Why no on-screen control:
 *   - The brief asked for sound to be tied DIRECTLY to interaction
 *     ("звук моря именно при таче или скролле / от касания мышки или
 *     тача"). The user "stirring" the page is what plays the sea.
 *
 * Audio is SYNTHESISED with the Web Audio API:
 *   - Two layers of brown noise driven through low-pass filters whose
 *     cutoffs are slowly modulated by out-of-phase LFOs — the swells
 *     therefore never line up and the loop is genuinely seamless.
 *   - A third pink-noise layer through a band-pass filter adds the
 *     airy hiss of foam / spray.
 *
 * Browser autoplay policy is respected by initialising the
 * AudioContext only on the first qualifying user gesture
 * (mousemove / mousedown / scroll / touchstart / touchmove / keydown).
 * Once started, it stays in memory but its master gain is ramped to 0
 * whenever the user is idle, so silence is true silence.
 */
export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  // Idle timer that ramps the master gain back to 0 after the user
  // stops interacting.
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /** Generate a brown-noise-filled AudioBuffer (mono). */
    const makeBrownNoise = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
      return buf;
    };

    /** Pink-noise approximation (Voss-McCartney). */
    const makePinkNoise = (ctx: AudioContext, seconds: number): AudioBuffer => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      return buf;
    };

    /**
     * Build the sea soundtrack ONCE, on the first qualifying user
     * gesture. We never tear it down — bringing the master gain to 0
     * is functionally silent and avoids the audible artefacts of
     * stopping/starting buffer sources every few seconds.
     */
    const ensureStarted = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterRef.current = master;

      // Layer 1 — deep slow swell.
      const brown1 = ctx.createBufferSource();
      brown1.buffer = makeBrownNoise(ctx, 10);
      brown1.loop = true;
      const lp1 = ctx.createBiquadFilter();
      lp1.type = 'lowpass';
      lp1.frequency.value = 600;
      lp1.Q.value = 0.6;
      const lfo1 = ctx.createOscillator();
      lfo1.frequency.value = 0.07;
      const lfo1Gain = ctx.createGain();
      lfo1Gain.gain.value = 350;
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(lp1.frequency);
      const g1 = ctx.createGain();
      g1.gain.value = 0.85;
      brown1.connect(lp1).connect(g1).connect(master);

      // Layer 2 — faster swell, out of phase with layer 1.
      const brown2 = ctx.createBufferSource();
      brown2.buffer = makeBrownNoise(ctx, 10);
      brown2.loop = true;
      const lp2 = ctx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.value = 900;
      lp2.Q.value = 0.7;
      const lfo2 = ctx.createOscillator();
      lfo2.frequency.value = 0.11;
      const lfo2Gain = ctx.createGain();
      lfo2Gain.gain.value = 500;
      lfo2.connect(lfo2Gain);
      lfo2Gain.connect(lp2.frequency);
      const g2 = ctx.createGain();
      g2.gain.value = 0.55;
      brown2.connect(lp2).connect(g2).connect(master);

      // Layer 3 — band-passed pink noise (foam / spray hiss).
      const pink = ctx.createBufferSource();
      pink.buffer = makePinkNoise(ctx, 10);
      pink.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2800;
      bp.Q.value = 0.9;
      const g3 = ctx.createGain();
      g3.gain.value = 0.06;
      const lfo3 = ctx.createOscillator();
      lfo3.frequency.value = 0.08;
      const lfo3Gain = ctx.createGain();
      lfo3Gain.gain.value = 0.05;
      lfo3.connect(lfo3Gain);
      lfo3Gain.connect(g3.gain);
      pink.connect(bp).connect(g3).connect(master);

      const t0 = ctx.currentTime;
      brown1.start(t0);
      brown2.start(t0);
      pink.start(t0);
      lfo1.start(t0);
      lfo2.start(t0);
      lfo3.start(t0);

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          /* user can interact again */
        }
      }
    };

    /**
     * Called on every interaction tick. Brings the master gain UP to
     * the listening level (smooth, click-free) and (re)schedules a
     * silent fade-out for shortly after the user stops.
     */
    const onActivity = () => {
      void ensureStarted();
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      // Resume if the autoplay gate left the context suspended.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      // Fast (180ms) ramp UP — the sea answers the gesture immediately.
      master.gain.linearRampToValueAtTime(0.18, t + 0.18);

      // Schedule an audio-thread fade-out so it survives even if the
      // page is throttled (background tab, etc.).
      const fadeStart = t + 0.32;
      const fadeEnd = fadeStart + 1.1;
      master.gain.setValueAtTime(0.18, fadeStart);
      master.gain.linearRampToValueAtTime(0, fadeEnd);

      // Keep a JS-side guard timer too — it lets us re-prime the audio
      // ramp on every fresh gesture without piling up scheduled
      // automation events from older gestures.
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        idleTimerRef.current = null;
      }, 1500);
    };

    // mousemove counts as a user gesture for AudioContext.resume() in
    // every modern browser; touchmove / touchstart / scroll likewise.
    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('touchmove', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('touchmove', onActivity);
      window.removeEventListener('scroll', onActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
        ctxRef.current = null;
        masterRef.current = null;
      }
    };
  }, []);

  return null;
}
