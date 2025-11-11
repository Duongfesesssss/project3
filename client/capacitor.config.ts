import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'nuxt-app',
  webDir: '.output/public',
  server: {
    // Cho phép live reload khi dev
    androidScheme: 'http'
  }
};

export default config;
