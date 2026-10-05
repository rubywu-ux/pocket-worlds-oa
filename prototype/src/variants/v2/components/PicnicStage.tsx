import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'motion/react'
import { ART, SENDER } from '../../../data'
import { haptic, sfx, startStretch } from '../../shared/feedback'
import { SkipButton } from '../../shared/SoundToggle'
import { useViewport } from '../useViewport'
import { Letter } from './Letter'
import { Note } from './Note'
import { Blanket, BOX, DragIcon, PicnicBanner, TumbleItems } from './PicnicParts'
import { Button } from './ui'

/**
 * Variation 2 · "Pull the ribbon": tactile, physical, no glow or magic.
 *  tie    → Irene's envelope is tied to the box's ribbon. Drag it away: the ribbon stretches (creak, rising pitch,
 *           ticks), the box leans toward your finger. Let go early and it springs back.
 *  pop    → past the breaking point the ribbon SNAPS, the lid flies off, and the gifts tumble out of the box,
 *           arc through the air and bounce onto the picnic blanket
 *  letter → the envelope settles in front of the box; pull the letter up and out of it
 *  read   → the letter flips over like a card: Irene's note is on the back
 */
type Mode = 'tie' | 'pop' | 'letter' | 'read'

const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))

// Layout, in percent of the (square) gift area
const KNOT = { x: 0.84, y: 0.6 } // where the box's ribbon band ends, front right
const ENV_REST = { left: 0.74, top: 0.6, width: 0.42 }
const ENV_SEAL = { x: 0.555, y: 0.52 } // the wax seal on the envelope art (fraction of the art)
const ENV_FRONT = { left: 0.27, top: 0.64, width: 0.46 } // where it settles for the letter pull

