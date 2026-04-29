import { useEffect, useRef } from 'react';

/**
 * SeaSound — invisible. The sea is heard only while the user is
 * actively engaged with the page (a held finger that scrolls, an
 * active mouse drag, a sustained scroll wheel). A momentary twitch
 * does almost nothing; sustained interaction swells the sea up to
 * full volume. Once the user stops, the sound fades back to true
 * silence.
 *
 * On top of the swell layers, a seagull cry occasionally calls out
 * while the surf is loud enough to mask its onset — never on a tick,
 * never predictable, but unmistakably "the seaside".
 *
 * Audio is fully synthesised — no asset files.
 */
export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const intensityRef = useRef(0);
  const decayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Last time a seagull was scheduled, so we space them out.
  const lastGullAtRef = useRef(0);

  useEffect(() => {
    /** Brown noise buffer (mono). */
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

    /** Pink noise (Voss-McCartney approximation). */
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
     * Schedule a single seagull call: 2–4 short, descending bandpass
     * chirps, with one or two slight detune wobbles to suggest a real
     * bird. The cry is panned to a random side of the stereo field
     * so consecutive cries feel like they come from different birds.
     */
    const playSeagull = (ctx: AudioContext, dest: AudioNode) => {
      const now = ctx.currentTime + 0.05;
      const numChirps = 2 + Math.floor(Math.random() * 3); // 2..4
      const baseFreq = 700 + Math.random() * 350; // bird-base pitch

      // Stereo placement (random side, near or far).
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() * 2 - 1) * 0.7;
        pan.connect(dest);
      }
      const gullDest: AudioNode = pan ?? dest;

      // Distance attenuation — random "far away" vs "closer" cries.
      const distance = 0.5 + Math.random() * 0.5; // 0.5..1
      const peakGain = 0.045 * distance;

      let cursor = now;
      for (let i = 0; i < numChirps; i++) {
        const dur = 0.10 + Math.random() * 0.10;
        const startT = cursor;
        const startF = baseFreq + (Math.random() - 0.5) * 120;
        const endF = startF * (0.55 + Math.random() * 0.18);

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startF, startT);
        osc.frequency.exponentialRampToValueAtTime(Math.max(140, endF), startT + dur);

        // Slight vibrato so the chirp doesn't sound robotic.
        const vibrato = ctx.createOscillator();
        vibrato.frequency.value = 18 + Math.random() * 10;
        const vibratoGain = ctx.createGain();
        vibratoGain.gain.value = 12 + Math.random() * 8;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = startF;
        bp.Q.value = 3 + Math.random() * 2;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, startT);
        g.gain.exponentialRampToValueAtTime(peakGain, startT + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0005, startT + dur);

        osc.connect(bp).connect(g).connect(gullDest);
        vibrato.start(startT);
        osc.start(startT);
        vibrato.stop(startT + dur + 0.05);
        osc.stop(startT + dur + 0.05);

        cursor += dur + 0.06 + Math.random() * 0.10;
      }

      // Disconnect the panner once the cry is done so it doesn't pile
      // up across many calls.
      if (pan) {
        setTimeout(() => {
          try {
            pan.disconnect();
          } catch {
            /* ignore */
          }
        }, 1500);
      }
    };

    /**
     * Build the sea soundtrack ONCE on the first qualifying user
     * gesture. Buffer sources stay running; only the master gain is
     * touched to follow user intensity.
     */
    const ensureStarted = () => {
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

      // Layer 3 — band-passed pink noise (foam / spray).
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
        ctx.resume().catch(() => undefined);
      }

      // Decay loop. Runs at ~20Hz. Each tick:
      //   - intensity decays towards 0 (→ true silence when idle)
      //   - master gain follows intensity smoothly via setTargetAtTime
      //   - while intensity is above a threshold, we sometimes schedule
      //     a seagull cry (very rarely — at most one per ~10s)
      decayTimerRef.current = setInterval(() => {
        const c = ctxRef.current;
        const m = masterRef.current;
        if (!c || !m) return;

        // Intensity decays slowly so brief gestures DO build up if
        // they keep coming, but a true pause silences quickly.
        intensityRef.current *= 0.94; // ~0.94^20 ≈ 0.29 per second

        // Below a tiny floor, snap to 0 so silence really is silence.
        if (intensityRef.current < 0.01) intensityRef.current = 0;

        const target = intensityRef.current * 0.22; // peak master gain ≈ 0.22
        // setTargetAtTime gives an exponential approach with NO clicks
        // even at very high update rates.
        m.gain.setTargetAtTime(target, c.currentTime, 0.08);

        // Seagull scheduling — only when the surf is actually present
        // (intensity > 0.45) AND at least 8s since last call AND a
        // 1-in-30 random hit per tick (avg cadence ~30s of qualifying
        // activity between cries).
        const tNow = c.currentTime;
        if (
          intensityRef.current > 0.45 &&
          tNow - lastGullAtRef.current > 8 &&
          Math.random() < 0.033
        ) {
          lastGullAtRef.current = tNow;
          playSeagull(c, m);
        }
      }, 50);
    };

    /**
     * Activity callback — invoked on each interaction event with a
     * specific "weight" for that event type. Touchmove (a real held
     * scroll on mobile) is the heaviest; mousemove is the lightest
     * because browsers fire it dozens of times for a stationary
     * cursor that just got bumped.
     *
     * Because intensity caps at 1.0, even a flurry of mousemoves
     * can't push the volume above the natural peak — the only way to
     * KEEP it loud is to keep interacting.
     */
    const bumpIntensity = (weight: number) => {
      intensityRef.current = Math.min(1, intensityRef.current + weight);
    };

    const onMouseMove = () => {
      ensureStarted();
      const c = ctxRef.current;
      if (c?.state === 'suspended') c.resume().catch(() => undefined);
      // Mousemove fires dozens of times for any small motion — give
      // each one only a tiny boost so a passing cursor doesn't summon
      // the whole sea instantly.
      bumpIntensity(0.025);
    };
    const onScroll = () => {
      ensureStarted();
      const c = ctxRef.current;
      if (c?.state === 'suspended') c.resume().catch(() => undefined);
      // Scroll events are coarser and represent real engagement —
      // each one is worth more than a mousemove.
      bumpIntensity(0.10);
    };
    const onTouchStart = () => {
      ensureStarted();
      const c = ctxRef.current;
      if (c?.state === 'suspended') c.resume().catch(() => undefined);
      // Putting a finger on the screen IS deliberate engagement.
      bumpIntensity(0.20);
    };
    const onTouchMove = () => {
      ensureStarted();
      const c = ctxRef.current;
      if (c?.state === 'suspended') c.resume().catch(() => undefined);
      // Held-finger scrolling (the canonical mobile reading gesture)
      // is the heaviest weight — this is precisely the case we want
      // to drive the surf to full volume.
      bumpIntensity(0.18);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
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
