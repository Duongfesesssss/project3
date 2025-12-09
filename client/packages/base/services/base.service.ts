abstract class BaseService {
  public readonly baseApiUrl: string;

  constructor() {
    let apiBase = '';
    // Client side: đọc từ __NUXT__.config.public để không cần composable
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore
        const pub = (window.__NUXT__ && window.__NUXT__.config && window.__NUXT__.config.public) || {};
        apiBase = (pub.apiBase || pub.baseURL || '').toString();
      } catch {}
    }
    // Server side hoặc fallback: dùng biến môi trường
    if (!apiBase && typeof process !== 'undefined') {
      // Nuxt sẽ inline các biến NUXT_PUBLIC_*
      // @ts-ignore
      apiBase = (process.env.NUXT_PUBLIC_API_BASE || process.env.NUXT_PUBLIC_BASE_URL || '').toString();
    }
    // Fallback cuối cùng: localhost cho local development
    if (!apiBase) {
      apiBase = 'http://localhost:8888';
    }
    this.baseApiUrl = apiBase;
  }

  getAccessToken(): string {
    const { token } = useAuth();
    console.log('Token in service:', token.value);
    console.log('Token type:', typeof token.value);
    if (!token.value) {
      console.warn('Token is null or undefined!');
      return '';
    }
    // Đảm bảo luôn trả về đúng format: 'Bearer <token>'
    return token.value.startsWith('Bearer ')
      ? token.value
      : `Bearer ${token.value}`;
  }
}

export { BaseService };
