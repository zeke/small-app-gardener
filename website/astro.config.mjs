// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeke.github.io',
  base: process.env.NODE_ENV === 'development' ? '/' : '/small-app-gardener',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [icon()]
});
