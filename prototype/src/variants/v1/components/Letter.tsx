import { motion, type HTMLMotionProps } from 'motion/react'
import { RECIPIENT, SENDER } from '../../../data'
import { Sticker } from './Note'

/**
 * The letter that slips out of the envelope: Ruby's "from / sending to" card
 * (Checkout frame, 355 × 189) in container-query units so it scales cleanly.
 */
export function Letter({ className = '', withSticker = false, ...rest }: Omit<HTMLMotionProps<'div'>, 'children'> & { withSticker?: boolean }) {
  return (
    <motion.div className={`letter ${className}`} {...rest}>
      <div className="letter-inner">
        <img className="letter-avatar" src={SENDER.avatar} alt="" draggable={false} />
        <p className="letter-label letter-label--from">from:</p>
        <p className="letter-name letter-name--from">{SENDER.name}</p>
        <p className="letter-label letter-label--to">sending to:</p>
        <p className="letter-name letter-name--to">{RECIPIENT.name}</p>
        <div className="letter-line" />
        <svg className="letter-heart" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M7 3C4.239 3 2 5.216 2 7.95c0 2.207.875 7.445 9.488 12.74a.985.985 0 0 0 1.024 0C21.125 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3s-5 3-5 3s-2.239-3-5-3Z"
            fill="#f0679a"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        {withSticker && <Sticker slap={false} className="sticker--letter" />}
      </div>
    </motion.div>
  )
}
