// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import mdx from '@astrojs/mdx';
import robots from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'assets',
    format: 'preserve'
  },
  cacheDir: '.tmp/astro-cache',
  integrations: [icon(), mdx(), robots(), sitemap()],
  output: 'static',
  outDir: './tmp/bin/dist',
  site: 'https://www.mcartoixa.me',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss(), yaml()],
    server: {
      watch: {
        ignored: ['**/.tmp/**/*', '**/tmp/**/*']
      }
    }
  }
});
