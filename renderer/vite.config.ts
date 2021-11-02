import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const PACKAGE_ROOT = __dirname

export default defineConfig({
  root: path.resolve(PACKAGE_ROOT, 'src'),
  base: './',
  build: {
    emptyOutDir: true,
    outDir: path.resolve('dist/renderer'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(PACKAGE_ROOT, 'src'),
    },
  },
})
