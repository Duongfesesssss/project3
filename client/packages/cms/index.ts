// client/packages/cms/index.ts
import { defineNuxtModule, addComponent, extendPages } from 'nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'cms-module',
    configKey: 'cms'
  },
  setup(_, nuxt) {
    // Thêm các route cho CMS
    extendPages((pages) => {
      pages.push({
        name: 'cms-home',
        path: '/cms',
        file: '~/packages/cms/pages/index.vue',
      });
    });

    // Đăng ký các component CMS (nếu cần)
    nuxt.options.components = true;
  },
});
