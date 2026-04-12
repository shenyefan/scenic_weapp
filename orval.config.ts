import { defineConfig } from 'orval'

export default defineConfig({
  scenic: {
    input: {
      target: 'http://localhost:8080/api/v3/api-docs/controller',
    },
    output: {
      mode: 'tags-split',
      target: './miniprogram/api/controller',
      schemas: './miniprogram/api/models',
      clean: true,
      override: {
        mutator: {
          path: './miniprogram/api/mutator.ts',
          name: 'mutator',
        },
      },
    },
  },
})