export function PicnicStage({ onDone }: { onDone: (skipped: boolean) => void }) {
  const { w, h } = useViewport()
  const reduced = useReducedMotion() ?? false
  const g = clamp(200, Math.min(w * 0.62, h * 0.34), 360) // gift area size, px
  const [mode, setMode] = useState<Mode>('tie')
  const [snapAt, setSnapAt] = useState<{ x: number; y: number } | null>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ----- the pull -----
  const ex = useMotionValue(0)
  const ey = useMotionValue(0)
  const THRESH = g * 0.34
  const tension = useTransform([ex, ey], ([x, y]: number[]) => clamp(0, Math.hypot(x, y) / THRESH, 1))
  const lean = useTransform(ex, (x) => clamp(-7, (x / THRESH) * 6, 7))
  const shift = useTransform(ex, (x) => x * 0.05)
  const squash = useTransform(tension, (t) => 1 - t * 0.05)
  const stretch = useRef<{ set(a: number): void; stop(): void } | null>(null)
  const tick = useRef(0)
  const dragging = useRef(false)
  const snappedAt = useRef(0)
  const skipArmed = useRef(false)
  const lastDragEnd = useRef(0) // a tap right after a drag is the end of that drag, not a tap

  const knot = { x: KNOT.x * g, y: KNOT.y * g }
  const seal0 = { x: (ENV_REST.left + ENV_SEAL.x * ENV_REST.width) * g, y: (ENV_REST.top + ENV_SEAL.y * ENV_REST.width * (668 / 624)) * g }
  const ribbonD = useTransform([ex, ey, tension], ([x, y, t]: number[]) => {
    const sx = seal0.x + x
    const sy = seal0.y + y
    const sag = g * 0.16 * (1 - t) ** 2
    const mx = (knot.x + sx) / 2
    const my = Math.max(knot.y, sy) + sag
    return `M ${knot.x} ${knot.y} Q ${mx} ${my} ${sx} ${sy}`
  })
  const ribbonW = useTransform(tension, (t) => g * 0.05 * (1 - t * 0.45))
  const ribbonInnerW = useTransform(ribbonW, (v) => v * 0.55)

  const snap = useCallback(() => {
    if (modeRef.current !== 'tie') return
    stretch.current?.stop()
    stretch.current = null
    dragging.current = false
    const x = ex.get()
    const y = ey.get()
    setSnapAt({ x: (knot.x + seal0.x + x) / 2, y: (knot.y + seal0.y + y) / 2 })
    snappedAt.current = performance.now()
    setMode('pop')
    sfx.snap()
    haptic.heavy()
    animate(ex, 0, { type: 'spring', stiffness: 300, damping: 18 })
    animate(ey, 0, { type: 'spring', stiffness: 300, damping: 18 })
    later(() => sfx.whoosh(true), 60)
    later(() => sfx.pop(4), 180)
    later(() => sfx.pop(6), 320)
    later(() => sfx.thud(0), 880)
    later(() => {
      sfx.thud(1)
      haptic.medium()
    }, 1020)
    later(() => sfx.thud(3), 1140)
    later(() => sfx.ding(), 1350)
    later(() => {
      setMode('letter')
      sfx.paper()
      haptic.light()
    }, reduced ? 900 : 2100)
  }, [ex, ey, knot.x, knot.y, seal0.x, seal0.y, reduced])

  const onDrag = (_: unknown, _info: PanInfo) => {
    const t = tension.get()
    stretch.current?.set(t)
    const step = Math.floor(t * 6)
    if (step > tick.current) {
      tick.current = step
      haptic.build(step)
    }
    if (t >= 1) snap()
  }
  const onDragStart = () => {
    if (modeRef.current !== 'tie') return
    dragging.current = true
    ex.stop()
    ey.stop()
    tick.current = 0
    stretch.current = startStretch()
    haptic.light()
  }
  const onDragEnd = () => {
    lastDragEnd.current = performance.now()
    if (modeRef.current !== 'tie') return
    dragging.current = false
    stretch.current?.stop()
    stretch.current = null
    if (tension.get() > 0.15) sfx.boing()
  }

  /** Tap / Enter fallback: the gift pulls itself, then snaps. */
  const autoPull = useCallback(() => {
    if (modeRef.current !== 'tie' || dragging.current || performance.now() - lastDragEnd.current < 350) return
    const s = startStretch()
    haptic.light()
    const dist = g * 0.36
    const ctl = animate(0, 1, {
      duration: 0.55,
      ease: 'easeIn',
      onUpdate: (v) => {
        ex.set(v * dist * 0.8)
        ey.set(v * dist * 0.6)
        s.set(v)
      },
      onComplete: () => {
        s.stop()
        snap()
      },
    })
    return () => ctl.stop()
  }, [ex, ey, g, snap])

  // Idle nudge: every few seconds the envelope tugs on its ribbon by itself ("pull me")
  useEffect(() => {
    if (mode !== 'tie') return
    const id = window.setInterval(() => {
      if (dragging.current || modeRef.current !== 'tie') return
      animate(ex, [0, g * 0.07, 0], { duration: 0.7, ease: 'easeInOut' })
      animate(ey, [0, g * 0.04, 0], { duration: 0.7, ease: 'easeInOut' })
    }, 3200)
    return () => window.clearInterval(id)
  }, [mode, ex, ey, g])

  // ----- the letter pull -----
  const ly = useMotionValue(0)
  const LTHRESH = g * 0.2
  const lTick = useRef(0)
  const pullOut = useCallback(() => {
    if (modeRef.current !== 'letter') return
    setMode('read')
    sfx.paper()
    sfx.whoosh(true, 0.05)
    haptic.medium()
  }, [])
  const autoLetter = useCallback(() => {
    if (modeRef.current !== 'letter' || performance.now() - lastDragEnd.current < 350) return
    animate(ly, -LTHRESH * 1.2, { duration: 0.35, ease: 'easeIn', onComplete: pullOut })
  }, [ly, LTHRESH, pullOut])

  // Keyboard: Enter / Space does the pull for you
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if ((e.target as HTMLElement)?.closest?.('button')) return
      e.preventDefault()
      if (modeRef.current === 'tie') autoPull()
      else if (modeRef.current === 'letter') autoLetter()
      else if (modeRef.current === 'pop' && performance.now() - snappedAt.current > 700) onDone(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [autoPull, autoLetter, onDone])

  const opened = mode !== 'tie'
  const envFront = mode === 'letter' || mode === 'read'
  const envW = ENV_REST.width * g
  const envH = envW * (668 / 624)
  const frontScale = ENV_FRONT.width / ENV_REST.width
  const toFront = {
    x: (ENV_FRONT.left + ENV_FRONT.width / 2 - (ENV_REST.left + ENV_REST.width / 2)) * g,
    y: (ENV_FRONT.top - ENV_REST.top) * g + (envH * frontScale - envH) / 2,
  }

  return (
    <motion.section
      className="view stage pstage"
      // Skip only on a fresh tap during the pop: the finger that snapped the ribbon lifting is not a skip.
      onPointerDown={() => {
        skipArmed.current = modeRef.current === 'pop'
      }}
      onClick={() => {
        if (modeRef.current === 'pop' && skipArmed.current) onDone(true)
      }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <AnimatePresence>{mode !== 'read' && <SkipButton key="skip" onSkip={() => onDone(true)} />}</AnimatePresence>

      <PicnicBanner>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={opened ? 'from' : 'got'}
            className="title pbanner-title"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          >
            {opened ? `A gift from ${SENDER.name}!` : 'You got a gift!'}
          </motion.h1>
        </AnimatePresence>
        <motion.p className="pbanner-row" initial={false} animate={{ opacity: opened ? 0 : 1 }}>
          <img src={SENDER.avatar} alt="" /> from {SENDER.name}
        </motion.p>
      </PicnicBanner>

      <div className="pscene">
        <div className="gift-area pgift" style={{ width: g }}>
          <Blanket />

          {/* the box: leans toward your pull, recoils when the lid flies */}
          <motion.div className="pbox" style={{ rotate: lean, x: shift, scaleY: squash }}>
            <span className="pbox-shadow" />
            <AnimatePresence>
              {opened && (
                <motion.div
                  key="open"
                  className="pbox-open"
                  initial={{ scaleY: 0.82, scaleX: 1.08 }}
                  animate={{ scaleY: 1, scaleX: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 11 }}
                >
                  <img src={BOX.base} className="box-img" alt="" draggable={false} />
                  <img src={BOX.front} className="box-img pbox-front" alt="" draggable={false} />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              className="pbox-lid"
              initial={false}
              animate={opened ? { x: ['0%', '-40%', '-150%'], y: ['0%', '-150%', '-90%'], rotate: [0, -140, -300], opacity: [1, 1, 0] } : {}}
              transition={{ duration: 0.85, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] }}
            >
              <img src={BOX.lid} className="box-img" alt="" draggable={false} />
            </motion.div>
          </motion.div>

          {opened && <TumbleItems size={g} />}

          {/* the ribbon, from the box's band to the envelope's seal */}
          <AnimatePresence>
            {mode === 'tie' && (
              <motion.svg
                key="ribbon"
                className="ribbon"
                viewBox={`0 0 ${g} ${g}`}
                width={g}
                height={g}
                aria-hidden
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
              >
                <motion.path d={ribbonD} stroke="#d9951c" strokeWidth={ribbonW} strokeLinecap="round" fill="none" />
                <motion.path d={ribbonD} stroke="#ffd95a" strokeWidth={ribbonInnerW} strokeLinecap="round" fill="none" />
                <circle cx={knot.x} cy={knot.y} r={g * 0.035} fill="#ffd95a" stroke="#d9951c" strokeWidth={g * 0.01} />
              </motion.svg>
            )}
          </AnimatePresence>
          {snapAt && mode !== 'tie' && <SnapPop at={snapAt} g={g} />}

          {/* the envelope: tied to the ribbon, then the letter's home */}
          <motion.div
            className="penv"
            style={{ left: `${ENV_REST.left * 100}%`, top: `${ENV_REST.top * 100}%`, width: envW }}
            initial={false}
            animate={envFront ? { x: toFront.x, y: toFront.y, scale: frontScale } : { x: 0, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 170, damping: 17 }}
          >
            <motion.div
              className={`penv-drag${mode === 'tie' ? ' penv-drag--on' : ''}`}
              style={{ x: ex, y: ey }}
              drag={mode === 'tie'}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.55}
              dragMomentum={false}
              dragTransition={{ bounceStiffness: 420, bounceDamping: 11 }}
              onDragStart={onDragStart}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              onTap={mode === 'tie' ? autoPull : undefined}
              role={mode === 'tie' ? 'button' : undefined}
              aria-label={mode === 'tie' ? `Pull ${SENDER.name}'s letter to untie the gift` : undefined}
              whileHover={mode === 'tie' ? { scale: 1.04 } : undefined}
            >
              <AnimatePresence>
                {mode === 'letter' && (
                  <motion.div
                    key="slot"
                    className="pletter"
                    style={{ y: ly }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.01 } }}
                    transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 18 }}
                    drag="y"
                    dragConstraints={{ top: -LTHRESH * 1.4, bottom: 0 }}
                    dragElastic={0.25}
                    dragMomentum={false}
                    onDragEnd={() => {
                      lastDragEnd.current = performance.now()
                    }}
                    onDragStart={() => {
                      lTick.current = 0
                      sfx.paper()
                      haptic.light()
                    }}
                    onDrag={() => {
                      const t = clamp(0, -ly.get() / LTHRESH, 1)
                      const s = Math.floor(t * 4)
                      if (s > lTick.current) {
                        lTick.current = s
                        haptic.tick()
                      }
                      if (t >= 1) pullOut()
                    }}
                    onTap={autoLetter}
                    role="button"
                    aria-label={`Pull the letter from ${SENDER.name} out of the envelope`}
                  >
                    <Letter layoutId="letter" className="letter--tappable" />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.img
                src={ART.envelope}
                alt=""
                draggable={false}
                className="penv-img"
                initial={false}
                animate={{ rotate: envFront ? 11 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="bottom">
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'tie' && (
            <motion.p key="tie" className="tap-hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}>
              <DragIcon /> Drag the letter to untie the ribbon
            </motion.p>
          )}
          {mode === 'pop' && (
            <motion.p key="skip" className="skip-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
              Tap anywhere to skip
            </motion.p>
          )}
          {mode === 'letter' && (
            <motion.p key="letter" className="tap-hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.9 }}>
              <span className="pull-up" aria-hidden>
                ↑
              </span>{' '}
              Pull the letter out
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{mode === 'read' && <FlipOverlay key="read" w={w} onContinue={() => onDone(false)} />}</AnimatePresence>
    </motion.section>
  )
}

/** Comic "Snap!" word and ribbon scraps where the ribbon broke. */
function SnapPop({ at, g }: { at: { x: number; y: number }; g: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.random() * 0.5
        const d = g * (0.12 + Math.random() * 0.16)
        return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - g * 0.05, rot: (Math.random() - 0.5) * 540 }
      }),
    [g],
  )
  return (
    <div className="snap" style={{ left: at.x, top: at.y }} aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="snap-bit"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.dx, y: b.dy + g * 0.12, opacity: 0, rotate: b.rot }}
          transition={{ duration: 0.8, ease: [0.1, 0.8, 0.3, 1] }}
        />
      ))}
      <motion.span
        className="snap-word"
        initial={{ scale: 0.2, opacity: 0, rotate: -12 }}
        animate={{ scale: [0.2, 1.25, 1], opacity: [0, 1, 1, 0], rotate: -8, y: -g * 0.08 }}
        transition={{ duration: 0.9, times: [0, 0.3, 1], opacity: { duration: 0.9, times: [0, 0.15, 0.7, 1] } }}
      >
        Snap!
      </motion.span>
    </div>
  )
}

