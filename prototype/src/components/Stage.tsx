import { AnimatePresence, motion } from 'motion/react'
import { ART, ITEMS, SENDER, type GiftItem } from '../data'
import { stepIndex, type Phase, type Step } from '../timeline'
import { useViewport } from '../useViewport'
import { Gift, type GiftMode } from './Gift'
import { Note } from './Note'
import { Burst, Twinkles } from './Particles'
import { Button } from './ui'

type StageProps = {
  phase: Extract<Phase, 'idle' | 'opening'>
  step: Step
  reduced: boolean
  onAdvance: () => void
}

const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))

/** Unopened gift → bloom → note reading. Tapping anywhere while it plays skips to the open state. */
export function Stage({ phase, step, reduced, onAdvance }: StageProps) {
  const { w, h } = useViewport()
  const opening = phase === 'opening'
  const s = opening ? stepIndex(step) : -1
  const bloomed = s >= 1
  const noteStage = s >= 2
  const giftMode: GiftMode = !opening ? 'idle' : s === 0 ? 'wiggle' : 'bloom'
  const giftPx = clamp(220, Math.min(w * 0.66, h * 0.42), 440)

  return (
    <motion.section
      className={`view stage${opening ? ' stage--opening' : ''}`}
      onClick={opening ? onAdvance : undefined}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {s === 1 && !reduced && (
        <motion.div
          className="flash"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.55, times: [0, 0.22, 1] }}
        />
      )}

      <motion.div
        className="stage-main"
        animate={s === 1 && !reduced ? { x: [0, -8, 7, -5, 3, -1, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="gift-area">
          <motion.div
            className="gift-float"
            animate={opening ? { y: 0 } : { y: [0, -8, 0] }}
            transition={opening ? { duration: 0.25 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {!opening && <Twinkles />}
            <Gift
              layoutId="gift"
              mode={giftMode}
              onActivate={opening ? undefined : onAdvance}
              label={`Open your gift from ${SENDER.name}`}
            />
            {!noteStage && <TuckedEnvelope pushed={bloomed} />}
            {bloomed && ITEMS.map((it, i) => <RisingItem key={it.id} item={it} index={i} />)}
            {bloomed && !reduced && <Burst size={giftPx} />}
          </motion.div>
        </div>

        <motion.div className="stage-copy" initial={false} animate={{ opacity: noteStage ? 0 : 1 }} transition={{ duration: 0.3 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={bloomed ? 'from' : 'got'}
              className="title"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            >
              {bloomed ? `A gift from ${SENDER.name}!` : 'You got a gift!'}
            </motion.h1>
          </AnimatePresence>
          <motion.p className="from-line" initial={false} animate={{ opacity: opening ? 0 : 1 }}>
            <img src={SENDER.avatar} alt="" /> from <strong>{SENDER.name}</strong>
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="bottom">
        <AnimatePresence mode="wait" initial={false}>
          {!opening && (
            <motion.div key="cta" className="bottom-inner" exit={{ opacity: 0, y: 14, transition: { duration: 0.2 } }}>
              <Button onClick={onAdvance}>Open</Button>
            </motion.div>
          )}
          {opening && s < 2 && (
            <motion.p
              key="hint"
              className="skip-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              Tap anywhere to skip
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{noteStage && <NoteOverlay key="overlay" s={s} w={w} onAdvance={onAdvance} />}</AnimatePresence>
    </motion.section>
  )
}

function TuckedEnvelope({ pushed }: { pushed: boolean }) {
  return (
    <motion.img
      layoutId="envelope"
      src={ART.envelope}
      alt=""
      draggable={false}
      className="envelope envelope--tucked"
      initial={false}
      animate={pushed ? { x: '12%', y: '16%', rotate: 12, scale: 0.92 } : { x: '0%', y: '0%', rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 15 }}
    />
  )
}

/** Where each item lands on top of the bloom (percent of the gift area). */
const SPOTS: Record<string, { left: string; top: string; width: string }> = {
  boba: { left: '-6%', top: '-34%', width: '40%' },
  bouquet: { left: '64%', top: '-38%', width: '42%' },
}

function RisingItem({ item, index }: { item: GiftItem; index: number }) {
  return (
    <motion.div
      className="rise"
      style={SPOTS[item.id]}
      initial={{ opacity: 0, scale: 0.2, y: '55%' }}
      animate={{ opacity: 1, scale: 1, y: '0%' }}
      transition={{ type: 'spring', stiffness: 250, damping: 13, delay: 0.22 + index * 0.15 }}
    >
      <motion.div layoutId={`item-${item.id}`} className="rise-art">
        <img src={item.img} alt={item.name} draggable={false} />
      </motion.div>
      <motion.span
        className="qty-badge"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 15, delay: 0.6 + index * 0.15 }}
      >
        ×{item.qty}
      </motion.span>
    </motion.div>
  )
}

/** Dims the scene, brings the envelope forward, and unfolds Irene's note for reading. */
function NoteOverlay({ s, w, onAdvance }: { s: number; w: number; onAdvance: () => void }) {
  const noteW = Math.min(w * 0.88, 600)
  const envW = Math.min(w * 0.5, 230)
  const envH = (envW * 167) / 156
  const noteH = (noteW * 119) / 355
  const k = (envW * 0.82) / noteW // the folded note is a bit narrower than the envelope
  const envTop = -envH / 2 + envH * 0.2 // the paper's top edge inside the tilted envelope art
  const yHidden = envTop + 10 + (noteH * k) / 2
  const yOut = envTop + 12 + (noteH * k) / 6

  const noteAnim =
    s <= 2
      ? { y: yHidden, scale: k, opacity: 0, rotate: -4 }
      : s === 3
        ? { y: yOut, scale: k, opacity: 1, rotate: -4 }
        : { y: 0, scale: 1, opacity: 1, rotate: 0 }
  const headingY = -noteH / 2 - Math.max(52, noteW * 0.13)

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35 }}
    >
      <div className="overlay-center">
        <motion.div
          className="note-spotlight"
          aria-hidden
          style={{ width: noteW * 1.5, height: noteW * 1.1 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={s >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.p
          className="note-heading"
          initial={{ opacity: 0, y: headingY + 12 }}
          animate={s >= 4 ? { opacity: 1, y: headingY } : { opacity: 0, y: headingY + 12 }}
          transition={{ delay: s >= 4 ? 0.35 : 0, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <img src={SENDER.avatar} alt="" />
          {SENDER.name} left you a note
        </motion.p>
        <Note
          layoutId="note"
          className="note--reading"
          fold={s >= 4 ? 'open' : 'folded'}
          sticker={s >= 5 ? 'slap' : 'none'}
          style={{ width: noteW }}
          initial={{ y: yHidden, scale: k, opacity: 0 }}
          animate={noteAnim}
          transition={{ type: 'spring', stiffness: 160, damping: 21, opacity: { duration: 0.15 } }}
        />
        <AnimatePresence>
          {s < 5 && (
            <motion.img
              key="env"
              layoutId="envelope"
              src={ART.envelope}
              alt=""
              draggable={false}
              className="envelope envelope--center"
              style={{ width: envW }}
              initial={false}
              animate={
                s >= 4
                  ? { y: envH * 0.95, rotate: 14, opacity: 0, scale: 0.92 }
                  : { y: 0, rotate: s === 2 ? [0, -7, 6, -4, 0] : 0, opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0 }}
              transition={
                s >= 4
                  ? { duration: 0.55, ease: [0.5, 0, 0.75, 0] }
                  : { type: 'spring', stiffness: 200, damping: 18, rotate: { duration: 0.7, delay: 0.25 } }
              }
            />
          )}
        </AnimatePresence>
      </div>
      <div className="bottom">
        <AnimatePresence>
          {s >= 5 && (
            <motion.div
              className="bottom-inner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 26 }}
            >
              <Button onClick={onAdvance}>Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
