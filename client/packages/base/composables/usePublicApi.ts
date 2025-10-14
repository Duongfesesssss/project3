// Public API - không cần authentication
export function $publicApi<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1],
) {
  const config = useRuntimeConfig();
  // Nếu request là relative path thì prepend base
  let finalRequest = request as string;
  if (typeof request === 'string' && request.startsWith('/')) {
    // Server side gọi nội bộ bằng apiBase (thường backend:8888 trong docker), client side dùng public.apiBase
    const rawBase = process.server ? (config.apiBase || config.public.apiBase) : config.public.apiBase;
    const base = (rawBase || '').toString();
    finalRequest = base.replace(/\/$/, '') + request;
  }

  return $fetch<T>(finalRequest as any, {
    ...opts,
    // Không thêm Authorization header
    headers: {
      ...opts?.headers,
    },
  });
}
