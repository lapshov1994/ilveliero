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
// Real seagull recording — European Herring Gull (Larus argentatus),
// xeno-canto XC707075 via Wikimedia Commons. Played as a one-shot
// sample so the cry is unmistakably a real bird, not a synth.
const SEAGULL_URL = `${import.meta.env.BASE_URL}audio/seagull.mp3`;

export default function SeaSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  // Seagull cries are routed to a SEPARATE master gain that bypasses
  // the surf master. This is critical: it means the gulls are loud
  // and clearly audible the moment the user starts interacting,
  // instead of being buried under the swelling noise floor.
  const gullMasterRef = useRef<GainNode | null>(null);
  // Decoded seagull buffer — fetched once on first activation, reused
  // for every cry so playback is instant and never re-decodes.
  const gullBufferRef = useRef<AudioBuffer | null>(null);
  const startedRef = useRef(false);
  const intensityRef = useRef(0);
  const decayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Schedule handle for the next seagull call, so we can clear it on
  // unmount and re-arm cleanly across activity windows.
  const gullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
     * Play one seagull cry from the loaded recording. We pick a
     * random ~0.9–1.6s slice of the file, apply a tiny pitch detune
     * and random stereo placement so consecutive cries feel like
     * different birds in different parts of the sky. A short
     * fade-in/fade-out prevents clicks at the slice boundaries.
     */
    const playSeagull = (ctx: AudioContext, dest: AudioNode) => {
      const buffer = gullBufferRef.current;
      if (!buffer) return;

      const now = ctx.currentTime + 0.02;
      const sliceDur = 0.9 + Math.random() * 0.7; // 0.9..1.6s
      const maxStart = Math.max(0, buffer.duration - sliceDur - 0.05);
      const startOffset = Math.random() * maxStart;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      // Subtle pitch variation so each cry differs (±2 semitones).
      const rate = 0.88 + Math.random() * 0.24;
      src.playbackRate.value = rate;

      // The `duration` argument of start() is in BUFFER time — it
      // controls how many seconds of source audio are consumed. The
      // resulting playback length in CONTEXT time is bufferDur/rate,
      // because higher playbackRate consumes the buffer faster. We
      // also clamp gain ramps and stop() to the same context-time
      // length so fades land exactly on the audio tail.
      const bufferDur = sliceDur; // seconds of source audio to consume
      const ctxDur = bufferDur / rate; // resulting play length in ctx seconds

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.75;

      // "Distance" — closer vs farther cries.
      const distance = 0.55 + Math.random() * 0.45;
      const peakGain = 0.95 * distance;

      // Fade tail length scaled to the actual playback length so very
      // short cries still get a clean release.
      const fadeTail = Math.min(0.18, ctxDur * 0.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      g.gain.setValueAtTime(peakGain, now + Math.max(0.05, ctxDur - fadeTail));
      g.gain.exponentialRampToValueAtTime(0.0005, now + ctxDur);

      if (pan) {
        src.connect(g).connect(pan).connect(dest);
      } else {
        src.connect(g).connect(dest);
      }

      src.start(now, startOffset, bufferDur + 0.05);
      src.stop(now + ctxDur + 0.05);

      // Disconnect the per-call nodes once the cry is done so they
      // don't pile up across many calls.
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
     * Schedule the next seagull cry. Self-rescheduling: each call
     * decides when the NEXT one fires. This guarantees a steady
     * cadence whenever the user is interacting at all — the bird
     * doesn't depend on a tick-by-tick coin flip.
     */
    const scheduleNextGull = () => {
      if (gullTimerRef.current) clearTimeout(gullTimerRef.current);
      // 4–10 second gap between cries.
      const delay = 4000 + Math.random() * 6000;
      gullTimerRef.current = setTimeout(() => {
        const c = ctxRef.current;
        const gm = gullMasterRef.current;
        if (c && gm && intensityRef.current > 0.10) {
          // The user is engaged enough to "hear" the seaside — call.
          playSeagull(c, gm);
          scheduleNextGull();
        } else if (c && gm) {
          // Quiet: try again sooner so the bird is ready to cry as
          // soon as the user resumes scrolling.
          gullTimerRef.current = setTimeout(scheduleNextGull, 800);
        }
      }, delay);
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

      // Separate master for the seagulls — bypasses the surf gain so
      // gulls are clearly audible the moment the user is engaged.
      const gullMaster = ctx.createGain();
      gullMaster.gain.value = 0;
      gullMaster.connect(ctx.destination);
      gullMasterRef.current = gullMaster;

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

      // Fetch & decode the real seagull recording. Done once on first
      // activation so subsequent cries are instant. If the fetch
      // fails (offline, etc.), the scheduler simply skips calls
      // because gullBufferRef stays null.
      fetch(SEAGULL_URL)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((decoded) => {
          gullBufferRef.current = decoded;
        })
        .catch(() => undefined);

      // Decay loop. Runs at ~20Hz. Each tick:
      //   - intensity decays towards 0 (→ true silence when idle)
      //   - surf master gain follows intensity smoothly
      //   - gull master gain follows intensity with a low threshold so
      //     ANY meaningful interaction makes the gulls audible
      decayTimerRef.current = setInterval(() => {
        const c = ctxRef.current;
        const m = masterRef.current;
        const gm = gullMasterRef.current;
        if (!c || !m || !gm) return;

        // Intensity decays slowly so brief gestures DO build up if
        // they keep coming, but a true pause silences quickly.
        intensityRef.current *= 0.94; // ~0.94^20 ≈ 0.29 per second

        // Below a tiny floor, snap to 0 so silence really is silence.
        if (intensityRef.current < 0.01) intensityRef.current = 0;

        const surfTarget = intensityRef.current * 0.22; // peak surf gain ≈ 0.22
        m.gain.setTargetAtTime(surfTarget, c.currentTime, 0.08);

        // Gulls go to full volume the moment intensity passes a low
        // threshold — they're a featured part of the soundscape, not
        // a background detail.
        const gullTarget = intensityRef.current > 0.10 ? 1.0 : 0;
        gm.gain.setTargetAtTime(gullTarget, c.currentTime, 0.12);
      }, 50);

      // Kick the seagull scheduler off once the soundscape is built.
      // First cry comes ~1 second after the user starts interacting —
      // the seaside character is established almost immediately. We
      // wait for the buffer to be decoded; if it's still loading,
      // poll briefly until it's ready (the file is small, so this
      // typically resolves within the first few hundred ms).
      const fireFirstGull = () => {
        const c = ctxRef.current;
        const gm = gullMasterRef.current;
        if (!c || !gm) return;
        if (gullBufferRef.current) {
          if (intensityRef.current > 0.05) playSeagull(c, gm);
          scheduleNextGull();
        } else {
          // Buffer still loading — try again shortly.
          gullTimerRef.current = setTimeout(fireFirstGull, 150);
        }
      };
      gullTimerRef.current = setTimeout(fireFirstGull, 1000);
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
      if (gullTimerRef.current) clearTimeout(gullTimerRef.current);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
        ctxRef.current = null;
        masterRef.current = null;
        gullMasterRef.current = null;
      }
    };
  }, []);

  return null;
}
