import Aura from '@primevue/themes/aura';
import { defaultOptions } from 'primevue/config';

export default defineNuxtConfig({
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
  css: ['primeicons/primeicons.css'],
  modules: [
    '@primevue/nuxt-module',
    '@nuxt/eslint',
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode',
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
      locale: {
        ...defaultOptions.locale,
      },
    },
    autoImport: true,
  },
  webpack: {
    extractCSS: true,
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: true,
      },
    },
  },
  auth: {
    baseURL: process.env.BASE_URL,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'get' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/user', method: 'get' },
      },
      pages: {
        login: '/',
      },
      token: {
        signInResponseTokenPointer: '/data/access_token',
        maxAgeInSeconds: 60 * 24 * 30, // 5 min
        sameSiteAttribute: 'lax',
      },
      sessionDataType: {
        data: {
          roles: 'string[]',
          user: {
            id: 'string',
            user_name: 'string',
            user_info: {
              full_name: 'string',
              commune: {
                area_id: 'string',
                name_vn: 'string',
              },
              district: {
                area_id: 'string',
                name_vn: 'string',
              },
              province: {
                area_id: 'string',
                name_vn: 'string',
              },
            },
          },
        },
        status: 'string',
      },
    },
    globalAppMiddleware: {
      isEnabled: false,
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
      baseURL: process.env.BASE_URL,
    },
  },
  routeRules: {
    '/api/**': {
      proxy: process.env.BASE_URL + '/api/**',
    },
  },
  typescript: {
    typeCheck: false,
  },
});
