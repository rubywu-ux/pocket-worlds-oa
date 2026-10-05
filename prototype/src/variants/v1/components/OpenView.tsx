import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ITEMS, SENDER } from '../../../data'
import { Gift } from './Gift'
import { GiftItems } from './GiftItems'
import { Note } from './Note'
import { Button, CloseIcon, GiftIcon, IconButton, ReplayIcon, SproutIcon, Toast } from './ui'

type OpenViewProps = {
  /** True when Sage skipped the animation: the box still pops open, just quickly. */
  skipped: boolean
  onReplay: () => void
  onClose: () => void
}

/** The opened gift: what's inside, Irene's note (with its sticker), and ways to reply. */
export function OpenView({ skipped, onReplay, onClose }: OpenViewProps) {
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  // The gift arrives open (gifts inside), then goes back to its closed, formal state. After a skip it's already closed.
  const [closed, setClosed] = useState(skipped)
  useEffect(() => {
    if (skipped) return
    const t = window.setTimeout(() => setClosed(true), 1000)
    return () => window.clearTimeout(t)
  }, [skipped])
  const timer = useRef<number | undefined>(undefined)

  const show = (msg: string) => {
    window.clearTimeout(timer.current)
    setToast({ msg, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), 2800)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

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
            <Gift
              layoutId="gift"
              mode={closed ? 'closed' : 'open'}
              closeInstantly={skipped}
              onActivate={onReplay}
              label="Replay the gift opening"
            >
              {!closed && <GiftItems instant />}
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
          <motion.p className="replay-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            Tap the gift to open it again
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

