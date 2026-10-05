import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react'
import { SoundToggle } from '../shared/SoundToggle'
import { GrowCollectStage } from './components/GrowCollectStage'
import { OpenView } from './components/OpenView'

type Phase = 'intro' | 'open'

/** Variation 4 · "Grow & collect": V1's watering game, V3's reward cards + storage, and V3's "Say thanks" ending. */
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
  // Ruby: ✕ (or Esc) takes you back to the start, the "Water it" screen, to play the flow again.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'open') replay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, replay])

  return (
    <MotionConfig reducedMotion="user">
      <main className="app app--v4" data-phase={phase}>
        <SoundToggle />
        <LayoutGroup>
          <AnimatePresence>
            {phase === 'intro' && <GrowCollectStage key={`grow-${run}`} onDone={done} />}
            {phase === 'open' && <OpenView key={`open-${run}`} skipped={skipped} onReplay={replay} onClose={replay} />}
          </AnimatePresence>
        </LayoutGroup>
      </main>
    </MotionConfig>
  )
}
