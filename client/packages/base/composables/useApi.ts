import { useAuthStore } from '~/packages/base/stores/auth.store';

export function $api<T = any>(
  request: string | Request | URL,
  opts?: any,
) {
  const authStore = useAuthStore();
  const { data, token } = useAuth();
  
  // Ưu tiên token từ useAuth.token (đây là cách chính xác)
  let accessToken = null;
  // Lấy token, ưu tiên từ useAuth, giữ nguyên format
  if (token.value) {
    accessToken = token.value;
  } else if ((data.value as any)?.token) {
    accessToken = (data.value as any).token;
  } else if (authStore.token) {
    accessToken = authStore.token;
  }

  const config = useRuntimeConfig();
  // Nếu request là relative path thì prepend base tuyệt đối
  let finalRequest = request as string;
  if (typeof request === 'string' && request.startsWith('/')) {
    // Ưu tiên apiBase công khai, fallback về baseURL để tương thích cũ
    const rawBase = process.server
      ? (config.apiBase || config.public.apiBase || config.public.baseURL)
      : (config.public.apiBase || config.public.baseURL);
    const base = (rawBase || '').toString().replace(/\/$/, '');
    const prefix = (config.public.apiPrefix || '/api').toString();
    const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const escapedPrefix = normalizedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const collapsePattern = new RegExp(`^(?:${escapedPrefix})+`, 'i');
    let normalizedPath = request.startsWith('/') ? request : `/${request}`;
    if (collapsePattern.test(normalizedPath)) {
      normalizedPath = normalizedPath.replace(collapsePattern, normalizedPrefix);
    } else {
      normalizedPath = `${normalizedPrefix}${normalizedPath}`;
    }
    normalizedPath = normalizedPath.replace(/\/\/{2,}/g, '/');
    finalRequest = base + normalizedPath;
  }

  return $fetch(finalRequest as any, {
    ...(opts || {}),
    headers: {
      ...(accessToken
        ? { Authorization: accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}` }
        : {}),
      ...((opts && opts.headers) || {}),
    },
  });
}
