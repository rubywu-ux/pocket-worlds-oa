/**
 * The opening sequence, in order. Each step starts at the given time (ms) after "Open".
 *  wiggle   – anticipation: the box squashes and shakes, a sprout pushes out
 *  bloom    – the bud bursts, the heart box splits open like petals, items rise out
 *  envelope – the envelope floats to the center, everything else dims
 *  noteOut  – the folded note slides up out of the envelope
 *  unfold   – the note unfolds panel by panel and grows to reading size
 *  read     – the sticker slaps on; Sage reads; "Continue" settles everything in place
 */
export const STEPS = ['wiggle', 'bloom', 'envelope', 'noteOut', 'unfold', 'read'] as const
export type Step = (typeof STEPS)[number]
export type Phase = 'idle' | 'opening' | 'open' | 'closed'

export const TIMELINE: Record<Step, number> = {
  wiggle: 0,
  bloom: 1150,
  envelope: 2750,
  noteOut: 3350,
  unfold: 3950,
  read: 4850,
}

/** Same order, compressed, for people who prefer reduced motion. */
export const TIMELINE_REDUCED: Record<Step, number> = {
  wiggle: 0,
  bloom: 150,
  envelope: 900,
  noteOut: 1150,
  unfold: 1400,
  read: 1800,
}

/** Taps this soon after "Open" are treated as an accidental double-tap, not a skip. */
export const SKIP_GRACE_MS = 450

export const stepIndex = (s: Step) => STEPS.indexOf(s)
