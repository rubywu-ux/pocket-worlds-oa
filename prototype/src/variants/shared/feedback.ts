/**
 * Sound + haptics for the exploration variations, modelled on Duolingo's feedback language:
 *  - every touch answers back (a soft "bloop" on taps, a light haptic tick)
 *  - anticipation climbs: notes step up a pentatonic ladder and haptics get stronger as a moment builds
 *  - the payoff is bright and major: a two-note "ding", a short fanfare, sparkles, a "success" buzz
 *  - sounds are short, tonal (marimba/bell-like), never harsh, and mixed quietly under a compressor
 *
 * Everything is synthesized with the Web Audio API (no audio files to load).
 * Haptics: the Vibration API where it exists (Android); on iOS 18+ Safari, toggling a hidden
 * <input type="checkbox" switch> gives a system haptic tick, so patterns become a few ticks.
 */
import { useSyncExternalStore } from 'react'

/* ---------- mute state (persisted per browser; sound only, haptics follow the device) ---------- */
const KEY = 'gt-sound-muted'
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
})()
const subs = new Set<() => void>()
export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(KEY, m ? '1' : '0')
  } catch {
    /* storage unavailable: keep it in memory */
  }
  if (m) audio?.c.suspend().catch(() => {})
  else ctx()
  subs.forEach((f) => f())
}
export function useMuted() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => muted,
    () => false,
  )
}

/* ---------- audio graph ---------- */
type Audio = { c: AudioContext; out: GainNode; noise: AudioBuffer }
let audio: Audio | null = null

function ctx(): Audio | null {
  if (muted || typeof window === 'undefined') return null
  if (!audio) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    const c = new C()
    const comp = c.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.knee.value = 14
    comp.ratio.value = 4
    comp.attack.value = 0.003
    comp.release.value = 0.2
    const out = c.createGain()
    out.gain.value = 0.75
    out.connect(comp)
    comp.connect(c.destination)
    const noise = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    audio = { c, out, noise }
  }
  if (audio.c.state === 'suspended') audio.c.resume().catch(() => {})
  return audio
}

/**
 * Browsers only allow sound after a user gesture. On phones (iOS Safari especially) the gesture only counts
 * when the finger LIFTS (touchend / pointerup / click), not when it first touches the screen (pointerdown),
 * so listen for all of them and keep trying until the audio is actually running.
 */
if (typeof window !== 'undefined') {
  const EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const
  const stop = () => EVENTS.forEach((e) => window.removeEventListener(e, unlock, true))
  function unlock() {
    const a = ctx()
    if (!a) return // muted: the sound toggle unlocks it when turned back on
    if (a.c.state === 'running') return stop()
    // iOS needs something to actually play inside the gesture
    const b = a.c.createBufferSource()
    b.buffer = a.c.createBuffer(1, 1, 22050)
    b.connect(a.out)
    b.start()
    a.c
      .resume()
      .then(() => {
        if (a.c.state === 'running') stop()
      })
      .catch(() => {})
  }
  EVENTS.forEach((e) => window.addEventListener(e, unlock, true))
}

const exp = (p: AudioParam, v: number, t: number) => p.exponentialRampToValueAtTime(Math.max(v, 0.0001), t)

type ToneOpts = { f: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; peak?: number; glide?: number }
function tone({ f, to, type = 'sine', at = 0, attack = 0.004, decay = 0.18, peak = 0.2, glide }: ToneOpts) {
  const a = ctx()
  if (!a) return
  const t = a.c.currentTime + at
  const o = a.c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (to) exp(o.frequency, to, t + (glide ?? attack + decay))
  const g = a.c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  exp(g.gain, peak, t + attack)
  exp(g.gain, 0.0001, t + attack + decay)
  o.connect(g)
  g.connect(a.out)
  o.start(t)
  o.stop(t + attack + decay + 0.05)
}

type NoiseOpts = { at?: number; dur?: number; peak?: number; type?: BiquadFilterType; f?: number; to?: number; q?: number; attack?: number }
function noise({ at = 0, dur = 0.25, peak = 0.15, type = 'bandpass', f = 1200, to, q = 1, attack = 0.01 }: NoiseOpts) {
  const a = ctx()
  if (!a) return
  const t = a.c.currentTime + at
  const src = a.c.createBufferSource()
  src.buffer = a.noise
  const filt = a.c.createBiquadFilter()
  filt.type = type
  filt.Q.value = q
  filt.frequency.setValueAtTime(f, t)
  if (to) exp(filt.frequency, to, t + attack + dur)
  const g = a.c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  exp(g.gain, peak, t + attack)
  exp(g.gain, 0.0001, t + attack + dur)
  src.connect(filt)
  filt.connect(g)
  g.connect(a.out)
  src.start(t, Math.random() * 0.8)
  src.stop(t + attack + dur + 0.05)
}

