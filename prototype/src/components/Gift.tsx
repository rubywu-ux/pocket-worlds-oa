import { useId, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'motion/react'
import { ART } from '../data'

/**
 * The sweetheart gift box, unboxed like a planter.
 * idle   → floats, glows, and gives a little "tap me" wiggle now and then
 * wiggle → anticipation: squash and shake; the lid jiggles as a sprout pushes up from inside
 * bloom  → the lid pops off and flies away; flowers grow out of the open box and the gifts pop out
 * open   → resting, opened state with the gifts inside
 * closed → back to its closed, formal state: the lid drops back on (final layout)
 *
 * Layers, back to front: glow/rays · leaves · open box (inside) · flowers · gifts · box front wall · sprout · lid.
 * The open box art is generated from the lid's own silhouette (prototype/tools/make-box-base.py).
 */
export type GiftMode = 'idle' | 'wiggle' | 'bloom' | 'open' | 'closed'

type GiftProps = {
  mode: GiftMode
  layoutId?: string
  onActivate?: () => void
  label?: string
  /** In the open state, play a quick bloom (used after a skip) instead of appearing already bloomed. */
  enterFromClosed?: boolean
  /** Gifts popping out of the box: rendered between the inside of the box and its front wall. */
  children?: ReactNode
  /** In the closed state, appear already closed (no lid drop). */
  closeInstantly?: boolean
}

const BOX: Record<GiftMode, TargetAndTransition> = {
  idle: { scaleX: 1, scaleY: 1, y: '0%', rotate: [0, 0, -4, 4, -3, 2, 0] },
  wiggle: {
    scaleX: [1, 1.1, 0.95, 1.03, 1, 1, 1, 1, 1, 1, 1.08],
    scaleY: [1, 0.86, 1.08, 0.97, 1, 1, 1, 1, 1, 1, 0.88],
    rotate: [0, 0, 0, 0, 0, -6, 7, -8, 8, -5, 0],
    y: '0%',
  },
  bloom: { scaleX: [1.08, 0.93, 1.03, 1], scaleY: [0.88, 1.12, 0.97, 1], rotate: 0, y: '6%' },
  open: { scaleX: 1, scaleY: 1, rotate: 0, y: '6%' },
  closed: { scaleX: 1, scaleY: 1, rotate: 0, y: '0%' },
}
/** The lid jiggles as pressure builds, then pops off and spins away. */
const LID_WIGGLE: TargetAndTransition = {
  ...BOX.wiggle,
  y: ['0%', '0%', '0%', '0%', '0%', '-2%', '0%', '-3.5%', '0%', '-5%', '-1%'],
}
const LID_POP: TargetAndTransition = {
  x: ['0%', '4%', '12%'],
  y: ['0%', '-58%', '-125%'],
  rotate: [0, 18, 38],
  scale: [1, 1.06, 0.92],
  opacity: [1, 1, 0],
}
const LID_POP_T: Transition = { duration: 0.85, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] }
const BOX_T: Record<GiftMode, Transition> = {
  idle: { duration: 1.1, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: 1.2 },
  wiggle: { duration: 1.15, ease: 'easeInOut', times: [0, 0.1, 0.2, 0.3, 0.38, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
  bloom: { duration: 0.7, ease: 'easeOut', y: { type: 'spring', stiffness: 260, damping: 14 } },
  open: { duration: 0.35 },
  closed: { duration: 0.35 },
}
/** The lid drops back onto the box with a soft bounce. */
const LID_DROP_FROM: TargetAndTransition = { y: '-85%', rotate: -12, scale: 1.05, opacity: 0 }
const LID_DROP_T: Transition = { type: 'spring', stiffness: 230, damping: 15, delay: 0.1, opacity: { duration: 0.2, delay: 0.1 } }

const GLOW: Record<GiftMode, TargetAndTransition> = {
  idle: { opacity: [0.22, 0.4, 0.22], scale: [0.95, 1.03, 0.95] },
  wiggle: { opacity: 0.75, scale: 1.1 },
  bloom: { opacity: [1, 0.5], scale: [1.5, 1.1] },
  open: { opacity: 0.4, scale: 1 },
  closed: { opacity: 0.3, scale: 1 },
}
const GLOW_T: Record<GiftMode, Transition> = {
  idle: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  wiggle: { duration: 1 },
  bloom: { duration: 1.2, ease: 'easeOut' },
  open: { duration: 0.6 },
  closed: { duration: 0.6 },
}

export function Gift({ mode, layoutId, onActivate, label, enterFromClosed = false, children, closeInstantly = false }: GiftProps) {
  const bloomed = mode === 'bloom' || mode === 'open'
  // Already-open gifts (final layout) appear bloomed without replaying, unless we got here by skipping.
  const instant = mode === 'open' && !enterFromClosed

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

        {/* Everything that belongs to the opened box tucks away when the lid comes back down */}
        <AnimatePresence>
          {bloomed && (
            <motion.div
              key="rays"
              className="rays"
              initial={instant ? { scale: 1, opacity: 0.85 } : { scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85, rotate: 360 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{
                scale: { type: 'spring', stiffness: 120, damping: 14 },
                opacity: { duration: 0.4 },
                rotate: { duration: 48, repeat: Infinity, ease: 'linear' },
              }}
            />
          )}
          {bloomed && (
            <motion.div key="leaves" className="gift-sublayer gift-sublayer--leaves" exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.3 } }}>
              <BaseLeaves show instant={instant} />
            </motion.div>
          )}

          {/* The open box: its inside, then flowers and gifts, then its front wall on top of them */}
          {bloomed && (
            <motion.div
              key="base"
              className="box box--base"
              initial={instant ? BOX.open : { scaleX: 1.08, scaleY: 0.88, y: '0%', rotate: 0 }}
              animate={BOX[mode]}
              exit={{ y: '0%', opacity: 0, transition: { opacity: { delay: 0.45, duration: 0.15 }, y: { duration: 0.3 } } }}
              transition={BOX_T[mode]}
            >
              <img src={ART.boxBase} className="box-img" alt="" draggable={false} />
            </motion.div>
          )}
          {bloomed && (
            <motion.div key="bloom" className="gift-sublayer gift-sublayer--bloom" exit={{ y: '20%', scale: 0.5, opacity: 0, transition: { duration: 0.3 } }}>
              <Bloom instant={instant} />
            </motion.div>
          )}
          {children && (
            <motion.div key="items" className="gift-items" exit={{ y: '12%', opacity: 0, transition: { delay: 0.2, duration: 0.25 } }}>
              {children}
            </motion.div>
          )}
          {bloomed && (
            <motion.div
              key="front"
              className="box box--front"
              initial={instant ? BOX.open : { scaleX: 1.08, scaleY: 0.88, y: '0%', rotate: 0 }}
              animate={BOX[mode]}
              exit={{ y: '0%', opacity: 0, transition: { opacity: { delay: 0.45, duration: 0.15 }, y: { duration: 0.3 } } }}
              transition={BOX_T[mode]}
            >
              <img src={ART.boxFront} className="box-img" alt="" draggable={false} />
            </motion.div>
          )}
        </AnimatePresence>

        {(mode === 'wiggle' || mode === 'bloom') && <Sprout burst={mode === 'bloom'} />}

        {/* The lid (the original closed-box art): shakes, pops off, and comes back on at the end */}
        {(mode !== 'open' || enterFromClosed) && (
          <motion.div
            className="box box--lid"
            initial={mode === 'closed' && !closeInstantly ? LID_DROP_FROM : false}
            animate={bloomed ? LID_POP : mode === 'wiggle' ? LID_WIGGLE : { ...BOX[mode], opacity: 1 }}
            transition={bloomed ? LID_POP_T : mode === 'closed' ? LID_DROP_T : BOX_T[mode]}
          >
            <img src={ART.giftBox} className="box-img" alt="" draggable={false} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/** A seedling that pushes up out of the box while it shakes. Its bud becomes the big flower. */
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

type FlowerVariant = 'main' | 'pink' | 'yellow'
const PALETTE: Record<FlowerVariant, { outer: [string, string, string]; inner: [string, string]; stroke: [string, string] }> = {
  main: { outer: ['#ffd3e9', '#ff8cc6', '#f0559f'], inner: ['#ffb3d7', '#ff4fa3'], stroke: ['#d93a86', '#c92776'] },
  pink: { outer: ['#ffe3f1', '#ffb0d6', '#f57ab5'], inner: ['#ffd0e6', '#ff86bf'], stroke: ['#e0629d', '#d5508f'] },
  yellow: { outer: ['#fff8d6', '#ffe486', '#f7c33d'], inner: ['#fff0b3', '#ffd95a'], stroke: ['#e3a524', '#d99a1a'] },
}

/** A glossy cartoon flower, colored from the sweetheart box and its ribbon. */
function Flower({ variant, className, tilt = 0, delay, instant, originY = 0.85 }: { variant: FlowerVariant; className: string; tilt?: number; delay: number; instant: boolean; originY?: number }) {
  const id = useId()
  const p = PALETTE[variant]
  const petals = variant === 'main' ? 8 : 6
  const step = 360 / petals
  return (
    <motion.svg
      className={`flower ${className}`}
      viewBox="-50 -50 100 100"
      aria-hidden
      style={{ originX: 0.5, originY, rotate: tilt }}
      initial={instant ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 210, damping: 11, delay: instant ? 0 : delay }}
    >
      <defs>
        <radialGradient id={`${id}-o`} cx="0.5" cy="0.15" r="0.95">
          <stop offset="0" stopColor={p.outer[0]} />
          <stop offset="0.55" stopColor={p.outer[1]} />
          <stop offset="1" stopColor={p.outer[2]} />
        </radialGradient>
        <radialGradient id={`${id}-i`} cx="0.5" cy="0.2" r="0.9">
          <stop offset="0" stopColor={p.inner[0]} />
          <stop offset="1" stopColor={p.inner[1]} />
        </radialGradient>
        <radialGradient id={`${id}-c`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.6" stopColor={variant === 'yellow' ? '#ffb347' : '#ffd95a'} />
          <stop offset="1" stopColor={variant === 'yellow' ? '#ee8a1c' : '#f2b324'} />
        </radialGradient>
      </defs>
      <motion.g
        initial={instant ? { rotate: 0 } : { rotate: -60 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, delay: instant ? 0 : delay }}
      >
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={`o${i}`} cx="0" cy="-25" rx="12.5" ry="22" transform={`rotate(${i * step})`} fill={`url(#${id}-o)`} stroke={p.stroke[0]} strokeWidth="1.2" />
        ))}
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={`i${i}`} cx="0" cy="-15" rx="8.5" ry="14" transform={`rotate(${i * step + step / 2})`} fill={`url(#${id}-i)`} stroke={p.stroke[1]} strokeWidth="1" />
        ))}
      </motion.g>
      <circle r="11" fill={`url(#${id}-c)`} stroke="#e09a1c" strokeWidth="1.2" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} r="1.3" cx="0" cy="-5.5" transform={`rotate(${a})`} fill="#e08a12" />
      ))}
      <ellipse cx="-4" cy="-5" rx="3" ry="2" fill="#fff" opacity="0.6" />
    </motion.svg>
  )
}

