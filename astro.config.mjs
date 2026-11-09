import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lemuelowusuansah.github.io',
  base: '/pitch-11',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
  vite: {
    optimizeDeps: {
      include: ['phaser'],
    },
  },
});
