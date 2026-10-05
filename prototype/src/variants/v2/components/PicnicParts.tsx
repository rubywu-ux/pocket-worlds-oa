import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import picnicSky from '../../../assets/picnic-sky.webp'
import { ART, ITEMS, type GiftItem } from '../../../data'

/**
 * The Picnic Gift Shop banner, reused as the scene's sky: same art, same elliptical bottom edge,
 * same dark fade and big Passion One title sitting on it.
 */
export function PicnicBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="pbanner">
      <img src={picnicSky} alt="" draggable={false} />
      <div className="pbanner-shade" />
      <div className="pbanner-copy">{children}</div>
    </div>
  )
}

/** A gingham picnic blanket laid out in perspective under the gift. */
export function Blanket({ className = '' }: { className?: string }) {
  return (
    <div className={`blanket-wrap ${className}`} aria-hidden>
      <div className="blanket" />
    </div>
  )
}

/** Where each gift lands on the blanket, beside the box (percent of the gift area). */
export const LANDING: Record<string, { left: number; top: number; width: number; badge: { left: string; top: string }; spin: number }> = {
  boba: { left: -28, top: 50, width: 36, badge: { left: '62%', top: '6%' }, spin: -1 },
  bouquet: { left: 85, top: 44, width: 40, badge: { left: '64%', top: '2%' }, spin: 1 },
}

/** The heart box, drawn as layers so the lid can fly off and the gifts can tumble out. */
export const BOX = { lid: ART.giftBox, base: ART.boxBase, front: ART.boxFront }

/** One gift that's launched out of the box, arcs through the air and lands on the blanket with a bounce. */
export function TumbleItem({ item, index, size, instant = false }: { item: GiftItem; index: number; size: number; instant?: boolean }) {
  const spot = LANDING[item.id]
  // start: inside the box opening (gift area 50%, 40%), measured from the landing spot's center
  const cx = ((spot.left + spot.width / 2) / 100) * size
  const cy = ((spot.top + spot.width / 2) / 100) * size
  const x0 = size * 0.5 - cx
  const y0 = size * 0.4 - cy
  const peak = y0 - size * 0.7
  const delay = 0.12 + index * 0.14
  const t = { duration: 1.05, delay, times: [0, 0.4, 0.72, 0.84, 1] }
  return (
    <div className="tumble" style={{ left: `${spot.left}%`, top: `${spot.top}%`, width: `${spot.width}%` }}>
      <motion.span
        className="tumble-shadow"
        initial={instant ? false : { opacity: 0, scaleX: 0.3 }}
        animate={{ opacity: 0.55, scaleX: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.45 }}
      />
      <motion.div
        className="tumble-body"
        initial={instant ? false : { x: x0, y: y0, scale: 0.35, rotate: 0 }}
        animate={
          instant
            ? { x: 0, y: 0, scale: 1, rotate: 0 }
            : {
                x: [x0, x0 * 0.35, 0, 0, 0],
                y: [y0, peak, 0, -size * 0.06, 0],
                scale: [0.35, 1.05, 1, 1, 1],
                rotate: [0, 200 * spot.spin, 360 * spot.spin, 360 * spot.spin, 360 * spot.spin],
              }
        }
        transition={
          instant
            ? { duration: 0 }
            : {
                x: { ...t, ease: 'linear' },
                y: { ...t, ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'] },
                scale: { ...t },
                rotate: { ...t, ease: 'easeOut' },
              }
        }
      >
        <motion.img
          src={item.img}
          alt={item.name}
          draggable={false}
          className="tumble-art"
          initial={false}
          animate={instant ? {} : { scaleX: [1, 1, 1, 1.18, 0.95, 1], scaleY: [1, 1, 1, 0.8, 1.06, 1] }}
          transition={{ duration: 1.05, delay, times: [0, 0.5, 0.71, 0.76, 0.9, 1] }}
          style={{ originY: 1 }}
        />
        <motion.span
          className="qty-badge"
          style={spot.badge}
          initial={instant ? false : { scale: 0 }}
          animate={{ scale: instant ? 1 : [0, 1.3, 1] }}
          transition={{ duration: 0.4, delay: instant ? 0 : delay + 1.05, ease: 'easeOut' }}
        >
          ×{item.qty}
        </motion.span>
      </motion.div>
    </div>
  )
}

/** The gifts, landed on the blanket either side of the box. */
export function TumbleItems({ size, instant = false }: { size: number; instant?: boolean }) {
  return (
    <>
      {ITEMS.map((it, i) => (
        <TumbleItem key={it.id} item={it} index={i} size={size} instant={instant} />
      ))}
    </>
  )
}

/** Drag-hand glyph for the hint line. */
export const DragIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10" />
    <path d="M12 9.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M15 10.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.7-2.3L4 15.2a1.6 1.6 0 0 1 2.4-2.1L9 15.5" />
  </svg>
)
