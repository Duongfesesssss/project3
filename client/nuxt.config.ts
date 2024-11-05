// client/nuxt.config.ts
import path from 'path';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  extends: ['packages/main', 'packages/cms'],
  devtools: { enabled: true },
  compatibilityDate: '2024-07-17',
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'main-home',
        path: '/',
        file: path.resolve(__dirname, 'packages/main/pages/index.vue'),
      });
      pages.push({
        name: 'cms-home',
        path: '/cms',
        file: path.resolve(__dirname, 'packages/cms/pages/index.vue'),
      });
    },
  },
});
