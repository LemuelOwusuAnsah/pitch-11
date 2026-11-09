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
    define: {
      'typeof CANVAS_RENDERER': JSON.stringify('boolean'),
      'typeof WEBGL_RENDERER': JSON.stringify('boolean'),
    },
    optimizeDeps: {
      include: ['phaser'],
    },
  },
});
