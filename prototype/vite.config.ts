import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages (/pocket-worlds-oa/) and locally.
// Pages: the main prototype at /, plus the exploration variations at /v1/ … /v4/.
// (Input paths are relative to this folder; run builds from prototype/.)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        v1: 'v1/index.html',
        v2: 'v2/index.html',
        v3: 'v3/index.html',
        v4: 'v4/index.html',
      },
    },
  },
})
