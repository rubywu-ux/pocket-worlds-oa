import { useId, type KeyboardEvent } from 'react'
import { motion, type TargetAndTransition, type Transition } from 'motion/react'
import { ART } from '../data'

/**
 * The sweetheart gift box.
 * idle   → floats and gives a little "tap me" wiggle now and then
 * wiggle → anticipation: squash, shake, and a sprout pushes out of the box
 * bloom  → the bud bursts: the heart splits open like petals and a flower blooms
 * open   → resting, opened state (used in the final layout)
 */
export type GiftMode = 'idle' | 'wiggle' | 'bloom' | 'open'

type GiftProps = {
  mode: GiftMode
  layoutId?: string
  onActivate?: () => void
  label?: string
  /** In the open state, animate the box opening (used after a skip) instead of appearing already open. */
  enterFromClosed?: boolean
}

const HALF_CLOSED = { rotate: 0, x: '0%', y: '0%' }
const HALF_L_OPEN = { rotate: -30, x: '-17%', y: '4%' }
const HALF_R_OPEN = { rotate: 30, x: '17%', y: '4%' }
const POP: Transition = { type: 'spring', stiffness: 240, damping: 13 }

const BOX: Record<GiftMode, TargetAndTransition> = {
  idle: { scaleX: 1, scaleY: 1, rotate: [0, 0, -4, 4, -3, 2, 0] },
  wiggle: {
    scaleX: [1, 1.1, 0.95, 1.03, 1, 1, 1, 1, 1, 1, 1.07],
    scaleY: [1, 0.86, 1.08, 0.97, 1, 1, 1, 1, 1, 1, 0.9],
    rotate: [0, 0, 0, 0, 0, -6, 7, -8, 8, -5, 0],
  },
  bloom: { scaleX: 1, scaleY: 1, rotate: 0 },
  open: { scaleX: 1, scaleY: 1, rotate: 0 },
}
const BOX_T: Record<GiftMode, Transition> = {
  idle: { duration: 1.1, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: 1.2 },
  wiggle: { duration: 1.15, ease: 'easeInOut', times: [0, 0.1, 0.2, 0.3, 0.38, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
  bloom: { type: 'spring', stiffness: 420, damping: 11 },
  open: { duration: 0.3 },
}

const GLOW: Record<GiftMode, TargetAndTransition> = {
  idle: { opacity: [0.22, 0.4, 0.22], scale: [0.95, 1.03, 0.95] },
  wiggle: { opacity: 0.75, scale: 1.1 },
  bloom: { opacity: [1, 0.55], scale: [1.5, 1.12] },
  open: { opacity: 0.45, scale: 1 },
}
const GLOW_T: Record<GiftMode, Transition> = {
  idle: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  wiggle: { duration: 1 },
  bloom: { duration: 1.2, ease: 'easeOut' },
  open: { duration: 0.6 },
}

export function Gift({ mode, layoutId, onActivate, label, enterFromClosed = false }: GiftProps) {
  const bloomed = mode === 'bloom' || mode === 'open'
  // Already-open gifts (final layout) appear open without replaying the bloom, unless we got here by skipping.
  const instant = mode === 'open' && !enterFromClosed
  const halfInitial = (open: typeof HALF_L_OPEN) => (instant ? open : mode === 'open' ? HALF_CLOSED : false)

  const onKey = (e: KeyboardEvent) => {
    if (onActivate && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.stopPropagation()
      onActivate()
    }
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={`gift gift--${mode}${onActivate ? ' gift--interactive' : ''}`}
      onClick={
        onActivate
          ? (e) => {
              e.stopPropagation()
              onActivate()
            }
          : undefined
      }
      onKeyDown={onKey}
      role={onActivate ? 'button' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={label}
      whileHover={onActivate ? { scale: 1.03 } : undefined}
      whileTap={onActivate ? { scale: 0.97 } : undefined}
    >
      <div className="gift-layers">
        <motion.div className="gift-glow" initial={false} animate={GLOW[mode]} transition={GLOW_T[mode]} />

        {bloomed && (
          <motion.div
            className="rays"
            initial={instant ? { scale: 1, opacity: 0.85 } : { scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85, rotate: 360 }}
            transition={{
              scale: { type: 'spring', stiffness: 120, damping: 14 },
              opacity: { duration: 0.4 },
              rotate: { duration: 48, repeat: Infinity, ease: 'linear' },
            }}
          />
        )}

        <BaseLeaves show={bloomed} instant={instant} />
        {(mode === 'wiggle' || mode === 'bloom') && <Sprout burst={mode === 'bloom'} />}

        <motion.div className="box" initial={false} animate={BOX[mode]} transition={BOX_T[mode]}>
          <motion.img
            src={ART.giftBox}
            className="half half--l"
            alt=""
            draggable={false}
            initial={halfInitial(HALF_L_OPEN)}
            animate={bloomed ? HALF_L_OPEN : HALF_CLOSED}
            transition={bloomed ? POP : { duration: 0.3 }}
          />
          <motion.img
            src={ART.giftBox}
            className="half half--r"
            alt=""
            draggable={false}
            initial={halfInitial(HALF_R_OPEN)}
            animate={bloomed ? HALF_R_OPEN : HALF_CLOSED}
            transition={bloomed ? POP : { duration: 0.3 }}
          />
        </motion.div>

        {bloomed && <Flower instant={instant} />}
      </div>
    </motion.div>
  )
}

/** A seedling that pushes up out of the box while it shakes. */
function Sprout({ burst }: { burst: boolean }) {
  const id = useId()
  return (
    <motion.svg
      className="sprout"
      viewBox="0 0 100 100"
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: burst ? 0 : 1 }}
      transition={{ duration: 0.2, delay: burst ? 0.08 : 0 }}
    >
      <defs>
        <linearGradient id={`${id}-stem`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3f9e1c" />
          <stop offset="1" stopColor="#7fe33a" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9cf05a" />
          <stop offset="1" stopColor="#46ad1e" />
        </linearGradient>
        <radialGradient id={`${id}-bud`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffc2e0" />
          <stop offset="0.5" stopColor="#ff5fa8" />
          <stop offset="1" stopColor="#d81f7a" />
        </radialGradient>
      </defs>
      <motion.path
        d="M50 26 C 46 18, 55 10, 50 -4"
        stroke={`url(#${id}-stem)`}
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.15, duration: 0.65, ease: 'easeOut' }}
      />
      <motion.path
        d="M50.5 9 C 44 2, 36 4, 33 9 C 38 13, 45 13, 50.5 9 Z"
        fill={`url(#${id}-leaf)`}
        style={{ originX: 1, originY: 0.6 }}
        initial={{ scale: 0, rotate: 30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.5 }}
      />
      <motion.path
        d="M51 4 C 57 -3, 65 -1, 68 4 C 63 8, 56 8, 51 4 Z"
        fill={`url(#${id}-leaf)`}
        style={{ originX: 0, originY: 0.6 }}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.62 }}
      />
      <motion.g
        initial={{ scale: 0 }}
        animate={burst ? { scale: 3.2, opacity: 0 } : { scale: [0, 1.15, 0.95, 1.08, 1] }}
        transition={burst ? { duration: 0.28, ease: 'easeOut' } : { delay: 0.75, duration: 0.45 }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <ellipse cx="50" cy="-8" rx="5.2" ry="6.4" fill={`url(#${id}-bud)`} />
        <path d="M45.5 -5 C 47 -2, 53 -2, 54.5 -5 C 53 -1, 47 -1, 45.5 -5 Z" fill="#46ad1e" />
        <ellipse cx="48.4" cy="-10" rx="1.4" ry="1.9" fill="#fff" opacity="0.75" />
      </motion.g>
    </motion.svg>
  )
}

