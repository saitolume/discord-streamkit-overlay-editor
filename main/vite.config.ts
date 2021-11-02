import { builtinModules } from 'module'
import path from 'path'
import { defineConfig } from 'vite'

const PACKAGE_ROOT = __dirname

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.MODE,
  root: path.resolve(PACKAGE_ROOT, 'src'),
  build: {
    emptyOutDir: true,
    outDir: path.resolve('dist/main'),
    lib: {
      entry: path.resolve(PACKAGE_ROOT, 'src/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', ...builtinModules],
      input: [
        path.resolve(PACKAGE_ROOT, 'src/index.ts'),
        path.resolve(PACKAGE_ROOT, 'src/preload.ts'),
      ],
      output: {
        entryFileNames: () => '[name].cjs',
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(PACKAGE_ROOT, 'src'),
    },
  },
})
