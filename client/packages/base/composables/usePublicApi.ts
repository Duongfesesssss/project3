// Public API - không cần authentication
export function $publicApi<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1],
) {
  return $fetch<T>(request, {
    ...opts,
    // Không thêm Authorization header
    headers: {
      ...opts?.headers,
    },
  });
}
