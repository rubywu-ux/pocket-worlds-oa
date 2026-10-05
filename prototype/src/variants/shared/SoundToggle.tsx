import { motion } from 'motion/react'
import { haptic, setMuted, sfx, useMuted } from './feedback'

/** Speaker button, top right. Sound is on by default (like Duolingo); the choice is remembered. */
export function SoundToggle() {
  const muted = useMuted()
  return (
    <motion.button
      type="button"
      className="sound-toggle"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={!muted}
      title={muted ? 'Sound off' : 'Sound on'}
      onClick={(e) => {
        e.stopPropagation()
        setMuted(!muted)
        haptic.light()
        if (muted) window.setTimeout(() => sfx.ding(), 30)
      }}
      onPointerDown={(e) => e.stopPropagation()}
      whileTap={{ scale: 0.88 }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
        {muted ? (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        ) : (
          <>
            <path d="M15.6 9.2a4 4 0 0 1 0 5.6" />
            <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
          </>
        )}
      </svg>
    </motion.button>
  )
}

/** "Skip" pill, top left, for flows where tapping is part of the interaction. */
export function SkipButton({ onSkip, label = 'Skip' }: { onSkip: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      className="skip-pill"
      onClick={(e) => {
        e.stopPropagation()
        sfx.tap()
        haptic.light()
        onSkip()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.4 }}
      whileTap={{ scale: 0.92 }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5l7 7-7 7M13 5l7 7-7 7" />
      </svg>
    </motion.button>
  )
}
