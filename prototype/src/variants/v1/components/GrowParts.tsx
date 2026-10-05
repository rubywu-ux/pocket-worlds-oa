import { useId } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'

/** The soil mound the gift is planted in, with a few grass tufts. */
export function Soil() {
  const id = useId()
  return (
    <svg className="soil" viewBox="0 0 240 70" aria-hidden preserveAspectRatio="none">
      <defs>
        <radialGradient id={`${id}-dirt`} cx="0.5" cy="0.2" r="0.75">
          <stop offset="0" stopColor="#7a5236" />
          <stop offset="0.6" stopColor="#5a3a25" />
          <stop offset="1" stopColor="#3b2617" />
        </radialGradient>
        <linearGradient id={`${id}-grass`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2f7d12" />
          <stop offset="1" stopColor="#8ee24c" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="40" rx="116" ry="26" fill={`url(#${id}-dirt)`} />
      <ellipse cx="120" cy="33" rx="96" ry="12" fill="rgba(255,220,180,0.1)" />
      {[
        [36, 30],
        [60, 44],
        [180, 46],
        [204, 30],
        [120, 56],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2 + (i % 2)} fill="rgba(0,0,0,0.22)" />
      ))}
      {/* grass tufts, swaying */}
      {[
        { x: 14, s: 1 },
        { x: 30, s: 0.8 },
        { x: 212, s: 1.05 },
        { x: 228, s: 0.75 },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x} 40) scale(${t.s})`}>
          <g className="tuft" style={{ animationDelay: `${i * 0.4}s` }}>
            <path d="M0 0 C -4 -12, -10 -18, -14 -22 C -6 -16, -1 -10, 2 0 Z" fill={`url(#${id}-grass)`} />
            <path d="M2 0 C 2 -12, 4 -22, 8 -30 C 7 -20, 7 -10, 6 0 Z" fill={`url(#${id}-grass)`} />
            <path d="M5 0 C 8 -8, 14 -14, 20 -16 C 14 -10, 10 -6, 8 0 Z" fill={`url(#${id}-grass)`} />
          </g>
        </g>
      ))}
    </svg>
  )
}

/**
 * The seedling that grows out of the dip in the heart box as Sage waters it.
 * Every part is driven by `progress` (0 → 1), so it grows exactly as long as she holds.
 */
