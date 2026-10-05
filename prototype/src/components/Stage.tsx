import { AnimatePresence, motion } from 'motion/react'
import { ART, SENDER } from '../data'
import { stepIndex, type Phase, type Step } from '../timeline'
import { useViewport } from '../useViewport'
import { Gift, type GiftMode } from './Gift'
import { GiftItems } from './GiftItems'
import { Letter } from './Letter'
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
            >
              {bloomed && <GiftItems />}
            </Gift>
            {!noteStage && <TuckedEnvelope pushed={bloomed} />}
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

/**
 * Dims the scene and brings the envelope forward. The letter ("from: Irene / sending to: Sage")
 * slips out and waits for a tap; tapping fades it into Irene's note.
 *   s = 2 envelope · 3 letterOut · 4 letter (waits for tap) · 5 read
 */
function NoteOverlay({ s, w, onAdvance }: { s: number; w: number; onAdvance: () => void }) {
  const cardW = Math.min(w * 0.88, 560)
  const letterH = (cardW * 189) / 355
  const noteH = (cardW * 119) / 355
  const envW = Math.min(w * 0.5, 230)
  const envH = (envW * 668) / 624
  const k = (envW * 0.82) / cardW // tucked inside, the letter is a bit narrower than the envelope
  const envTop = -envH / 2 + envH * 0.2 // the paper's top edge inside the tilted envelope art
  const yHidden = envTop + 10 + (letterH * k) / 2
  const yPeek = envTop + 14 - letterH * k * 0.42 + (letterH * k) / 2

  const letterAnim =
    s <= 2
      ? { y: yHidden, scale: k, opacity: 0, rotate: -4 }
      : s === 3
        ? { y: yPeek, scale: k, opacity: 1, rotate: -4 }
        : { y: 0, scale: 1, opacity: 1, rotate: 0 }

  const gap = Math.max(50, cardW * 0.12)
  const heading = s >= 5 ? `${SENDER.name} left you a note` : 'Take a peek'
  const headingY = s >= 5 ? -noteH / 2 - gap : -letterH / 2 - gap

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
          style={{ width: cardW * 1.5, height: cardW * 1.1 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={s >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {s >= 4 && (
            <motion.p
              key={heading}
              className="note-heading"
              initial={{ opacity: 0, y: headingY + 12 }}
              animate={{ opacity: 1, y: headingY }}
              exit={{ opacity: 0, y: headingY - 8, transition: { duration: 0.18 } }}
              transition={{ delay: s === 4 ? 0.35 : 0.1, type: 'spring', stiffness: 260, damping: 24 }}
            >
              {/* The letter already shows Irene's avatar, so the heading only carries it for the note */}
              {s >= 5 && <img src={SENDER.avatar} alt="" />}
              {heading}
            </motion.p>
          )}
        </AnimatePresence>

        {/* The letter: slips out of the envelope, then waits to be tapped open */}
        <AnimatePresence>
          {s <= 4 && (
            <motion.div
              key="letter"
              className="letter-slot"
              style={{ width: cardW }}
              initial={{ y: yHidden, scale: k, opacity: 0, rotate: -4 }}
              animate={letterAnim}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)', transition: { duration: 0.4, ease: 'easeOut' } }}
              transition={{ type: 'spring', stiffness: 160, damping: 21, opacity: { duration: 0.15 } }}
            >
              <motion.div
                animate={s === 4 ? { scale: [1, 1.025, 1], rotate: [0, -1, 1, 0] } : { scale: 1, rotate: 0 }}
                transition={s === 4 ? { duration: 1.6, repeat: Infinity, repeatDelay: 1.2, delay: 1, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                <Letter
                  role="button"
                  aria-label={`Open the letter from ${SENDER.name}`}
                  className={s === 4 ? 'letter--tappable' : ''}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The note: fades in where the letter was */}
        {s >= 5 && (
          <Note
            layoutId="note"
            className="note--reading"
            fold="open"
            sticker="slap"
            style={{ width: cardW }}
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          />
        )}

        <AnimatePresence>
          {s < 4 && (
            <motion.img
              key="env"
              layoutId="envelope"
              src={ART.envelope}
              alt=""
              draggable={false}
              className="envelope envelope--center"
              style={{ width: envW }}
              initial={false}
              animate={{ y: 0, rotate: s === 2 ? [0, -7, 6, -4, 0] : 0, opacity: 1, scale: 1 }}
              exit={{ y: envH * 0.95, rotate: 14, opacity: 0, scale: 0.92, transition: { duration: 0.55, ease: [0.5, 0, 0.75, 0] } }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, rotate: { duration: 0.7, delay: 0.25 } }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="bottom">
        <AnimatePresence mode="wait">
          {s === 4 && (
            <motion.p
              key="tap"
              className="tap-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ delay: 0.9 }}
            >
              <span className="tap-dot" /> Tap the letter to open it
            </motion.p>
          )}
          {s >= 5 && (
            <motion.div
              key="continue"
              className="bottom-inner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 26 }}
            >
              <Button onClick={onAdvance}>Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
