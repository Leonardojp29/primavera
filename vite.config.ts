import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/postprocessing') || id.includes('@react-three/postprocessing')) return 'postfx'
          if (id.includes('@react-three/') || id.includes('node_modules/zustand') || id.includes('node_modules/gsap')) return 'r3f'
          return undefined
        },
      },
    },
  },
})
