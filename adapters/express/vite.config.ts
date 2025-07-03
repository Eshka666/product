import { defineConfig } from 'vite';
import baseConfig from '../../vite.config';

export default defineConfig(async () => {
  const base = await baseConfig({ command: 'build', mode: 'production' });

  return {
    ...base,
    build: {
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: 'src/entry.express.tsx',
      },
    },
  };
});