import { useAuthStore } from '~/packages/base/stores/auth.store';

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  
  // Kiểm tra xem user có đăng nhập và có quyền truy cập CMS không
  if (!authStore.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Bạn cần đăng nhập để truy cập trang này'
    });
  }
  
  if (!authStore.isStaffOrAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập trang quản trị'
    });
  }
});
