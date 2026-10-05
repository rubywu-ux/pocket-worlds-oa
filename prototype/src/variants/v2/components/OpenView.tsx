import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ITEMS, SENDER } from '../../../data'
import { haptic, sfx } from '../../shared/feedback'
import { Note } from './Note'
import { Blanket, BOX, TumbleItems } from './PicnicParts'
import { Button, CloseIcon, GiftIcon, IconButton, ReplayIcon, SproutIcon, Toast } from './ui'

type OpenViewProps = {
  skipped: boolean
  onReplay: () => void
  onClose: () => void
}

/**
 * Variation 2's opened state: the picnic, laid out. The emptied box is closed again (its formal state)
 * with the gifts resting beside it on the blanket; Irene's note and the replies below.
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
    const t = [window.setTimeout(() => sfx.thud(2), 200), window.setTimeout(() => haptic.tick(), 220)]
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
          <div
            className="gift-area gift-area--sm phero"
            role="button"
            tabIndex={0}
            aria-label="Replay the gift opening"
            onClick={onReplay}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onReplay()
              }
            }}
          >
            <Blanket className="blanket-wrap--sm" />
            <motion.div
              className="pbox"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            >
              <span className="pbox-shadow" />
              <img src={BOX.lid} className="box-img" alt="" draggable={false} />
            </motion.div>
            <TumbleItems size={0} instant />
          </div>
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 24 }}
          >
            A gift from {SENDER.name}!
          </motion.h1>
          <motion.p className="replay-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            Tap the picnic to open it again
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
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: [-14, 0, -4, 0], opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.25 + i * 0.1, ease: 'easeOut' }}
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
            <Button variant="secondary" icon={<SproutIcon />} onClick={() => show(`Walking over to ${SENDER.name}'s garden…`)}>
              Visit {SENDER.name}'s garden
            </Button>
          </motion.div>
        </div>
      </div>

      <Toast message={toast?.msg ?? null} id={toast?.id ?? 0} />
    </motion.section>
  )
}
