import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { SoundToggle } from '../shared/SoundToggle'
import { ClosedView } from './components/ClosedView'
import { GrowStage } from './components/GrowStage'
import { OpenView } from './components/OpenView'

type Phase = 'intro' | 'open' | 'closed'

/** Variation 1 · "Grow it": press and hold to water the gift until it blooms open. */
export default function App() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [run, setRun] = useState(0)
  const [skipped, setSkipped] = useState(false)

  const done = useCallback((viaSkip: boolean) => {
    setSkipped(viaSkip)
    setPhase('open')
  }, [])
  const replay = useCallback(() => {
    setRun((r) => r + 1)
    setPhase('intro')
  }, [])
  const close = useCallback(() => setPhase('closed'), [])

  // R replays, Esc closes (the stage handles Space/Enter itself)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && phase === 'open') replay()
      else if (e.key === 'Escape' && phase === 'open') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, replay, close])

  return (
    <MotionConfig reducedMotion="user">
      <main className="app app--v1" data-phase={phase}>
        <div className="variant-tag" aria-hidden>
          V1 · Grow it
        </div>
        <SoundToggle />
        <LayoutGroup>
          <AnimatePresence>
            {phase === 'intro' && <GrowStage key={`grow-${run}`} onDone={done} />}
            {phase === 'open' && <OpenView key={`open-${run}`} skipped={skipped} onReplay={replay} onClose={close} />}
            {phase === 'closed' && <ClosedView key="closed" onRestart={replay} />}
          </AnimatePresence>
        </LayoutGroup>
      </main>
    </MotionConfig>
  )
}