export function GrowSprout({ progress, bloomed }: { progress: MotionValue<number>; bloomed: boolean }) {
  const id = useId()
  const stem = useTransform(progress, [0.02, 0.78], [0, 1])
  const leaf1 = useTransform(progress, [0.18, 0.36], [0, 1])
  const leaf2 = useTransform(progress, [0.4, 0.58], [0, 1])
  const leaf3 = useTransform(progress, [0.55, 0.72], [0, 1])
  const bud = useTransform(progress, [0.7, 0.98], [0, 1])
  const glow = useTransform(progress, [0.6, 1], [0, 1])
  return (
    <motion.svg
      className="grow-sprout"
      viewBox="0 0 100 100"
      aria-hidden
      initial={false}
      animate={bloomed ? { opacity: 0, scale: 1.25 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{ originX: 0.6, originY: 0.3 }}
    >
      <defs>
        <linearGradient id={`${id}-stem`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3f9e1c" />
          <stop offset="1" stopColor="#8ee24c" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a6f264" />
          <stop offset="1" stopColor="#3f9e1c" />
        </linearGradient>
        <radialGradient id={`${id}-bud`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd3e9" />
          <stop offset="0.5" stopColor="#ff6fb0" />
          <stop offset="1" stopColor="#d81f7a" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="rgba(255,240,200,0.9)" />
          <stop offset="1" stopColor="rgba(255,240,200,0)" />
        </radialGradient>
      </defs>
      <g className="sprout-sway">
        <motion.circle cx="60" cy="-14" r="16" fill={`url(#${id}-glow)`} style={{ opacity: glow, scale: glow }} />
        <motion.path
          d="M60 34 C 56 22, 65 12, 60 -12"
          stroke={`url(#${id}-stem)`}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
          style={{ pathLength: stem }}
        />
        <motion.path
          d="M60.5 14 C 53 6, 44 8, 41 13 C 46 18, 54 18, 60.5 14 Z"
          fill={`url(#${id}-leaf)`}
          stroke="#2f7d12"
          strokeWidth="0.6"
          style={{ scale: leaf1, originX: 1, originY: 0.6 }}
        />
        <motion.path
          d="M61 4 C 68 -4, 77 -2, 80 3 C 75 8, 67 8, 61 4 Z"
          fill={`url(#${id}-leaf)`}
          stroke="#2f7d12"
          strokeWidth="0.6"
          style={{ scale: leaf2, originX: 0, originY: 0.6 }}
        />
        <motion.path
          d="M60 -4 C 55 -10, 49 -9, 47 -5 C 50 -1, 56 -1, 60 -4 Z"
          fill={`url(#${id}-leaf)`}
          stroke="#2f7d12"
          strokeWidth="0.6"
          style={{ scale: leaf3, originX: 1, originY: 0.6 }}
        />
        <motion.g style={{ scale: bud, originX: 0.5, originY: 1 }}>
          <ellipse cx="60" cy="-16" rx="5.4" ry="6.6" fill={`url(#${id}-bud)`} stroke="#c92776" strokeWidth="0.6" />
          <path d="M55.3 -13 C 57 -10, 63 -10, 64.7 -13 C 63 -9, 57 -9, 55.3 -13 Z" fill="#46ad1e" />
          <ellipse cx="58.3" cy="-18.4" rx="1.4" ry="2" fill="#fff" opacity="0.75" />
        </motion.g>
      </g>
    </motion.svg>
  )
}

/** A glossy watering can that tips and pours while Sage holds. */
export function WateringCan({ pouring }: { pouring: boolean }) {
  const id = useId()
  return (
    <motion.div
      className="can"
      aria-hidden
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={pouring ? { opacity: 1, x: 0, y: 0, rotate: -34 } : { opacity: 1, x: 0, y: [0, -6, 0], rotate: [0, -4, 0] }}
      exit={{ opacity: 0, x: 30, y: -20, rotate: 10, transition: { duration: 0.3 } }}
      transition={
        pouring
          ? { type: 'spring', stiffness: 260, damping: 16 }
          : { duration: 2.6, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.3 } }
      }
      style={{ originX: 0.62, originY: 0.5 }}
    >
      <svg viewBox="0 0 120 100" width="100%" height="100%">
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9bd8ff" />
            <stop offset="0.55" stopColor="#4fb0f5" />
            <stop offset="1" stopColor="#2a7fd0" />
          </linearGradient>
        </defs>
        <path d="M58 34 C 58 8, 94 8, 94 34" fill="none" stroke="#2a7fd0" strokeWidth="8" strokeLinecap="round" />
        <path d="M58 34 C 58 8, 94 8, 94 34" fill="none" stroke="#7cc8ff" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M46 62 L 12 32 L 5 40 L 42 76 Z" fill={`url(#${id}-body)`} stroke="#1f6fb8" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="8" cy="36" rx="9" ry="5.5" transform="rotate(-42 8 36)" fill="#bfe6ff" stroke="#1f6fb8" strokeWidth="2" />
        <path
          d="M44 38 Q 44 33 49 33 H 97 Q 102 33 102 38 L 106 86 Q 106 93 99 93 H 47 Q 40 93 40 86 Z"
          fill={`url(#${id}-body)`}
          stroke="#1f6fb8"
          strokeWidth="2.4"
        />
        <rect x="41" y="52" width="64" height="7" fill="rgba(31,111,184,0.35)" />
        <rect x="50" y="40" width="7" height="44" rx="3.5" fill="#fff" opacity="0.4" />
        <circle cx="92" cy="44" r="3" fill="#fff" opacity="0.55" />
      </svg>
      {/* water stream from the spout (counter-rotated so it falls straight down) */}
      {pouring && (
        <div className="drops">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="drop" style={{ left: `${(i % 3) * 7 - 7}px`, animationDelay: `${0.18 + i * 0.09}s` }} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

/** Duolingo-style chunky progress bar with a shine stripe, plus milestone leaves. */
export function GrowMeter({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, (p) => (p <= 0 ? '0%' : `max(18px, ${p * 100}%)`))
  return (
    <div className="meter" aria-hidden>
      <motion.div className="meter-fill" style={{ width }}>
        <span className="meter-shine" />
      </motion.div>
      {[1 / 3, 2 / 3].map((m) => (
        <Milestone key={m} at={m} progress={progress} />
      ))}
      <svg className="meter-end" viewBox="-12 -12 24 24">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-6" rx="4.4" ry="6.2" transform={`rotate(${a})`} fill="#ff8cc6" stroke="#d93a86" strokeWidth="1" />
        ))}
        <circle r="3.6" fill="#ffd95a" stroke="#e09a1c" strokeWidth="1" />
      </svg>
    </div>
  )
}

function Milestone({ at, progress }: { at: number; progress: MotionValue<number> }) {
  const bg = useTransform(progress, (p): string => (p >= at ? '#f0ffe0' : '#3a433a'))
  const scale = useTransform(progress, (p): number => (p >= at ? 1.3 : 1))
  return <motion.span className="meter-notch" style={{ left: `${at * 100}%`, backgroundColor: bg, scale }} />
}

/** Little "watering can" glyph for the hold button. */
export const CanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 9h10l1 9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 18z" />
    <path d="M10 9a3 3 0 0 1 6 0" />
    <path d="M7.5 13 3 9.5" />
    <path d="M2 8.5l2 2" />
  </svg>
)
