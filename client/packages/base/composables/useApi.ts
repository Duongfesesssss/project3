import { useAuthStore } from '~/packages/base/stores/auth.store';

export function $api<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1],
) {
  const authStore = useAuthStore();
  const { data, token } = useAuth();
  
  // Ưu tiên token từ useAuth.token (đây là cách chính xác)
  let accessToken = null;
  
  if (token.value) {
    // Sử dụng token trực tiếp từ useAuth, bỏ "Bearer " prefix nếu có
    accessToken = token.value.replace('Bearer ', '');
  } else if ((data.value as any)?.token) {
    // Fallback: lấy từ data.token
    accessToken = (data.value as any).token.replace('Bearer ', '');
  } else if (authStore.token) {
    // Fallback cuối: lấy từ auth store
    accessToken = authStore.token.replace('Bearer ', '');
  }

  return $fetch<T>(request, {
    ...opts,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...opts?.headers,
    },
  });
}
