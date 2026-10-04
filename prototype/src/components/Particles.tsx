import { useMemo } from 'react'
import { motion } from 'motion/react'

type Kind = 'petal' | 'leaf' | 'spark' | 'dot'
const KINDS: Kind[] = ['petal', 'spark', 'leaf', 'petal', 'dot', 'spark', 'petal', 'leaf']
const BASE: Record<Kind, [number, number]> = { petal: [11, 16], leaf: [10, 15], spark: [16, 16], dot: [6, 6] }

/** A one-shot burst of petals, leaves and sparkles from the center of the gift. */
export function Burst({ size, count = 38 }: { size: number; count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const kind = KINDS[i % KINDS.length]
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.55
        const dist = size * (0.5 + Math.random() * 0.75)
        const s = 0.7 + Math.random() * 0.8
        return {
          kind,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist * 0.8 - size * 0.15,
          fall: size * (0.18 + Math.random() * 0.3),
          rot: (Math.random() - 0.5) * 600,
          w: BASE[kind][0] * s,
          h: BASE[kind][1] * s,
          dur: 1.15 + Math.random() * 0.75,
          delay: Math.random() * 0.12,
        }
      }),
    [size, count],
  )

  return (
    <div className="burst" aria-hidden>
      {bits.map((b, i) => {
        const base = { duration: b.dur, delay: b.delay }
        const fly = { ...base, times: [0, 0.42, 1], ease: [0.12, 0.85, 0.3, 1] as const }
        return (
          <motion.span
            key={i}
            className={`bit bit--${b.kind}`}
            style={{ width: b.w, height: b.h, marginLeft: -b.w / 2, marginTop: -b.h / 2 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{
              x: [0, b.dx, b.dx * 1.06],
              y: [0, b.dy, b.dy + b.fall],
              opacity: [0, 1, 1, 0],
              scale: [0.2, 1, 1, 0.6],
              rotate: [0, b.rot],
            }}
            transition={{
              x: fly,
              y: fly,
              rotate: { ...base, ease: 'easeOut' },
              opacity: { ...base, times: [0, 0.08, 0.72, 1] },
              scale: { ...base, times: [0, 0.15, 0.75, 1] },
            }}
          />
        )
      })}
    </div>
  )
}

const TWINKLES = [
  { x: -6, y: 18, s: 18, d: 0 },
  { x: 104, y: 30, s: 14, d: 0.9 },
  { x: 96, y: 88, s: 11, d: 1.7 },
  { x: 2, y: 78, s: 12, d: 2.3 },
  { x: 62, y: -8, s: 10, d: 1.3 },
]

/** Soft sparkles around the unopened gift, so it reads as "something special, tap me". */
export function Twinkles() {
  return (
    <div className="twinkles" aria-hidden>
      {TWINKLES.map((t, i) => (
        <motion.span
          key={i}
          className="bit bit--spark twinkle"
          style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.s, height: t.s }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], rotate: [0, 90] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, delay: t.d, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
