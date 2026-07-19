// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Кастомный домен (public/CNAME) → сайт живёт в корне, base не нужен.
export default defineConfig({
  site: 'https://leranikita.ru',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
