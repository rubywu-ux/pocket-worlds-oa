import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion } from 'motion/react'
import { ClosedView } from './components/ClosedView'
import { OpenView } from './components/OpenView'
import { Stage } from './components/Stage'
import { SKIP_GRACE_MS, STEPS, TIMELINE, TIMELINE_REDUCED, type Phase, type Step } from './timeline'

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported (iOS, desktop) */
  }
}

/** Variation 2: an independent copy of the prototype for exploring a different animation approach. */
export default function App() {
  const reduced = useReducedMotion() ?? false
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState<Step>('wiggle')
  const [run, setRun] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const timers = useRef<number[]>([])
  const startedAt = useRef(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  /** Start (or replay) the opening sequence. */
  const start = useCallback(() => {
    clearTimers()
    const times = reduced ? TIMELINE_REDUCED : TIMELINE
    // Keep the same stage when opening from idle; mount a fresh one when replaying.
    if (phaseRef.current !== 'idle') setRun((r) => r + 1)
    setSkipped(false)
    setStep('wiggle')
    setPhase('opening')
    startedAt.current = performance.now()
    buzz(10)
    for (const s of STEPS) {
      const t = times[s]
      if (t !== null && t > 0) timers.current.push(window.setTimeout(() => setStep(s), t))
    }
    timers.current.push(window.setTimeout(() => buzz([18, 40, 26]), times.bloom ?? 0))
  }, [reduced])

  /** Jump to the opened gift. viaSkip = the animation was cut short. */
  const finish = useCallback((viaSkip: boolean) => {
    clearTimers()
    setSkipped(viaSkip)
    setPhase('open')
  }, [])

  /** One tap handler for the whole experience: open → skip → open the letter → continue. */
  const advance = useCallback(() => {
    if (phase === 'idle') return start()
    if (phase !== 'opening') return
    if (performance.now() - startedAt.current < SKIP_GRACE_MS) return
    if (step === 'letter') {
      buzz(12)
      setStep('read')
      return
    }
    finish(step !== 'read')
  }, [phase, step, start, finish])

  const close = useCallback(() => {
    clearTimers()
    setPhase('closed')
  }, [])

  const restart = useCallback(() => {
    clearTimers()
    setPhase('idle')
  }, [])

  // Keyboard: Space/Enter opens, skips and continues; R replays; Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const onControl = (e.target as HTMLElement)?.closest?.('button, [role="button"]')
      if ((e.key === ' ' || e.key === 'Enter') && !onControl && (phase === 'idle' || phase === 'opening')) {
        e.preventDefault()
        advance()
      } else if (e.key.toLowerCase() === 'r' && (phase === 'open' || phase === 'opening')) {
        start()
      } else if (e.key === 'Escape' && phase === 'open') {
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, advance, start, close])

  return (
    <MotionConfig reducedMotion="user">
      <main className="app" data-phase={phase}>
        <div className="variant-tag" aria-hidden>Variation 2</div>
        <LayoutGroup>
          <AnimatePresence>
            {(phase === 'idle' || phase === 'opening') && (
              <Stage key={`stage-${run}`} phase={phase} step={step} reduced={reduced} onAdvance={advance} />
            )}
            {phase === 'open' && <OpenView key={`open-${run}`} skipped={skipped} onReplay={start} onClose={close} />}
            {phase === 'closed' && <ClosedView key="closed" onRestart={restart} />}
          </AnimatePresence>
        </LayoutGroup>
      </main>
    </MotionConfig>
  )
}
