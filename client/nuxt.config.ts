// client/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config';
import path from 'path';

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-07-17',
  extends: ['packages/main', 'packages/cms'],
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
  pages:true,
});
