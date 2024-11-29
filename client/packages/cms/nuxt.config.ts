export default defineNuxtConfig({
  extends: ['../base'],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [{ 'http-equiv': 'content-type', 'content': 'text/html;charset=UTF-8' }],
      link: [
        { rel: 'shortcut icon', href: '/favicon/favicon.ico', type: 'image/vnd.microsoft.icon' },
        { rel: 'icon', href: '/favicon/favicon.ico', type: 'image/vnd.microsoft.icon' },
      ],
    },
  },
  pages: true, 
  components: true,
  
});
