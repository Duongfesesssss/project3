export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase || config.public.baseURL || '').toString().replace(/\/$/, '');

  // Patch window.fetch
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        if (typeof input === 'string' && input.startsWith('/api/')) {
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
      if (typeof req === 'string' && req.startsWith('/api/')) {
        req = apiBase + req;
      }
      return ofetch(req, opts);
    }) as typeof ofetch;
  }
});
