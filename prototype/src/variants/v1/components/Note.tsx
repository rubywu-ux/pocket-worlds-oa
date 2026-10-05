import { motion, type HTMLMotionProps } from 'motion/react'
import { ART, NOTE } from '../../../data'

/**
 * Irene's note, built to Ruby's Figma spec (355 × 119 frame) in container-query units,
 * so the same component scales from the reading view to the card under the gift.
 *
 * The note is split into three horizontal panels. When folded, panels 2 and 3 are
 * turned edge-on; unfolding swings each one down into place like a tri-folded letter.
 */
export type NoteFold = 'folded' | 'open'
export type StickerMode = 'none' | 'slap' | 'on'

const W = 355
const cq = (px: number) => `${(px / W) * 100}cqw`
const PANEL = 119 / 3
const LINES = [18, 34, 50, 66, 82, 98]

type NoteProps = { fold: NoteFold; sticker: StickerMode } & Omit<HTMLMotionProps<'div'>, 'children'>

export function Note({ fold, sticker, className = '', ...rest }: NoteProps) {
  const open = fold === 'open'
  return (
    <motion.div className={`note ${className}`} {...rest}>
      <div className="note-inner">
        <p className="sr-only">
          Note to {NOTE.to}: {NOTE.message} From {NOTE.from}.
        </p>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`note-panel note-panel--${i}`}
            aria-hidden
            style={{ top: cq(i * PANEL), height: cq(PANEL) }}
            initial={i === 0 || open ? false : { rotateX: -92 }}
            animate={{ rotateX: i === 0 || open ? 0 : -92 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18, delay: open ? (i === 1 ? 0.1 : 0.48) : 0 }}
          >
            <div className="note-face" style={{ top: cq(-i * PANEL) }}>
              <NoteFace />
            </div>
            {i > 0 && (
              <motion.div
                className="note-shade"
                initial={false}
                animate={{ opacity: open ? 0 : 0.6 }}
                transition={{ duration: 0.55, delay: i === 1 ? 0.1 : 0.48 }}
              />
            )}
          </motion.div>
        ))}
        {sticker !== 'none' && <Sticker slap={sticker === 'slap'} />}
      </div>
    </motion.div>
  )
}

function NoteFace() {
  return (
    <>
      <div className="note-grain" />
      {LINES.map((t) => (
        <div key={t} className="note-line" style={{ top: cq(t) }} />
      ))}
      <p className="note-to">To: {NOTE.to}</p>
      <p className="note-msg">{NOTE.message}</p>
      <p className="note-from">- {NOTE.from}</p>
    </>
  )
}

/** The +1 sticker Irene chose. It slaps onto the note, then rocks gently: "I'm here!" */
export function Sticker({ slap, className = '' }: { slap: boolean; className?: string }) {
  return (
    <motion.div
      className={`sticker ${className}`}
      initial={slap ? { scale: 2.4, rotate: -28, opacity: 0, y: '-35%' } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1, y: '0%' }}
      transition={{ type: 'spring', stiffness: 430, damping: 14, delay: slap ? 0.15 : 0 }}
    >
      <img
        src={ART.sticker}
        alt=""
        draggable={false}
        className="sticker-rock"
        style={slap ? { animationDelay: '0.8s' } : undefined}
      />
    </motion.div>
  )
}
