import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ART, SENDER } from '../../../data'
import { haptic, sfx } from '../../shared/feedback'
import { SkipButton } from '../../shared/SoundToggle'
import { useViewport } from '../useViewport'
import { Note } from './Note'
import { Twinkles } from './Particles'
import { BasketIcon, CardBack, CARDS, Confetti, MiniNote, OfferCell, type CardDef } from './RewardParts'
import { Button } from './ui'

/**
 * Variation 3 · "Reward reveal": fast and punchy, like a game's reward screen.
 *  idle    → the gift as a Picnic Gift Shop offer card, rays turning behind it
 *  charge  → one tap: it shakes harder and harder as a tone climbs (≈0.5 s)
 *  burst   → POP: flash, confetti in the banner's motifs (hearts, sparkles, petals)
 *  deal    → three face-down cards fly out into a row and flip one by one: the two gifts, then Irene's note
 *  reveal  → tap the note card to read it; "Collect all" sends the gifts flying into your garden storage
 * Any tap while it plays fast-forwards to all cards face up.
 */
type Step = 'idle' | 'charge' | 'deal' | 'reveal' | 'collect'

const T = { burst: 520, deal: 680, flips: [1250, 1530, 1810], reveal: 2150 }
const T_REDUCED = { burst: 120, deal: 200, flips: [350, 450, 550], reveal: 700 }
const clamp = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))

