import { motion } from 'motion/react'
import { SENDER } from '../data'
import { Gift } from './Gift'
import { Button } from './ui'

/** What Sage sees after closing: the gift is tucked into the garden. Lets reviewers start over. */
export function ClosedView({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.section
      className="view closed-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div className="closed-inner">
        <div className="gift-area gift-area--xs">
          <Gift layoutId="gift" mode="closed" closeInstantly />
        </div>
        <h1 className="title title--sm">All caught up!</h1>
        <p className="closed-copy">{SENDER.name}'s gift is waiting in your garden.</p>
      </div>
      <div className="bottom">
        <div className="bottom-inner">
          <Button onClick={onRestart}>Replay the prototype</Button>
        </div>
      </div>
    </motion.section>
  )
}
