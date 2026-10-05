import { motion } from 'motion/react'
import { ITEMS, type GiftItem } from '../data'

/**
 * Where each gift sits inside the open box (percent of the gift area). The box's front wall
 * is drawn over their lower part, so they read as sitting in the box.
 */
const SPOTS: Record<string, { left: string; top: string; width: string }> = {
  boba: { left: '9%', top: '9%', width: '44%' },
  bouquet: { left: '44%', top: '3%', width: '49%' },
}

/** The gifts inside the open box. `instant`: already sitting there (final layout), no pop. */
export function GiftItems({ instant = false }: { instant?: boolean }) {
  return (
    <>
      {ITEMS.map((it, i) => (
        <PoppingItem key={it.id} item={it} index={i} instant={instant} />
      ))}
    </>
  )
}

/** Pops up from deep inside the box with a bouncy scale-in, then bobs gently so it stays the focus. */
function PoppingItem({ item, index, instant }: { item: GiftItem; index: number; instant: boolean }) {
  const spot = SPOTS[item.id]
  const delay = instant ? 0 : 0.45 + index * 0.18 // after the lid is off
  return (
    <motion.div
      className="rise"
      style={spot}
      initial={instant ? false : { y: '75%', scale: 0, opacity: 0 }}
      animate={{ y: '0%', scale: instant ? 1 : [0, 1.3, 0.9, 1.06, 1], opacity: 1 }}
      transition={{
        y: { type: 'spring', stiffness: 190, damping: 14, delay },
        scale: { duration: 0.8, times: [0, 0.42, 0.62, 0.8, 1], ease: 'easeOut', delay },
        opacity: { duration: 0.12, delay },
      }}
    >
      <div className="rise-glow" aria-hidden />
      <motion.div
        className="rise-art"
        animate={{ y: ['0%', '-5%', '0%'], rotate: index % 2 ? [0, 2, 0] : [0, -2, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.9 + index * 0.4 }}
      >
        <img src={item.img} alt={item.name} draggable={false} />
      </motion.div>
      <motion.span
        className="qty-badge"
        initial={instant ? false : { scale: 0 }}
        animate={{ scale: instant ? 1 : [0, 1.3, 1] }}
        transition={{ duration: 0.4, delay: delay + 0.55, ease: 'easeOut' }}
      >
        ×{item.qty}
      </motion.span>
    </motion.div>
  )
}