/** The flower that blooms out of the opened box. Colors pulled from the sweetheart box and its ribbon. */
function Flower({ instant }: { instant: boolean }) {
  const id = useId()
  const outer = Array.from({ length: 8 }, (_, i) => i * 45)
  const inner = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
  return (
    <motion.svg
      className="flower"
      viewBox="-50 -50 100 100"
      aria-hidden
      initial={instant ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -70, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 190, damping: 11, delay: 0.03 }}
    >
      <defs>
        <radialGradient id={`${id}-outer`} cx="0.5" cy="0.15" r="0.95">
          <stop offset="0" stopColor="#ffd3e9" />
          <stop offset="0.55" stopColor="#ff8cc6" />
          <stop offset="1" stopColor="#f0559f" />
        </radialGradient>
        <radialGradient id={`${id}-inner`} cx="0.5" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#ffb3d7" />
          <stop offset="1" stopColor="#ff4fa3" />
        </radialGradient>
        <radialGradient id={`${id}-center`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.6" stopColor="#ffd95a" />
          <stop offset="1" stopColor="#f2b324" />
        </radialGradient>
      </defs>
      <g>
        {outer.map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-25"
            rx="12.5"
            ry="22"
            transform={`rotate(${a})`}
            fill={`url(#${id}-outer)`}
            stroke="#d93a86"
            strokeWidth="1.2"
          />
        ))}
      </g>
      <g>
        {inner.map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-15"
            rx="8.5"
            ry="14"
            transform={`rotate(${a})`}
            fill={`url(#${id}-inner)`}
            stroke="#c92776"
            strokeWidth="1"
          />
        ))}
      </g>
      <circle r="11" fill={`url(#${id}-center)`} stroke="#e09a1c" strokeWidth="1.2" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} r="1.3" cx="0" cy="-5.5" transform={`rotate(${a})`} fill="#e08a12" />
      ))}
      <ellipse cx="-4" cy="-5" rx="3" ry="2" fill="#fff" opacity="0.6" />
    </motion.svg>
  )
}

/** Two big leaves that unfurl from under the box, so the gift reads as something planted. */
function BaseLeaves({ show, instant }: { show: boolean; instant: boolean }) {
  const id = useId()
  const t: Transition = { type: 'spring', stiffness: 200, damping: 12, delay: show && !instant ? 0.14 : 0 }
  const leaf = (
    <>
      <path d="M58 98 C 12 82, 2 34, 28 2 C 54 30, 63 70, 58 98 Z" fill={`url(#${id}-g)`} />
      <path d="M57 96 C 42 70, 35 40, 29 8" stroke="rgba(10,40,0,0.25)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  )
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <linearGradient id={`${id}-g`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#a6f264" />
            <stop offset="1" stopColor="#3f9e1c" />
          </linearGradient>
        </defs>
      </svg>
      <motion.svg
        className="base-leaf base-leaf--l"
        viewBox="0 0 60 100"
        aria-hidden
        style={{ originX: 1, originY: 1 }}
        initial={instant ? { scale: 1, rotate: -40 } : false}
        animate={show ? { scale: 1, rotate: -40 } : { scale: 0, rotate: 0 }}
        transition={t}
      >
        {leaf}
      </motion.svg>
      <motion.svg
        className="base-leaf base-leaf--r"
        viewBox="0 0 60 100"
        aria-hidden
        style={{ originX: 0, originY: 1 }}
        initial={instant ? { scale: 1, rotate: 40 } : false}
        animate={show ? { scale: 1, rotate: 40 } : { scale: 0, rotate: 0 }}
        transition={t}
      >
        <g transform="translate(60 0) scale(-1 1)">{leaf}</g>
      </motion.svg>
    </>
  )
}
