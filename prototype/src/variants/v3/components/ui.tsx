import type { ReactNode, MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type ButtonProps = {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary'
  icon?: ReactNode
}

export function Button({ children, onClick, variant = 'primary', icon }: ButtonProps) {
  return (
    <motion.button
      type="button"
      className={`btn btn--${variant}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  )
}

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      className="icon-btn"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.button>
  )
}

export function Toast({ message, id }: { message: string | null; id: number }) {
  return (
    <div className="toast-slot" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {message && (
          <motion.div
            key={id}
            className="toast"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <LeafIcon />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Icons: simple strokes in the same weight as the Figma back/close glyphs */
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...stroke}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ReplayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...stroke}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)

export const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
    <rect x="3.5" y="9" width="17" height="11" rx="2" />
    <path d="M2.5 9h19M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
  </svg>
)

export const SproutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...stroke}>
    <path d="M12 21v-9" />
    <path d="M12 12c0-4 3-6.5 7.5-6.5C19.5 10 16.5 12 12 12z" />
    <path d="M12 14.5C12 11 9.5 9 5 9c0 4 2.5 5.5 7 5.5z" />
  </svg>
)

const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path d="M5 19C5 10 11 5 20 4c0 9-5 15-14 15z" fill="#70e51d" />
    <path d="M5 19c3-4 6-7 10-10" stroke="#151915" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
)
