import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { SoundToggle } from '../shared/SoundToggle'
import { ClosedView } from './components/ClosedView'
import { PicnicStage } from './components/PicnicStage'
import { OpenView } from './components/OpenView'

type Phase = 'intro' | 'open' | 'closed'

/** Variation 2 · "Pull the ribbon": drag the letter to snap the ribbon; the gifts tumble onto a picnic blanket. */
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
      <main className="app app--v2" data-phase={phase}>
        <div className="variant-tag" aria-hidden>
          V2 · Pull the ribbon
        </div>
        <SoundToggle />
        <LayoutGroup>
          <AnimatePresence>
            {phase === 'intro' && <PicnicStage key={`picnic-${run}`} onDone={done} />}
            {phase === 'open' && <OpenView key={`open-${run}`} skipped={skipped} onReplay={replay} onClose={close} />}
            {phase === 'closed' && <ClosedView key="closed" onRestart={replay} />}
          </AnimatePresence>
        </LayoutGroup>
      </main>
    </MotionConfig>
  )
}
