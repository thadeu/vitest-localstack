import { defineConfig } from 'vitest/config'

export default ({ mode }) => {
  return defineConfig({
    test: {
      globalSetup: ['./vite.setup.ts'],
    },
  })
}
