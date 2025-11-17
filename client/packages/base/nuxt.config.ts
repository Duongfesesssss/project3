import Aura from '@primevue/themes/aura';
import { defaultOptions } from 'primevue/config';
import path from 'path';

const DEFAULT_LOCAL_API = 'http://localhost:8888';
const sanitizeUrl = (url?: string) => (url ? url.replace(/\/$/, '') : undefined);
const configuredApiBase = sanitizeUrl(process.env.NUXT_PUBLIC_API_BASE) || sanitizeUrl(process.env.API_BASE_URL);
const runtimeApiBase = configuredApiBase || sanitizeUrl(DEFAULT_LOCAL_API)!;
const runtimeBaseUrl = sanitizeUrl(process.env.NUXT_PUBLIC_BASE_URL) || runtimeApiBase;
const authBaseUrl = sanitizeUrl(process.env.NUXT_PUBLIC_AUTH_BASE) || `${runtimeApiBase}/api/auth`;

export default defineNuxtConfig({
  plugins: [
    '~/packages/base/plugins/fetch-base.client.ts'
  ],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { 'http-equiv': 'content-type', 'content': 'text/html;charset=UTF-8' },
      ],
      link: [
        {
          rel: 'shortcut icon',
          href: '/favicon/favicon.ico',
          type: 'image/vnd.microsoft.icon',
        },
        {
          rel: 'icon',
          href: '/favicon/favicon.ico',
          type: 'image/vnd.microsoft.icon',
        },
      ],
    },
  },
  css: [path.resolve(__dirname, 'assets/styles/global.css'), 'primeicons/primeicons.css'],
  modules: [
    '@primevue/nuxt-module',
    '@nuxt/eslint',
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],
  colorMode: {
    preference: 'light',
    fallback: 'light',   
    classSuffix: ''     
  },
primevue: {
  options: {
    theme: {
      preset: Aura,
    },
    ripple: true,
    locale: defaultOptions.locale as any,
  },
  autoImport: true,
  components: {
    exclude: ['Form', 'FormField'] // Loại trừ Form và FormField
  }
},
  webpack: {
    extractCSS: true,
  },
  auth: {
    // Dùng absolute URL để tránh gọi sai host trong các môi trường khác nhau
    baseURL: authBaseUrl,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'get' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/user', method: 'get' },
      },
      pages: {
        login: '/login',
      },
      token: {
        signInResponseTokenPointer: '/data/access_token',
        maxAgeInSeconds: 60 * 24 * 30, // 30 days
        sameSiteAttribute: 'lax',
      },
    },
    globalAppMiddleware: {
      isEnabled: true,
      allow404WithoutAuth: true,
      addDefaultCallbackUrl: true,
    },
  },
  googleFonts: {
    families: {
      'Be Vietnam Pro': true,
    },
  },
  components: true,
  runtimeConfig: {
    public: {
      baseURL: runtimeBaseUrl,
      apiBase: runtimeApiBase,
    },
  },
  routeRules: {
    '/api/**': {
      proxy: `${runtimeApiBase}/api/**`,
    },
  },
  
  nitro: {
    prerender: {
      failOnError: false,
      crawlLinks: true,
      ignore: ['/api']
    }
  },
  
  typescript: {
    typeCheck: false,
  },
});
