import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/passion-one/400.css'
import '@fontsource-variable/parkinsans/index.css'
import App from './App'
import { ALL_ART } from './data'
import './styles.css'

// Warm the cache so items and the sticker don't pop in mid-animation.
for (const src of ALL_ART) {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
