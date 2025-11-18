export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase || config.public.baseURL || '').toString().replace(/\/$/, '');
  const apiPrefix = (config.public.apiPrefix || '/api').toString().replace(/\/$/, '');
  const escapedPrefix = apiPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixPattern = new RegExp(`^${escapedPrefix}(?:/|$)`);

  // Patch window.fetch
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        if (typeof input === 'string' && prefixPattern.test(input)) {
          input = apiBase + input;
        }
      } catch {}
      return originalFetch(input as any, init);
    };
  }

  // Patch global $fetch
  // @ts-ignore
  const ofetch = globalThis.$fetch;
  if (ofetch && typeof ofetch === 'function') {
    // @ts-ignore
    globalThis.$fetch = ((req: any, opts: any = {}) => {
      if (typeof req === 'string' && prefixPattern.test(req)) {
        req = apiBase + req;
      }
      return ofetch(req, opts);
    }) as typeof ofetch;
  }
});
