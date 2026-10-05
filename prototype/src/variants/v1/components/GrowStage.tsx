import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { AnimatePresence, motion, useAnimate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { ART, SENDER } from '../../../data'
import { haptic, sfx, startWater } from '../../shared/feedback'
import { SkipButton } from '../../shared/SoundToggle'
import { useViewport } from '../useViewport'
import { Gift } from './Gift'
import { GiftItems } from './GiftItems'
import { CanIcon, GrowMeter, GrowSprout, Soil, WateringCan } from './GrowParts'
import { Letter } from './Letter'
import { Note } from './Note'
import { Burst, Twinkles } from './Particles'
import { Button } from './ui'

/**
 * Variation 1 · "Grow it": Sage nurtures the gift open.
 *  grow  → press and hold to water; a seedling grows out of the heart box in stages (progress = how long she holds)
 *  bloom → at 100% the lid pops, flowers bloom behind the box and the gifts pop up inside it
 *  tag   → Irene's letter swings down on a ribbon, like a gift tag; tap it
 *  read  → the tag flips up and the note unrolls beneath it; the sticker slaps on; Continue
 */
type Mode = 'grow' | 'bloom' | 'tag' | 'read'

const HOLD_MS = 2000
const RUNGS = 8
const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))

export function GrowStage({ onDone }: { onDone: (skipped: boolean) => void }) {
  const { w, h } = useViewport()
  const reduced = useReducedMotion() ?? false
  const giftPx = clamp(220, Math.min(w * 0.66, h * 0.4), 420)
  const [mode, setMode] = useState<Mode>('grow')
  const [holding, setHolding] = useState(false)
  const [bucket, setBucket] = useState(0) // progress in 5% steps, for copy + a11y
  const [nudge, setNudge] = useState(0)
  const progress = useMotionValue(0)
  const [giftScope, animateGift] = useAnimate()

  const modeRef = useRef(mode)
  modeRef.current = mode
  const holdingRef = useRef(false)
  const rung = useRef(0)
  const water = useRef<{ stop(): void } | null>(null)
  const pressedAt = useRef(0)
  const bloomedAt = useRef(0)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      water.current?.stop()
    },
    [],
  )

  const bloom = useCallback(() => {
    holdingRef.current = false
    setHolding(false)
    water.current?.stop()
    water.current = null
    bloomedAt.current = performance.now()
    setMode('bloom')
    sfx.pop(3)
    sfx.fanfare()
    haptic.success()
    later(() => sfx.pop(5), 480)
    later(() => sfx.pop(7), 660)
    later(() => {
      setMode('tag')
      sfx.paper()
      haptic.light()
    }, reduced ? 900 : 2300)
  }, [reduced])

  // While holding: grow. Releasing keeps the progress (forgiving), so she can water in bursts.
  useEffect(() => {
    if (!holding || mode !== 'grow') return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, progress.get() + (now - last) / HOLD_MS)
      last = now
      progress.set(p)
      if (p >= 1) return bloom()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [holding, mode, progress, bloom])

  // Each rung of growth: a rising note, a stronger tick, and a little squash of the box.
  useMotionValueEvent(progress, 'change', (p) => {
    const r = Math.floor(p * RUNGS)
    if (r > rung.current && r < RUNGS) {
      rung.current = r
      sfx.step(r)
      haptic.build(r)
      if (giftScope.current && !reduced)
        animateGift(giftScope.current, { scaleX: [1, 1.05, 0.98, 1], scaleY: [1, 0.93, 1.03, 1] }, { duration: 0.32 })
    }
    const b = Math.floor(p * 20)
    setBucket((prev) => (prev === b ? prev : b))
  })

  const press = useCallback(() => {
    if (modeRef.current !== 'grow' || holdingRef.current) return
    holdingRef.current = true
    setHolding(true)
    pressedAt.current = performance.now()
    water.current = startWater()
    haptic.light()
  }, [])
  const release = useCallback(() => {
    if (!holdingRef.current) return
    holdingRef.current = false
    setHolding(false)
    water.current?.stop()
    water.current = null
    // A quick tap instead of a hold: nudge, Duolingo-style
    if (performance.now() - pressedAt.current < 260 && progress.get() < 1) {
      setNudge((n) => n + 1)
      sfx.boing()
    }
  }, [progress])

  const openTag = useCallback(() => {
    if (modeRef.current !== 'tag') return
    setMode('read')
    sfx.tap()
    haptic.medium()
  }, [])

  // Keyboard: hold Space/Enter to water; Enter opens the tag / continues.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if ((e.target as HTMLElement)?.closest?.('button')) return
      e.preventDefault()
      if (e.repeat) return
      if (modeRef.current === 'grow') press()
      else if (modeRef.current === 'tag') openTag()
      else if (modeRef.current === 'bloom' && performance.now() - bloomedAt.current > 700) onDone(true)
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') release()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [press, release, openTag, onDone])

  const holdHandlers = {
    onPointerDown: (e: RPointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId)
      press()
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
    onContextMenu: (e: { preventDefault(): void }) => e.preventDefault(),
  }

  const p = bucket / 20
  const grown = mode !== 'grow'
  const title = grown
    ? `A gift from ${SENDER.name}!`
    : p === 0
      ? 'You got a gift!'
      : p < 0.4
        ? 'Keep watering…'
        : p < 0.8
          ? "It's sprouting!"
          : 'Almost there!'

  return (
    <motion.section
      className="view stage grow-stage"
      onClick={
        mode === 'bloom'
          ? () => {
              // the finger that finished the hold lifts right after the bloom: that's not a skip
              if (performance.now() - bloomedAt.current > 700) onDone(true)
            }
          : mode === 'tag'
            ? openTag
            : undefined
      }
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <AnimatePresence>{mode !== 'read' && <SkipButton key="skip" onSkip={() => onDone(true)} />}</AnimatePresence>

      {mode === 'bloom' && !reduced && (
        <motion.div
          className="flash"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0] }}
          transition={{ duration: 0.6, times: [0, 0.2, 1] }}
        />
      )}

      <div className="stage-main">
        <div className="gift-area" style={{ width: giftPx }}>
          <div className={`gift-float grow-target${mode === 'grow' ? ' grow-target--on' : ''}`} {...(mode === 'grow' ? holdHandlers : {})}>
            <Soil />
            {mode === 'grow' && <Twinkles />}
            <GrowSprout progress={progress} bloomed={grown} />
            <motion.div ref={giftScope} className="grow-gift">
              <Gift layoutId="gift" mode={grown ? 'bloom' : 'idle'} label={`Gift from ${SENDER.name}`}>
                {grown && <GiftItems />}
              </Gift>
            </motion.div>
            <AnimatePresence>
              {(mode === 'grow' || mode === 'bloom') && (
                <motion.img
                  key="env"
                  src={ART.envelope}
                  alt=""
                  draggable={false}
                  className="envelope envelope--tucked"
                  initial={false}
                  animate={grown ? { x: '12%', y: '16%', rotate: 12, scale: 0.92 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                  exit={{ scale: 0.3, opacity: 0, y: '-10%', transition: { duration: 0.25 } }}
                  transition={{ type: 'spring', stiffness: 240, damping: 15 }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>{mode === 'grow' && <WateringCan key="can" pouring={holding} />}</AnimatePresence>
            {mode === 'bloom' && !reduced && <Burst size={giftPx} />}
            <AnimatePresence>{mode === 'tag' && <HangingTag key="tag" onOpen={openTag} />}</AnimatePresence>
          </div>
        </div>

        <div className="stage-copy">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={title}
              className="title"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            >
              {title}
            </motion.h1>
          </AnimatePresence>
          <motion.p className="from-line" initial={false} animate={{ opacity: p === 0 && !grown ? 1 : 0 }}>
            <img src={SENDER.avatar} alt="" /> from <strong>{SENDER.name}</strong>
          </motion.p>
        </div>
      </div>

      <div className="bottom">
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'grow' && (
            <motion.div key="grow" className="bottom-inner grow-controls" exit={{ opacity: 0, y: 14, transition: { duration: 0.2 } }}>
              <GrowMeter progress={progress} />
              <motion.button
                key={nudge}
                type="button"
                className={`btn btn--primary hold-btn${holding ? ' hold-btn--on' : ''}`}
                aria-label="Hold to water the gift"
                {...holdHandlers}
                onClick={(e) => e.stopPropagation()}
                animate={nudge ? { x: [0, -8, 7, -5, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                whileTap={{ scale: 0.97, y: 2 }}
              >
                <CanIcon />
                <span>{holding ? 'Watering…' : nudge ? 'Press and hold' : 'Hold to water'}</span>
              </motion.button>
            </motion.div>
          )}
          {mode === 'bloom' && (
            <motion.p key="skip" className="skip-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
              Tap anywhere to skip
            </motion.p>
          )}
          {mode === 'tag' && (
            <motion.p key="tag" className="tap-hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.7 }}>
              <span className="tap-dot" /> Tap the tag to read {SENDER.name}'s note
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{mode === 'read' && <UnrollOverlay key="read" w={w} onContinue={() => onDone(false)} />}</AnimatePresence>
    </motion.section>
  )
}

/** Irene's from/to letter, hanging off the box on a ribbon like a gift tag, swaying. */
function HangingTag({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="hang"
      initial={{ y: '40%', scale: 0.3, opacity: 0, rotate: 0 }}
      animate={{ y: '0%', scale: 1, opacity: 1, rotate: [0, 14, -9, 6, -3, 0] }}
      transition={{
        y: { type: 'spring', stiffness: 220, damping: 14 },
        scale: { type: 'spring', stiffness: 260, damping: 16 },
        opacity: { duration: 0.15 },
        rotate: { duration: 1.6, ease: 'easeOut', delay: 0.15 },
      }}
      exit={{ opacity: 0, transition: { duration: 0.01 } }}
      style={{ originX: 0.5, originY: 0 }}
    >
      <div className="hang-sway">
        <span className="hang-string" />
        <span className="hang-knot" />
        <Letter
          layoutId="tag"
          role="button"
          aria-label={`Open the letter from ${SENDER.name}`}
          tabIndex={0}
          className="letter--tappable hang-letter"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
        />
      </div>
    </motion.div>
  )
}

/** The tag lifts to the center, flips up, and the note unrolls beneath it. */
function UnrollOverlay({ w, onContinue }: { w: number; onContinue: () => void }) {
  const cardW = Math.min(w * 0.88, 520)
  const letterH = (cardW * 189) / 355
  const noteH = (cardW * 119) / 355
  const [stage, setStage] = useState(0) // 0 tag centered · 1 unrolling · 2 sticker + continue
  useEffect(() => {
    const a = window.setTimeout(() => {
      setStage(1)
      sfx.paper()
      haptic.light()
    }, 600)
    const b = window.setTimeout(() => {
      setStage(2)
      sfx.pop(6)
      sfx.ding()
      haptic.medium()
    }, 1500)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [])

  return (
    <motion.div className="overlay overlay--split" exit={{ opacity: 0, transition: { duration: 0.25 } }}>
      <motion.div className="overlay-dim" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} />
      <div className="overlay-center">
        <div className="note-spotlight" aria-hidden style={{ width: cardW * 1.5, height: cardW * 1.1 }} />
        <div className="unroll" style={{ width: cardW, height: letterH }}>
          <motion.p
            className="note-heading unroll-heading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <img src={SENDER.avatar} alt="" />
            {SENDER.name} left you a note
          </motion.p>
          {/* the note unrolls downward from the top edge, like a scroll */}
          <motion.div
            className="unroll-note"
            initial={{ clipPath: 'inset(0% 0% 100% 0% round 10px)' }}
            animate={{ clipPath: stage >= 1 ? 'inset(-40% -20% -10% -20% round 10px)' : 'inset(0% 0% 100% 0% round 10px)' }}
            transition={{ duration: 0.75, ease: [0.25, 0.8, 0.3, 1] }}
          >
            <Note className="note--reading" fold="open" sticker={stage >= 2 ? 'slap' : 'none'} style={{ width: cardW }} />
          </motion.div>
          {/* the paper roll riding the edge as it unrolls */}
          <motion.div
            className="unroll-roll"
            aria-hidden
            initial={{ y: 0, opacity: 0 }}
            animate={stage >= 1 ? { y: noteH - 6, opacity: [1, 1, 0] } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.8, 0.3, 1], opacity: { times: [0, 0.85, 1], duration: 0.75 } }}
          />
          {/* the tag flips up and away from the same top edge */}
          <motion.div
            className="unroll-tag"
            initial={false}
            animate={stage >= 1 ? { rotateX: 100, opacity: 0, y: -12 } : { rotateX: 0, opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
          >
            <Letter layoutId="tag" />
          </motion.div>
        </div>
      </div>
      <div className="bottom">
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              key="c"
              className="bottom-inner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 26 }}
            >
              <Button onClick={onContinue}>Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
