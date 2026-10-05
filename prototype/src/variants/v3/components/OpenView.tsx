import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ART, ITEMS, SENDER } from '../../../data'
import { haptic, sfx } from '../../shared/feedback'
import { Note } from './Note'
import { OfferCell } from './RewardParts'
import { Button, CloseIcon, GiftIcon, IconButton, ReplayIcon, SproutIcon, Toast } from './ui'

type OpenViewProps = {
  skipped: boolean
  onReplay: () => void
  onClose: () => void
}

type Reaction = { id: string; label: string; icon: ReactNode }
const REACTIONS: Reaction[] = [
  {
    id: 'love',
    label: 'Love it!',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M7 3C4.239 3 2 5.216 2 7.95c0 2.207.875 7.445 9.488 12.74a.985.985 0 0 0 1.024 0C21.125 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3s-5 3-5 3s-2.239-3-5-3Z"
          fill="#ff5fa8"
          stroke="#fff"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    id: 'thanks',
    label: 'Thank you!',
    icon: (
      <svg viewBox="-12 -12 24 24" aria-hidden>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-6" rx="4.6" ry="6.4" transform={`rotate(${a})`} fill="#ffe486" stroke="#e3a524" strokeWidth="1" />
        ))}
        <circle r="3.8" fill="#ff8cc6" stroke="#d93a86" strokeWidth="1" />
      </svg>
    ),
  },
  { id: 'yum', label: 'Yum!', icon: <img src={ART.sticker} alt="" draggable={false} /> },
]

/**
 * Variation 3's opened state. The gifts are already in storage, so this screen is about Irene:
 * her note, and a one-tap way to say thanks (a sticker reaction that flies to her), plus the replies.
 */
export function OpenView({ skipped, onReplay, onClose }: OpenViewProps) {
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const [sent, setSent] = useState<string[]>([])
  const [flights, setFlights] = useState<{ key: number; r: Reaction; from: DOMRect; to: DOMRect }[]>([])
  const [bump, setBump] = useState(0)
  const avatarRef = useRef<HTMLImageElement | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = (msg: string) => {
    window.clearTimeout(timer.current)
    setToast({ msg, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), 2800)
  }
  useEffect(() => {
    const t: number[] = []
    if (skipped) t.push(window.setTimeout(() => sfx.ding(), 80))
    return () => {
      t.forEach(clearTimeout)
      window.clearTimeout(timer.current)
    }
  }, [skipped])

  const react = (r: Reaction, btn: HTMLElement) => {
    const to = avatarRef.current?.getBoundingClientRect()
    if (!to) return
    sfx.pop(4)
    haptic.light()
    setFlights((f) => [...f, { key: Date.now() + Math.random(), r, from: btn.getBoundingClientRect(), to }])
    window.setTimeout(() => {
      setBump((b) => b + 1)
      setSent((s) => (s.includes(r.id) ? s : [...s, r.id]))
      sfx.ding()
      haptic.success()
      show(`Sent “${r.label}” to ${SENDER.name}`)
    }, 560)
  }

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
          <motion.div
            className="rhero"
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <OfferCell
              className="offer--gift"
              art={<img src={ART.giftBox} alt="" draggable={false} />}
              name="A gift for Sage"
              tab={
                <>
                  <img src={SENDER.avatar} alt="" className="offer-tab-avatar" /> {SENDER.name}
                </>
              }
            />
            <motion.span
              className="collected"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 500, damping: 14 }}
            >
              ✓ Collected
            </motion.span>
          </motion.div>
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 24 }}
          >
            A gift from {SENDER.name}!
          </motion.h1>
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
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                >
                  <img src={it.img} alt="" draggable={false} />
                </motion.div>
                <div className="item-row-text">
                  <span className="item-row-name">{it.name}</span>
                  <span className="item-row-sub">Ready to place in your garden</span>
                </div>
                <span className="qty" aria-label={`quantity ${it.qty}`}>
                  ×{it.qty}
                </span>
              </li>
            ))}
          </ul>

          <Note layoutId="note" className="note--card" fold="open" sticker="on" />

          {/* Say thanks: one-tap sticker reactions that fly to Irene */}
          <motion.div className="thanks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.img
              key={bump}
              ref={avatarRef}
              src={SENDER.avatar}
              alt=""
              className="thanks-avatar"
              initial={{ scale: bump ? 1.3 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 10 }}
            />
            <div className="thanks-copy">
              <span className="thanks-title">Say thanks</span>
              <span className="thanks-sub">{sent.length ? `${SENDER.name} will see your reaction` : `Send ${SENDER.name} a sticker`}</span>
            </div>
            <div className="thanks-btns">
              {REACTIONS.map((r) => (
                <motion.button
                  key={r.id}
                  type="button"
                  className={`react${sent.includes(r.id) ? ' react--sent' : ''}`}
                  aria-label={`Send “${r.label}” to ${SENDER.name}`}
                  title={r.label}
                  onClick={(e) => {
                    e.stopPropagation()
                    react(r, e.currentTarget)
                  }}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ y: -2 }}
                >
                  {r.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>

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

      {/* reactions in flight */}
      <AnimatePresence>
        {flights.map((f) => (
          <motion.span
            key={f.key}
            className="react-fly"
            style={{ left: f.from.left, top: f.from.top, width: f.from.width, height: f.from.height }}
            initial={{ x: 0, y: 0, scale: 1 }}
            animate={{
              x: [0, (f.to.left - f.from.left) * 0.5, f.to.left + f.to.width / 2 - (f.from.left + f.from.width / 2)],
              y: [0, -60, f.to.top + f.to.height / 2 - (f.from.top + f.from.height / 2)],
              scale: [1, 1.5, 0.4],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.56, ease: 'easeInOut' }}
            onAnimationComplete={() => setFlights((all) => all.filter((x) => x.key !== f.key))}
          >
            {f.r.icon}
          </motion.span>
        ))}
      </AnimatePresence>

      <Toast message={toast?.msg ?? null} id={toast?.id ?? 0} />
    </motion.section>
  )
}
