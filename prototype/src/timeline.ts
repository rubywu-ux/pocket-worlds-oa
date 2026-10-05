/**
 * The opening sequence, in order.
 *  wiggle    – anticipation: the box squashes and shakes, a sprout pushes out
 *  bloom     – the bud bursts: flowers spill out of the box, items rise out
 *  envelope  – the envelope floats to the center, everything else dims
 *  letterOut – the letter card ("from: Irene / sending to: Sage") slips out of the envelope
 *  letter    – the letter comes forward and waits: "Tap to open"
 *  read      – (on tap) the letter fades into Irene's note; the sticker slaps on; "Continue"
 *
 * Steps up to `letter` play on a timer. `read` waits for Sage to tap the letter.
 */
export const STEPS = ['wiggle', 'bloom', 'envelope', 'letterOut', 'letter', 'read'] as const
export type Step = (typeof STEPS)[number]
export type Phase = 'idle' | 'opening' | 'open' | 'closed'

/** Start time (ms after "Open") for each timed step. `null` = waits for a tap. */
export const TIMELINE: Record<Step, number | null> = {
  wiggle: 0,
  bloom: 1150,
  envelope: 2750,
  letterOut: 3350,
  letter: 4000,
  read: null,
}

/** Same order, compressed, for people who prefer reduced motion. */
export const TIMELINE_REDUCED: Record<Step, number | null> = {
  wiggle: 0,
  bloom: 150,
  envelope: 900,
  letterOut: 1150,
  letter: 1450,
  read: null,
}

/** Taps this soon after "Open" are treated as an accidental double-tap, not a skip. */
export const SKIP_GRACE_MS = 450

export const stepIndex = (s: Step) => STEPS.indexOf(s)
