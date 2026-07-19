// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Кастомный домен (public/CNAME) → сайт живёт в корне, base не нужен.
export default defineConfig({
  site: 'https://leranikita.ru',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  // Tailwind 4 подключается vite-плагином: ни tailwind.config.js,
  // ни postcss.config.js не нужны — тема живёт в src/styles/theme.css.
  vite: { plugins: [tailwindcss()] },
});
