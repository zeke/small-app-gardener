// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // Custom domain deploys at the origin root.
  site: process.env.NODE_ENV === 'development' ? 'http://localhost:4321' : 'https://gardener.ziki.boo',
  base: '/',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [icon()]
});
