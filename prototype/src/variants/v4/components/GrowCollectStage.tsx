import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { ART, ITEMS, SENDER, type GiftItem } from '../../../data'
import { haptic, sfx } from '../../shared/feedback'
import { SkipButton } from '../../shared/SoundToggle'
import { useViewport } from '../useViewport'
import { Gift } from './Gift'
import { GiftItems } from './GiftItems'
import { CanIcon, GrowMeter, GrowSprout, Soil, WateringCan } from './GrowParts'
import { Letter } from './Letter'
import { Note } from './Note'
import { Burst, Twinkles } from './Particles'
import { BasketIcon, CardBack, Confetti, OfferCell } from './RewardParts'
import { Button } from './ui'

/**
 * Variation 4 · "Grow & collect": V1's gardening game + V3's reward loop + V3's ending.
 *  grow    → one tap and it waters itself: the can pours and a seedling grows out of the heart box in stages,
 *            the meter fills and the notes climb (V1's look, auto-played; Ruby: tap instead of hold)
 *  bloom   → at 100% the lid pops, flowers bloom behind the box and the gifts pop up inside it (V1)
 *  harvest → the gifts pulse: tap them (or Collect all) to collect
 *  collect → each gift jumps out as a face-down reward card, flips face-up with confetti, then flies into
 *            the garden-storage basket, which counts up (V3)
 *  read    → as the gifts fly into storage, Irene's letter pops up by itself, flips up and the note unrolls,
 *            no tap needed (Ruby: fewer steps); Continue → the "Say thanks" ending (V3)
 */
type Mode = 'grow' | 'bloom' | 'harvest' | 'collect' | 'read'

const WATER_MS = 2400 // one tap waters the gift all the way to the bloom
const RUNGS = 8
const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))

/** Where a reward card starts (the gift in the box), rests (its slot) and ends (the basket), in px. */
type Flight = { item: GiftItem; slot: { x: number; y: number }; from: { x: number; y: number; s: number }; to: { x: number; y: number } }

