import { useAuthStore } from '~/packages/base/stores/auth.store';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  
  // Initialize auth state từ localStorage
  authStore.initAuth();
});
