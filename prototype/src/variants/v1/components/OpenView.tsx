import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ITEMS, SENDER } from '../../../data'
import { haptic, sfx } from '../../shared/feedback'
import { Gift } from './Gift'
import { GiftItems } from './GiftItems'
import { Soil } from './GrowParts'
import { Note } from './Note'
import { Button, CloseIcon, GiftIcon, IconButton, ReplayIcon, SproutIcon, Toast } from './ui'

type OpenViewProps = {
  /** True when Sage skipped: the box blooms open quickly instead of appearing already open. */
  skipped: boolean
  onReplay: () => void
  onClose: () => void
}

/**
 * Variation 1's opened state: the gift stays planted and in bloom (it grew, so it stays grown),
 * with what's inside, Irene's note and ways to reply.
 */
export function OpenView({ skipped, onReplay, onClose }: OpenViewProps) {
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = (msg: string) => {
    window.clearTimeout(timer.current)
    setToast({ msg, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), 2800)
  }
  useEffect(() => {
    const t = [
      window.setTimeout(() => sfx.pop(2), 260),
      window.setTimeout(() => sfx.pop(4), 360),
      window.setTimeout(() => haptic.tick(), 300),
    ]
    if (skipped) t.push(window.setTimeout(() => sfx.ding(), 80))
    return () => {
      t.forEach(clearTimeout)
      window.clearTimeout(timer.current)
    }
  }, [skipped])

  return (
    <motion.section
      className="view open-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35 }}
    >
      <header className="topbar">
        <IconButton label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <IconButton label="Replay the opening" onClick={onReplay}>
          <ReplayIcon />
        </IconButton>
      </header>

      <div className="open-layout">
        <div className="open-hero">
          <div className="gift-area gift-area--sm">
            <Soil />
            <Gift layoutId="gift" mode="open" enterFromClosed={skipped} onActivate={onReplay} label="Water the gift again">
              <GiftItems instant={!skipped} />
            </Gift>
          </div>
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 24 }}
          >
            A gift from {SENDER.name}!
          </motion.h1>
          <motion.p
            className="planted-chip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <SproutIcon /> Planted in your garden
          </motion.p>
        </div>

        <div className="open-details">
          <motion.h2 className="section-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            in your gift
          </motion.h2>
          <ul className="item-list">
            {ITEMS.map((it, i) => (
              <li key={it.id} className="item-row">
                <motion.div
                  className="item-row-art"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 0.92, 1] }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.1, ease: 'easeOut' }}
                >
                  <img src={it.img} alt="" draggable={false} />
                </motion.div>
                <motion.div
                  className="item-row-text"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.08 }}
                >
                  <span className="item-row-name">{it.name}</span>
                  <span className="item-row-sub">Ready to place in your garden</span>
                </motion.div>
                <motion.span
                  className="qty"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 500, damping: 20 }}
                  aria-label={`quantity ${it.qty}`}
                >
                  ×{it.qty}
                </motion.span>
              </li>
            ))}
          </ul>

          <Note layoutId="note" className="note--card" fold="open" sticker={skipped ? 'slap' : 'on'} />

          <motion.div
            className="actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 26 }}
          >
            <Button icon={<GiftIcon />} onClick={() => show(`Opening the Picnic Gift Shop with ${SENDER.name} as your recipient`)}>
              Send a gift back
            </Button>
          </motion.div>
        </div>
      </div>

      <Toast message={toast?.msg ?? null} id={toast?.id ?? 0} />
    </motion.section>
  )
}
