// Public API - không cần authentication
export function $publicApi<T>(
  request: string | Request | URL,
  opts?: any,
) {
  const config = useRuntimeConfig();
  // Nếu request là relative path thì prepend base
  let finalRequest = request as string;
  if (typeof request === 'string' && request.startsWith('/')) {
    // Server side gọi nội bộ bằng apiBase (thường backend:8888 trong docker), client side dùng public.apiBase
    const rawBase = process.server ? (config.apiBase || config.public.apiBase) : config.public.apiBase;
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
    ...opts,
    // Không thêm Authorization header
    headers: {
      ...opts?.headers,
    },
  });
}
