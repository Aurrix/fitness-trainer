import { resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

function fitnessTrainerPwa(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'fitness-trainer-pwa',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    async closeBundle() {
      const { generateSW } = await import('workbox-build')
      const outDir = resolve(config.root, config.build.outDir)

      await generateSW({
        globDirectory: outDir,
        globPatterns: ['**/*.{css,html,ico,js,json,png,svg,webmanifest}'],
        // The library art assets exceed Workbox's 2 MiB default precache cap.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        swDest: resolve(outDir, 'sw.js'),
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    fitnessTrainerPwa(),
  ],
})