/** Marimba-ish mallet note: warm fundamental + a quick bright partial. Duolingo's chimes live here. */
function mallet(f: number, at = 0, peak = 0.2, decay = 0.38) {
  tone({ f, at, peak, decay })
  tone({ f: f * 4, at, peak: peak * 0.16, decay: decay * 0.22 })
  tone({ f: f * 2, at, peak: peak * 0.12, decay: decay * 0.5, type: 'triangle' })
}
/** Glockenspiel-ish bell for the shimmering top of a fanfare. */
function bell(f: number, at = 0, peak = 0.12, decay = 1) {
  tone({ f, at, peak, decay })
  tone({ f: f * 2.76, at, peak: peak * 0.22, decay: decay * 0.4 })
  tone({ f: f * 5.4, at, peak: peak * 0.07, decay: decay * 0.2 })
}

/** C-major pentatonic, C5 upward: every step sounds good after the last one. */
const LADDER = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093]
const note = (i: number) => LADDER[Math.max(0, Math.min(LADDER.length - 1, i))]

export const sfx = {
  /** Soft "bloop" for buttons and taps */
  tap() {
    tone({ f: 640, to: 420, decay: 0.08, peak: 0.12 })
  },
  /** Bubbly pop for things appearing (pitch steps up with i) */
  pop(i = 0) {
    const f = 330 * Math.pow(2, i / 6)
    tone({ f, to: f * 2.4, decay: 0.11, peak: 0.24, glide: 0.06 })
  },
  /** One rung of the build-up ladder: call with 0, 1, 2… as progress climbs */
  step(i: number) {
    mallet(note(i), 0, 0.16, 0.3)
  },
  /** The "correct!" two-note ding */
  ding() {
    mallet(note(5), 0, 0.2, 0.32)
    mallet(note(7), 0.09, 0.22, 0.55)
  },
  /** Celebration: a quick major arpeggio capped with a bell and sparkles (the "lesson complete" moment) */
  fanfare() {
    ;[0, 2, 3, 5].forEach((n, i) => mallet(note(n), i * 0.075, 0.2, 0.42))
    bell(note(7), 0.3, 0.14, 1.3)
    bell(note(9), 0.34, 0.08, 1.1)
    sfx.sparkle(0.42)
  },
  /** High twinkles */
  sparkle(at = 0) {
    for (let i = 0; i < 6; i++) tone({ f: note(6 + ((i * 3) % 5)) * 1.5, at: at + i * 0.05, type: 'triangle', decay: 0.16, peak: 0.05 })
  },
  /** Air movement: things flying in or out */
  whoosh(up = true, at = 0) {
    noise({ at, dur: 0.32, peak: 0.12, f: up ? 500 : 2600, to: up ? 2600 : 500, q: 0.9, attack: 0.08 })
  },
  /** Short, light swish (a card being dealt) */
  swish(at = 0) {
    noise({ at, dur: 0.12, peak: 0.08, f: 1800, to: 4200, q: 1.2, attack: 0.02 })
  },
  /** Soft landing; pitch drops with i so a few in a row sound like bounces */
  thud(i = 0) {
    tone({ f: 190 - i * 18, to: 70, decay: 0.16, peak: 0.32, glide: 0.12 })
    noise({ dur: 0.06, peak: 0.08, type: 'lowpass', f: 500 })
  },
  /** Cartoon spring-back */
  boing() {
    tone({ f: 260, to: 520, decay: 0.09, peak: 0.16, glide: 0.06 })
    tone({ f: 520, to: 240, at: 0.07, decay: 0.22, peak: 0.12, glide: 0.2 })
  },
  /** Ribbon / string snapping */
  snap() {
    noise({ dur: 0.07, peak: 0.32, type: 'highpass', f: 1800, attack: 0.001 })
    tone({ f: 170, to: 48, decay: 0.24, peak: 0.36, glide: 0.2 })
    tone({ f: 1400, to: 300, decay: 0.12, peak: 0.08, type: 'triangle', glide: 0.1 })
  },
  /** Paper sliding */
  paper(at = 0) {
    noise({ at, dur: 0.3, peak: 0.07, f: 2800, to: 4200, q: 0.7, attack: 0.05 })
  },
  /** Card flip: a crisp flick plus a rising note */
  flip(i = 0) {
    noise({ dur: 0.045, peak: 0.12, f: 3200, q: 1.4, attack: 0.001 })
    mallet(note(3 + i * 2), 0.03, 0.15, 0.28)
  },
  /** Collect / coin-like blip into storage */
  collect(i = 0) {
    tone({ f: note(4 + i), type: 'triangle', decay: 0.07, peak: 0.12 })
    tone({ f: note(7 + i), type: 'triangle', at: 0.06, decay: 0.2, peak: 0.12 })
  },
  /** Box rattling while it charges */
  rattle() {
    for (let i = 0; i < 3; i++) noise({ at: i * 0.055, dur: 0.035, peak: 0.07, f: 900 + i * 300, q: 2, attack: 0.002 })
  },
  /** A climbing charge-up tone (V3's shake before the pop) */
  charge(dur = 0.5) {
    tone({ f: 260, to: 1040, type: 'triangle', attack: 0.02, decay: dur, peak: 0.07, glide: dur })
  },
}