/** The letter, pulled out, flips over like a card: the note is on the back. */
function FlipOverlay({ w, onContinue }: { w: number; onContinue: () => void }) {
  const cardW = Math.min(w * 0.88, 520)
  const letterH = (cardW * 189) / 355
  const [stage, setStage] = useState(0) // 0 letter · 1 flipped · 2 sticker
  useEffect(() => {
    const a = window.setTimeout(() => {
      setStage(1)
      sfx.flip(1)
      haptic.light()
    }, 650)
    const b = window.setTimeout(() => {
      setStage(2)
      sfx.pop(6)
      sfx.ding()
      haptic.medium()
    }, 1450)
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
        <div className="flip" style={{ width: cardW, height: letterH }}>
          <motion.p
            className="note-heading flip-heading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 24 }}
          >
            <img src={SENDER.avatar} alt="" />
            {SENDER.name} left you a note
          </motion.p>
          <motion.div
            className="flip-inner"
            initial={false}
            animate={{ rotateY: stage >= 1 ? 180 : 0, scale: stage === 1 ? [1, 1.06, 1] : 1 }}
            transition={{ rotateY: { type: 'spring', stiffness: 110, damping: 14 }, scale: { duration: 0.6 } }}
          >
            <div className="flip-face">
              <Letter layoutId="letter" />
            </div>
            <div className="flip-face flip-face--back">
              <Note className="note--reading" fold="open" sticker={stage >= 2 ? 'slap' : 'none'} style={{ width: cardW }} />
            </div>
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