/**
 * The bloom: one big flower opening up behind the box, centered on it, so the box sits in front
 * of the blossom like a halo (Ruby: flowers behind the box, box centered in front).
 */
function Bloom({ instant }: { instant: boolean }) {
  return (
    <div className="bloom" aria-hidden>
      <Flower variant="pink" className="flower--halo-back" tilt={22.5} delay={0.3} instant={instant} originY={0.5} />
      <Flower variant="main" className="flower--halo" delay={0.2} instant={instant} originY={0.5} />
    </div>
  )
}

function LeafShape({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#a6f264" />
          <stop offset="1" stopColor="#3f9e1c" />
        </linearGradient>
      </defs>
      <path d="M58 98 C 12 82, 2 34, 28 2 C 54 30, 63 70, 58 98 Z" fill={`url(#${id}-g)`} stroke="#2f7d12" strokeWidth="1.2" />
      <path d="M57 96 C 42 70, 35 40, 29 8" stroke="rgba(10,40,0,0.25)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  )
}

function Leaf({ className, rotate, delay, instant, mirror = false }: { className: string; rotate: number; delay: number; instant: boolean; mirror?: boolean }) {
  const id = useId()
  return (
    <motion.svg
      className={className}
      viewBox="0 0 60 100"
      aria-hidden
      style={{ originX: mirror ? 0 : 1, originY: 1 }}
      initial={instant ? { scale: 1, rotate } : { scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate }}
      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: instant ? 0 : delay }}
    >
      {mirror ? (
        <g transform="translate(60 0) scale(-1 1)">
          <LeafShape id={id} />
        </g>
      ) : (
        <LeafShape id={id} />
      )}
    </motion.svg>
  )
}

/** Two big leaves that unfurl from under the box, so the gift reads as something planted. */
function BaseLeaves({ show, instant }: { show: boolean; instant: boolean }) {
  if (!show) return null
  return (
    <>
      <Leaf className="base-leaf base-leaf--l" rotate={-40} delay={0.12} instant={instant} />
      <Leaf className="base-leaf base-leaf--r" rotate={40} delay={0.12} instant={instant} mirror />
    </>
  )
}
