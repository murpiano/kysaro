const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    testTimeout: 5000,
    coverage:{
      provider:'v8',
      reporter:['text', 'html'],
      reportsDirectory:'./coverage'
    }
  }
})