export function GrowCollectStage({ onDone }: { onDone: (skipped: boolean) => void }) {
  const { w, h } = useViewport()
  const reduced = useReducedMotion() ?? false
  const giftPx = clamp(220, Math.min(w * 0.66, h * 0.4), 420)
  const [mode, setMode] = useState<Mode>('grow')
  const [watering, setWatering] = useState(false)
  const [bucket, setBucket] = useState(0) // progress in 5% steps, for copy + a11y
  const [stored, setStored] = useState(0)
  const [flights, setFlights] = useState<Flight[] | null>(null)
  const [cphase, setCphase] = useState(0) // collect: 0 out of the box · 1 flipped · 2 flying to the basket
  const progress = useMotionValue(0)
  const [giftScope, animateGift] = useAnimate()

  const modeRef = useRef(mode)
  modeRef.current = mode
  const wateringRef = useRef(false)
  const rung = useRef(0)
  const water = useRef<{ stop(): void } | null>(null)
  const wateredAt = useRef(0)
  const bloomedAt = useRef(0)
  const skipArmed = useRef(false)
  const bagRef = useRef<HTMLDivElement | null>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(
    () => () => {
      clearTimers()
      water.current?.stop()
    },
    [],
  )

  const bloom = useCallback(() => {
    if (modeRef.current !== 'grow') return
    wateringRef.current = false
    setWatering(false)
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
      setMode('harvest')
      haptic.light()
    }, reduced ? 700 : 1900)
  }, [reduced])

  // While watering: grow, on its own, all the way to the bloom.
  useEffect(() => {
    if (!watering || mode !== 'grow') return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, progress.get() + (now - last) / WATER_MS)
      last = now
      progress.set(p)
      if (p >= 1) return bloom()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [watering, mode, progress, bloom])

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

  /** One tap: the can tips and pours by itself until the gift blooms. */
  const startWatering = useCallback(() => {
    if (modeRef.current !== 'grow' || wateringRef.current) return
    wateringRef.current = true
    setWatering(true)
    wateredAt.current = performance.now()
    haptic.light()
  }, [])
  /** Another tap while it waters skips ahead to the bloom (ignoring an accidental double-tap). */
  const growNow = useCallback(() => {
    if (modeRef.current !== 'grow' || !wateringRef.current) return
    if (performance.now() - wateredAt.current < 450) return
    progress.set(1)
    bloom()
  }, [progress, bloom])
  const tapGrow = useCallback(() => (wateringRef.current ? growNow() : startWatering()), [growNow, startWatering])

  /** Collect: the gifts jump out of the box as reward cards, flip, and fly into the storage basket. */
  const collect = useCallback(() => {
    if (modeRef.current !== 'harvest') return
    const rises = Array.from(document.querySelectorAll<HTMLElement>('.grow-gift .rise'))
    const bag = bagRef.current?.getBoundingClientRect()
    const cw = clamp(112, Math.min(w * 0.36, 170), 170)
    const gap = 16
    const rowY = h * 0.44
    const fl: Flight[] = ITEMS.map((item, i) => {
      const slot = { x: w / 2 + (i - (ITEMS.length - 1) / 2) * (cw + gap), y: rowY }
      const r = rises[i]?.getBoundingClientRect()
      const from = r ? { x: r.left + r.width / 2 - slot.x, y: r.top + r.height / 2 - slot.y, s: r.width / cw } : { x: 0, y: 0, s: 0.4 }
      const to = bag ? { x: bag.left + bag.width / 2 - slot.x, y: bag.top + bag.height / 2 - slot.y } : { x: -slot.x, y: -slot.y }
      return { item, slot, from, to }
    })
    setFlights(fl)
    setCphase(0)
    setMode('collect')
    sfx.whoosh(true)
    haptic.medium()
    const t = reduced ? { flip: 250, fly: 700, done: 1300 } : { flip: 520, fly: 1650, done: 2500 }
    ITEMS.forEach((_, i) =>
      later(() => {
        if (i === 0) setCphase(1)
        sfx.flip(i)
        haptic.light()
      }, t.flip + i * 180),
    )
    later(() => {
      sfx.sparkle()
      sfx.ding()
    }, t.flip + 420)
    later(() => setCphase(2), t.fly)
    // the letter comes out with the gifts: the note opens on its own while they fly into storage
    later(() => setMode('read'), t.fly + 150)
    let total = 0
    ITEMS.forEach((it, i) =>
      later(() => {
        total += it.qty
        setStored(total)
        sfx.collect(i * 2)
        haptic.tick()
      }, t.fly + 480 + i * 160),
    )
    later(() => {
      setFlights(null)
      haptic.success()
    }, t.done)
  }, [w, h, reduced])

  /** A tap while the cards play: finish collecting straight away. */
  const fastCollect = useCallback(() => {
    if (modeRef.current !== 'collect') return
    clearTimers()
    setFlights(null)
    setStored(ITEMS.reduce((n, it) => n + it.qty, 0))
    setMode('read')
    sfx.collect(2)
    haptic.medium()
  }, [])

  // Keyboard: Space/Enter waters, skips ahead, collects; Continue is a button.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if ((e.target as HTMLElement)?.closest?.('button')) return
      e.preventDefault()
      if (e.repeat) return
      const m = modeRef.current
      if (m === 'grow') tapGrow()
      else if (m === 'harvest') collect()
      else if (m === 'collect') fastCollect()
      else if (m === 'bloom' && performance.now() - bloomedAt.current > 700) onDone(true)
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [tapGrow, collect, fastCollect, onDone])

  const p = bucket / 20
  const grown = mode !== 'grow'
  const giftsInBox = mode === 'bloom' || mode === 'harvest'
  const showBag = mode === 'harvest' || mode === 'collect' || mode === 'read'
  const title = grown
    ? `A gift from ${SENDER.name}!`
    : p === 0
      ? 'You got a gift!'
      : p < 0.4
        ? 'Watering…'
        : p < 0.8
          ? "It's sprouting!"
          : 'Almost there!'

  return (
    <motion.section
      className={`view stage grow-stage${mode === 'harvest' ? ' grow-stage--harvest' : ''}`}
      // Skip only on a fresh tap during the bloom: the finger that finished the hold lifting is not a skip.
      onPointerDown={() => {
        skipArmed.current = modeRef.current === 'bloom' || modeRef.current === 'collect'
      }}
      onClick={() => {
        const m = modeRef.current
        if (m === 'grow' && wateringRef.current) growNow()
        else if (m === 'bloom' && skipArmed.current) onDone(true)
        else if (m === 'collect' && skipArmed.current) fastCollect()
      }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <AnimatePresence>{(mode === 'grow' || mode === 'bloom') && <SkipButton key="skip" onSkip={() => onDone(true)} />}</AnimatePresence>

      {/* garden storage: where the collected gifts go */}
      <AnimatePresence>
        {showBag && (
          <motion.div
            key="bag"
            ref={bagRef}
            className="bag"
            aria-label={`Garden storage: ${stored} new`}
            initial={{ opacity: 0, scale: 0.6, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <motion.span key={stored} className="bag-icon" initial={{ scale: stored ? 1.35 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
              <BasketIcon />
            </motion.span>
            <AnimatePresence>
              {stored > 0 && (
                <motion.span key={stored} className="bag-count" initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.3, 1] }} transition={{ duration: 0.3 }}>
                  +{stored}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div
            className={`gift-float grow-target${mode === 'grow' ? ' grow-target--on' : ''}${mode === 'harvest' ? ' grow-target--collect' : ''}`}
            onClick={
              mode === 'harvest' || mode === 'grow'
                ? (e) => {
                    e.stopPropagation()
                    if (mode === 'grow') tapGrow()
                    else collect()
                  }
                : undefined
            }
            role={mode === 'harvest' ? 'button' : undefined}
            aria-label={mode === 'harvest' ? 'Collect your gifts' : undefined}
          >
            <Soil />
            {mode === 'grow' && <Twinkles />}
            <GrowSprout progress={progress} bloomed={grown} />
            <motion.div ref={giftScope} className="grow-gift">
              <Gift layoutId="gift" mode={grown ? 'bloom' : 'idle'} label={`Gift from ${SENDER.name}`}>
                {giftsInBox && <GiftItems />}
              </Gift>
            </motion.div>
            <AnimatePresence>
              {(mode === 'grow' || mode === 'bloom' || mode === 'harvest' || mode === 'collect') && (
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
            <AnimatePresence>{mode === 'grow' && <WateringCan key="can" pouring={watering} />}</AnimatePresence>
            {mode === 'bloom' && !reduced && <Burst size={giftPx} />}
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
                type="button"
                className={`btn btn--primary hold-btn${watering ? ' hold-btn--on' : ''}`}
                aria-label={watering ? 'Watering the gift. Tap to skip ahead' : 'Water the gift'}
                onClick={(e) => {
                  e.stopPropagation()
                  tapGrow()
                }}
                whileTap={{ scale: 0.97, y: 2 }}
              >
                <CanIcon />
                <span>{watering ? 'Watering…' : 'Water it'}</span>
              </motion.button>
            </motion.div>
          )}
          {mode === 'bloom' && (
            <motion.p key="skip" className="skip-hint" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              Tap anywhere to skip
            </motion.p>
          )}
          {mode === 'harvest' && (
            <motion.div
              key="harvest"
              className="bottom-inner rcollect"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <p className="tap-hint">
                <span className="tap-dot" /> Tap the gifts to collect them
              </p>
              <Button onClick={collect}>Collect all</Button>
            </motion.div>
          )}
          {mode === 'collect' && (
            <motion.p key="added" className="tap-hint" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              Adding to your garden storage…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* the reward moment: cards out of the box → flip → into storage */}
      <AnimatePresence>
        {(mode === 'collect' || mode === 'read') && flights && (
          <motion.div key="collect" className="collect-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <motion.div
              className="collect-dim"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: cphase === 2 ? 0 : 1 }}
              transition={{ duration: cphase === 2 ? 0.6 : 0.3 }}
            />
            <motion.div
              className="rays collect-rays"
              aria-hidden
              style={{ left: w / 2, top: h * 0.44 }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: cphase === 2 ? 0 : 0.9, scale: 1, rotate: 120 }}
              transition={{ rotate: { duration: 8, ease: 'linear' }, default: { duration: 0.5 } }}
            />
            {cphase >= 1 && !reduced && (
              <div className="collect-confetti" style={{ left: w / 2, top: h * 0.44 }}>
                <Confetti size={Math.min(w, 600) * 0.55} count={44} />
              </div>
            )}
            {flights.map((f, i) => (
              <CollectCard key={f.item.id} flight={f} index={i} cw={clamp(112, Math.min(w * 0.36, 170), 170)} cphase={cphase} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{mode === 'read' && <UnrollOverlay key="read" w={w} onContinue={() => onDone(false)} />}</AnimatePresence>
    </motion.section>
  )
}

/** One gift as a reward card: jumps out of the box face-down, flips face-up, then flies into the basket. */
function CollectCard({ flight, index, cw, cphase }: { flight: Flight; index: number; cw: number; cphase: number }) {
  const { item, slot, from, to } = flight
  const ch = cw + 56
  return (
    <motion.div
      className="collect-card"
      style={{ left: slot.x - cw / 2, top: slot.y - ch / 2, width: cw }}
      initial={{ x: from.x, y: from.y, scale: from.s, opacity: 0, rotate: index ? 10 : -10 }}
      animate={
        cphase === 2
          ? { x: to.x, y: to.y, scale: 0.12, opacity: [1, 1, 0], rotate: index ? 20 : -20 }
          : { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }
      }
      transition={
        cphase === 2
          ? { duration: 0.55, delay: index * 0.16, ease: [0.5, 0, 0.75, 0.4], opacity: { duration: 0.55, delay: index * 0.16, times: [0, 0.8, 1] } }
          : { type: 'spring', stiffness: 230, damping: 18, delay: index * 0.08, opacity: { duration: 0.1, delay: index * 0.08 } }
      }
    >
      <AnimatePresence>
        {cphase >= 1 && (
          <motion.span
            key="glow"
            className="rcard-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.55], scale: [0.5, 1.25, 1] }}
            transition={{ duration: 0.7, times: [0, 0.35, 1], delay: index * 0.18 }}
          />
        )}
      </AnimatePresence>
      <div className="rcard">
        <motion.div
          className="rcard-flip"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: cphase >= 1 ? 0 : 180, scale: cphase === 1 ? [1, 1.12, 1] : 1 }}
          transition={{ rotateY: { type: 'spring', stiffness: 240, damping: 20, delay: index * 0.18 }, scale: { duration: 0.45, delay: index * 0.18 } }}
        >
          <div className="rcard-face">
            <OfferCell art={<img src={item.img} alt="" draggable={false} />} name={item.name} tab={`×${item.qty}`} />
          </div>
          <div className="rcard-face rcard-face--back">
            <CardBack />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/** Irene's letter pops up, flips up, and the note unrolls beneath it: all on its own. */
function UnrollOverlay({ w, onContinue }: { w: number; onContinue: () => void }) {
  const cardW = Math.min(w * 0.88, 520)
  const letterH = (cardW * 189) / 355
  const noteH = (cardW * 119) / 355
  const [stage, setStage] = useState(0) // 0 letter pops up · 1 unrolling · 2 sticker + continue
  useEffect(() => {
    const a = window.setTimeout(() => {
      setStage(1)
      sfx.paper()
      haptic.light()
    }, 1000)
    const b = window.setTimeout(() => {
      setStage(2)
      sfx.pop(6)
      sfx.ding()
      haptic.medium()
    }, 1900)
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
            initial={{ opacity: 0, y: 120, scale: 0.45, rotate: -8 }}
            animate={stage >= 1 ? { rotateX: 100, opacity: 0, y: -12, scale: 1, rotate: 0 } : { rotateX: 0, opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={stage >= 1 ? { duration: 0.45, ease: 'easeIn' } : { type: 'spring', stiffness: 260, damping: 17, opacity: { duration: 0.15 } }}
          >
            <Letter />
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
