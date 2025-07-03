import { defineConfig } from 'vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    qwikCity(),
    qwikVite(),
    tsconfigPaths(),
  ],
  build: {
    ssr: true,
    outDir: '.vercel/output/functions/_qwik-city.func',
    rollupOptions: {
      input: 'src/entry.vercel-edge.tsx',
      output: {
        format: 'es', 
        entryFileNames: 'entry.vercel-edge.mjs',
        
      },
    },
  },
});