export function RewardStage({ onDone }: { onDone: (skipped: boolean) => void }) {
  const { w, h } = useViewport()
  const reduced = useReducedMotion() ?? false
  const [step, setStep] = useState<Step>('idle')
  const [burst, setBurst] = useState(false)
  const [flipped, setFlipped] = useState(0)
  const [reading, setReading] = useState(false)
  const [readOnce, setReadOnce] = useState(false)
  const [stored, setStored] = useState(0)
  const [fly, setFly] = useState<{ x: number; y: number }[] | null>(null)
  const stepRef = useRef(step)
  stepRef.current = step
  const startedAt = useRef(0)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const bagRef = useRef<HTMLDivElement | null>(null)

  const gw = clamp(170, Math.min(w * 0.5, h * 0.28), 250)
  const gap = w < 400 ? 8 : 14
  const cw = clamp(96, (Math.min(w, 640) - 40 - gap * 2) / 3, 170)

  const reveal = useCallback(() => {
    setStep('reveal')
    setFlipped(3)
    sfx.fanfare()
    haptic.success()
  }, [])

  const open = useCallback(() => {
    if (stepRef.current !== 'idle') return
    const t = reduced ? T_REDUCED : T
    startedAt.current = performance.now()
    setStep('charge')
    sfx.charge(t.burst / 1000)
    ;[0, 170, 340].forEach((ms, i) =>
      later(() => {
        sfx.rattle()
        haptic.build(i * 2)
      }, ms),
    )
    later(() => {
      setBurst(true)
      sfx.pop(2)
      sfx.sparkle()
      haptic.heavy()
    }, t.burst)
    later(() => {
      setStep('deal')
      ;[0, 0.08, 0.16].forEach((d) => sfx.swish(d))
    }, t.deal)
    t.flips.forEach((ms, i) =>
      later(() => {
        setFlipped(i + 1)
        sfx.flip(i)
        haptic.light()
      }, ms),
    )
    later(reveal, t.reveal)
  }, [reduced, reveal])

  /** A tap while it plays: jump to every card face up. */
  const fastForward = useCallback(() => {
    if (stepRef.current !== 'charge' && stepRef.current !== 'deal') return
    if (performance.now() - startedAt.current < 400) return // the opening tap's echo
    clearTimers()
    setBurst(true)
    reveal()
  }, [reveal])

  const collect = useCallback(() => {
    if (stepRef.current !== 'reveal') return
    const bag = bagRef.current?.getBoundingClientRect()
    const targets = CARDS.map((c, i) => {
      const r = cardRefs.current[i]?.getBoundingClientRect()
      if (!bag || !r || c.kind === 'note') return { x: 0, y: 40 }
      return { x: bag.left + bag.width / 2 - (r.left + r.width / 2), y: bag.top + bag.height / 2 - (r.top + r.height / 2) }
    })
    setFly(targets)
    setStep('collect')
    sfx.whoosh(true)
    let total = 0
    CARDS.forEach((c, i) => {
      if (c.kind !== 'item') return
      later(() => {
        total += c.qty
        setStored(total)
        sfx.collect(i * 2)
        haptic.tick()
      }, 520 + i * 160)
    })
    later(() => {
      sfx.ding()
      haptic.medium()
    }, 980)
    later(() => onDone(false), 1500)
  }, [onDone])

  const readNote = useCallback(() => {
    if (stepRef.current !== 'reveal') return
    setReading(true)
    setReadOnce(true)
    sfx.paper()
    haptic.light()
    later(() => {
      sfx.pop(6)
      haptic.medium()
    }, 350)
  }, [])

  // Keyboard: Enter / Space walks through it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if ((e.target as HTMLElement)?.closest?.('button, [role="button"]')) return
      e.preventDefault()
      if (reading) return setReading(false)
      if (stepRef.current === 'idle') open()
      else if (stepRef.current === 'reveal') collect()
      else fastForward()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, collect, fastForward, reading])

  const dealt = step === 'deal' || step === 'reveal' || step === 'collect'
  const showGift = step === 'idle' || step === 'charge'
  const title = dealt ? `A gift from ${SENDER.name}!` : 'You got a gift!'

  return (
    <motion.section
      className={`view stage rstage${step === 'charge' || step === 'deal' ? ' stage--opening' : ''}`}
      onClick={step === 'charge' || step === 'deal' ? fastForward : undefined}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <AnimatePresence>
        {(step === 'idle' || step === 'charge' || step === 'deal') && <SkipButton key="skip" onSkip={() => onDone(true)} />}
      </AnimatePresence>

      {/* garden storage, where collected gifts fly to */}
      <AnimatePresence>
        {(step === 'reveal' || step === 'collect') && (
          <motion.div
            key="bag"
            ref={bagRef}
            className="bag"
            aria-label={`Garden storage: ${stored} new`}
            initial={{ opacity: 0, scale: 0.6, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
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

      <motion.div
        className="rays rays--stage"
        aria-hidden
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{ opacity: dealt ? 0.95 : step === 'charge' ? 0.8 : 0.5, scale: dealt ? 1.15 : step === 'charge' ? 1 : 0.85, rotate: 360 }}
        transition={{ rotate: { duration: 40, repeat: Infinity, ease: 'linear' }, default: { duration: 0.6 } }}
      />

      {burst && !reduced && (
        <motion.div className="flash" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: [0, 0.75, 0] }} transition={{ duration: 0.5, times: [0, 0.15, 1] }} />
      )}

      <div className="rstage-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={title}
            className="title rtitle"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            {title}
          </motion.h1>
        </AnimatePresence>

        <div className="rarea" style={{ minHeight: Math.max(gw + 64, cw + 64) }}>
          {/* the gift, as an offer card */}
          <AnimatePresence>
            {showGift && (
              <motion.div
                key="gift"
                className="rgift"
                style={{ width: gw }}
                role="button"
                tabIndex={0}
                aria-label={`Open your gift from ${SENDER.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  open()
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={
                  step === 'charge'
                    ? {
                        opacity: 1,
                        scale: [1, 1.02, 1.04, 1.06, 1.08, 1.1],
                        x: [0, -3, 3, -6, 6, -9, 9, -11, 11, 0],
                        rotate: [0, -2, 2, -4, 4, -6, 6, -7, 7, 0],
                      }
                    : { opacity: 1, scale: 1, y: [0, -8, 0] }
                }
                transition={
                  step === 'charge'
                    ? { duration: 0.52, ease: 'easeIn' }
                    : { y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 300, damping: 20 } }
                }
                exit={{ scale: 1.4, opacity: 0, filter: 'brightness(2.2)', transition: { duration: 0.22, ease: 'easeOut' } }}
                whileHover={step === 'idle' ? { scale: 1.04 } : undefined}
                whileTap={step === 'idle' ? { scale: 0.96 } : undefined}
              >
                {step === 'idle' && <Twinkles />}
                <span className={`rgift-glow${step === 'charge' ? ' rgift-glow--hot' : ''}`} />
                <OfferCell
                  className="offer--gift"
                  art={<img src={ART.giftBox} alt="" draggable={false} />}
                  name={`A gift for Sage`}
                  tab={
                    <>
                      <img src={SENDER.avatar} alt="" className="offer-tab-avatar" /> {SENDER.name}
                    </>
                  }
                />
                <span className="offer-shine" aria-hidden />
              </motion.div>
            )}
          </AnimatePresence>
          {burst && !reduced && (
            <div className="confetti-origin">
              <Confetti size={Math.min(w, 600) * 0.6} />
            </div>
          )}

          {/* the reward cards */}
          {dealt && (
            <div className="rrow" style={{ gap }}>
              {CARDS.map((c, i) => (
                <RewardCard
                  key={c.id}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  def={c}
                  index={i}
                  cw={cw}
                  gap={gap}
                  flipped={flipped > i}
                  fly={fly?.[i] ?? null}
                  readOnce={readOnce}
                  onRead={step === 'reveal' ? readNote : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bottom">
        <AnimatePresence mode="wait" initial={false}>
          {step === 'idle' && (
            <motion.div key="open" className="bottom-inner" exit={{ opacity: 0, y: 14, transition: { duration: 0.15 } }}>
              <Button onClick={open}>Open</Button>
            </motion.div>
          )}
          {(step === 'charge' || step === 'deal') && (
            <motion.p key="skip" className="skip-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}>
              Tap anywhere to skip
            </motion.p>
          )}
          {step === 'reveal' && (
            <motion.div
              key="collect"
              className="bottom-inner rcollect"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 24 }}
            >
              {!readOnce && (
                <p className="tap-hint">
                  <span className="tap-dot" /> Tap the note to read it
                </p>
              )}
              <Button onClick={collect}>Collect all</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{reading && <ReadOverlay key="read" w={w} onDone={() => setReading(false)} />}</AnimatePresence>
    </motion.section>
  )
}

type RewardCardProps = {
  def: CardDef
  index: number
  cw: number
  gap: number
  flipped: boolean
  fly: { x: number; y: number } | null
  readOnce: boolean
  onRead?: () => void
  ref?: (el: HTMLDivElement | null) => void
}

/** One card: dealt face-down from the center, flips face-up, and flies to storage when collected. */
function RewardCard({ def, index, cw, gap, flipped, fly, readOnce, onRead, ref }: RewardCardProps) {
  const isNote = def.kind === 'note'
  const tappable = isNote && flipped && !!onRead
  return (
    <motion.div
      ref={ref}
      className="rcard"
      style={{ width: cw }}
      initial={{ x: (1 - index) * (cw + gap), y: 10, scale: 0.3, rotate: (index - 1) * -24, opacity: 0 }}
      animate={
        fly
          ? isNote
            ? { x: 0, y: fly.y, scale: 0.9, opacity: 0, rotate: 0 }
            : { x: fly.x, y: fly.y, scale: 0.12, opacity: [1, 1, 0], rotate: (index - 1) * 30 }
          : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
      }
      transition={
        fly
          ? isNote
            ? { duration: 0.4, delay: 0.3, ease: 'easeIn' }
            : { duration: 0.55, delay: index * 0.16, ease: [0.5, 0, 0.75, 0.4], opacity: { duration: 0.55, delay: index * 0.16, times: [0, 0.8, 1] } }
          : { type: 'spring', stiffness: 260, damping: 19, delay: index * 0.07, opacity: { duration: 0.12, delay: index * 0.07 } }
      }
      role={tappable ? 'button' : undefined}
      tabIndex={tappable ? 0 : undefined}
      aria-label={tappable ? `Read the note from ${SENDER.name}` : flipped ? `${def.name} ${def.tab}` : 'Face-down card'}
      onClick={
        tappable
          ? (e) => {
              e.stopPropagation()
              onRead?.()
            }
          : undefined
      }
      onKeyDown={(e) => {
        if (tappable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          e.stopPropagation()
          onRead?.()
        }
      }}
      whileHover={tappable ? { y: -4 } : undefined}
      whileTap={tappable ? { scale: 0.96 } : undefined}
    >
      <AnimatePresence>
        {flipped && (
          <motion.span
            key="glow"
            className={`rcard-glow${isNote ? ' rcard-glow--note' : ''}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.55], scale: [0.5, 1.25, 1] }}
            transition={{ duration: 0.7, times: [0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="rcard-flip"
        initial={false}
        animate={{ rotateY: flipped ? 0 : 180, scale: flipped ? [1, 1.12, 1] : 1 }}
        transition={{ rotateY: { type: 'spring', stiffness: 240, damping: 20 }, scale: { duration: 0.45 } }}
      >
        <div className="rcard-face">
          <OfferCell
            className={isNote ? 'offer--note' : ''}
            art={isNote ? <MiniNote /> : <img src={def.img} alt="" draggable={false} />}
            name={def.name}
            tab={isNote ? (readOnce ? 'Read ✓' : 'Read') : def.tab}
            tabClass={isNote ? `offer-tab--note${tappable && !readOnce ? ' offer-tab--pulse' : ''}` : ''}
          />
        </div>
        <div className="rcard-face rcard-face--back">
          <CardBack />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Reading the note: it pops up big, the sticker slaps on. */
function ReadOverlay({ w, onDone }: { w: number; onDone: () => void }) {
  const cardW = Math.min(w * 0.88, 520)
  const [slap, setSlap] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSlap(true), 350)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} onClick={onDone}>
      <div className="overlay-center">
        <div className="note-spotlight" aria-hidden style={{ width: cardW * 1.5, height: cardW * 1.1 }} />
        <div className="rread" style={{ width: cardW }}>
          <motion.p className="note-heading rread-heading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <img src={SENDER.avatar} alt="" />
            {SENDER.name} left you a note
          </motion.p>
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          >
            <Note className="note--reading" fold="open" sticker={slap ? 'slap' : 'none'} style={{ width: cardW }} />
          </motion.div>
        </div>
      </div>
      <div className="bottom">
        <motion.div className="bottom-inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button onClick={onDone}>Done</Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
