// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'assets',
    format: 'preserve'
  },
  cacheDir: '.tmp/astro-cache',
  integrations: [icon(), mdx(), sitemap()],
  output: 'static',
  outDir: './tmp/bin/dist',
  site: 'https://www.mcartoixa.me',
  trailingSlash: 'never',
  vite: { plugins: [tailwindcss()], },
});
