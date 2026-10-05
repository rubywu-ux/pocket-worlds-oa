import { useMemo, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ART, ITEMS, NOTE, SENDER } from '../../../data'

/** The three reward cards: the two gifts, then Irene's note. */
export type CardDef = { id: string; kind: 'item' | 'note'; name: string; img?: string; tab: string; qty: number }
export const CARDS: CardDef[] = [
  ...ITEMS.map((it) => ({ id: it.id, kind: 'item' as const, name: it.name, img: it.img, tab: `×${it.qty}`, qty: it.qty })),
  { id: 'note', kind: 'note', name: `Note from ${SENDER.name}`, tab: 'Read', qty: 0 },
]

/**
 * Highrise's Offer Cell, from the Picnic Gift Shop: a dark display card (32 / 24 radius) with the
 * item art and a muted name, sitting on a "cost" tab. Here the tab carries the quantity (or "Read").
 */
export function OfferCell({ art, name, tab, tabClass = '', className = '' }: { art: ReactNode; name: string; tab: ReactNode; tabClass?: string; className?: string }) {
  return (
    <div className={`offer ${className}`}>
      <div className="offer-display">
        <div className="offer-art">{art}</div>
        <p className="offer-name">{name}</p>
      </div>
      <div className={`offer-tab ${tabClass}`}>{tab}</div>
    </div>
  )
}

/** Face-down card back: Garden Together green with a lime gift emblem. */
export function CardBack() {
  return (
    <div className="card-back">
      <span className="card-back-shine" />
      <span className="card-back-emblem">
        <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="9" width="17" height="11" rx="2" />
          <path d="M2.5 9h19M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
        </svg>
      </span>
    </div>
  )
}

/** A tiny version of Irene's note for the note card's thumbnail. */
export function MiniNote() {
  return (
    <div className="mini-note" aria-hidden>
      <span className="mini-note-to">To: {NOTE.to}</span>
      {[0, 1, 2].map((i) => (
        <span key={i} className="mini-note-line" style={{ top: `${44 + i * 16}%`, width: i === 2 ? '46%' : '78%' }} />
      ))}
      <img src={ART.sticker} alt="" className="mini-note-sticker" draggable={false} />
    </div>
  )
}

/** Garden storage basket (where collected gifts go). */
export const BasketIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden>
    <path d="M9 13c0-4 3-7 7-7s7 3 7 7" fill="none" stroke="#c98a4a" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M4 13h24l-2.4 12.2A3 3 0 0 1 22.7 28H9.3a3 3 0 0 1-2.9-2.8z" fill="#e0a565" stroke="#9c5f25" strokeWidth="1.6" />
    <path d="M8 17.5h16M9 22h14" stroke="#9c5f25" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <rect x="3" y="11.5" width="26" height="4" rx="2" fill="#f0bf86" stroke="#9c5f25" strokeWidth="1.4" />
  </svg>
)

type Bit = { kind: 'heart' | 'spark' | 'petal' | 'dot'; color: string; dx: number; dy: number; fall: number; rot: number; s: number; dur: number; delay: number }
const KINDS: Bit['kind'][] = ['heart', 'spark', 'petal', 'dot', 'heart', 'spark', 'petal', 'spark']
const COLORS: Record<Bit['kind'], string[]> = {
  heart: ['#ff5fa8', '#ff8cc6', '#f0559f'],
  spark: ['#ffe27a', '#fff3c4', '#ffd95a'],
  petal: ['#ffd0e6', '#ffffff', '#ffb0d6'],
  dot: ['#70e51d', '#b9f291', '#7cc8ff'],
}

/** Confetti in the Picnic banner's motifs (hearts, four-point sparkles, petals), with gravity. */
export function Confetti({ size, count = 56 }: { size: number; count?: number }) {
  const bits = useMemo<Bit[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const kind = KINDS[i % KINDS.length]
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
        const dist = size * (0.55 + Math.random() * 0.85)
        const colors = COLORS[kind]
        return {
          kind,
          color: colors[i % colors.length],
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist * 0.75 - size * 0.35,
          fall: size * (0.5 + Math.random() * 0.6),
          rot: (Math.random() - 0.5) * 720,
          s: 0.6 + Math.random() * 0.9,
          dur: 1.3 + Math.random() * 0.8,
          delay: Math.random() * 0.08,
        }
      }),
    [size, count],
  )
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => {
        const t = { duration: b.dur, delay: b.delay }
        return (
          <motion.span
            key={i}
            className={`cf cf--${b.kind}`}
            style={{ background: b.color }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{ x: [0, b.dx, b.dx * 1.1], y: [0, b.dy, b.dy + b.fall], scale: [0, b.s, b.s * 0.8], opacity: [1, 1, 0], rotate: b.rot }}
            transition={{
              x: { ...t, times: [0, 0.35, 1], ease: [0.1, 0.9, 0.3, 1] },
              y: { ...t, times: [0, 0.35, 1], ease: ['easeOut', 'easeIn'] },
              scale: { ...t, times: [0, 0.2, 1] },
              opacity: { ...t, times: [0, 0.75, 1] },
              rotate: { ...t, ease: 'easeOut' },
            }}
          />
        )
      })}
    </div>
  )
}