/** Continuous water pour, while Sage holds the watering button. */
export function startWater() {
  const a = ctx()
  if (!a) return { stop() {} }
  const t = a.c.currentTime
  const src = a.c.createBufferSource()
  src.buffer = a.noise
  src.loop = true
  const lp = a.c.createBiquadFilter()
  lp.type = 'bandpass'
  lp.frequency.value = 1500
  lp.Q.value = 0.6
  const g = a.c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  exp(g.gain, 0.08, t + 0.12)
  // a little burble: wobble the filter
  const lfo = a.c.createOscillator()
  lfo.frequency.value = 9
  const lfoAmt = a.c.createGain()
  lfoAmt.gain.value = 500
  lfo.connect(lfoAmt)
  lfoAmt.connect(lp.frequency)
  src.connect(lp)
  lp.connect(g)
  g.connect(a.out)
  src.start(t)
  lfo.start(t)
  return {
    stop() {
      const n = a.c.currentTime
      g.gain.cancelScheduledValues(n)
      g.gain.setValueAtTime(g.gain.value, n)
      exp(g.gain, 0.0001, n + 0.15)
      src.stop(n + 0.2)
      lfo.stop(n + 0.2)
    },
  }
}

/** Ribbon tension: a soft creak whose pitch rises as it stretches. */
export function startStretch() {
  const a = ctx()
  if (!a) return { set(_: number) {}, stop() {} }
  const t = a.c.currentTime
  const o = a.c.createOscillator()
  o.type = 'triangle'
  o.frequency.value = 140
  const lp = a.c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const g = a.c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  o.connect(lp)
  lp.connect(g)
  g.connect(a.out)
  o.start(t)
  return {
    set(amount: number) {
      const n = a.c.currentTime
      o.frequency.setTargetAtTime(140 + amount * 300, n, 0.03)
      g.gain.setTargetAtTime(0.012 + amount * 0.06, n, 0.04)
    },
    stop() {
      const n = a.c.currentTime
      g.gain.cancelScheduledValues(n)
      g.gain.setTargetAtTime(0.0001, n, 0.03)
      o.stop(n + 0.2)
    },
  }
}

/* ---------- haptics ---------- */
const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

function iosTick() {
  try {
    const label = document.createElement('label')
    label.ariaHidden = 'true'
    label.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.appendChild(input)
    document.head.appendChild(label)
    label.click()
    document.head.removeChild(label)
  } catch {
    /* not supported */
  }
}

function vibe(pattern: number | number[]) {
  if (canVibrate) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* blocked */
    }
    return
  }
  if (!coarse) return
  const p = Array.isArray(pattern) ? pattern : [pattern]
  let t = 0
  p.forEach((d, i) => {
    if (i % 2 === 0) window.setTimeout(iosTick, t)
    t += d
  })
}

export const haptic = {
  /** barely-there tick (each rung of a build-up) */
  tick: () => vibe(6),
  /** a tap on a button */
  light: () => vibe(12),
  medium: () => vibe(22),
  heavy: () => vibe(38),
  /** the payoff: three quick pulses */
  success: () => vibe([18, 60, 26, 60, 44]),
  /** build-up that gets stronger with i */
  build: (i: number) => vibe(6 + Math.min(i, 8) * 4),
}
