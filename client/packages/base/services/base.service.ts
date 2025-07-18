abstract class BaseService {
  public readonly baseApiUrl: string;

  constructor() {
    // const runtimeConfig = useRuntimeConfig()
    this.baseApiUrl = 'http://localhost:8888';
    // this.baseApiUrl = runtimeConfig.public.baseURL;
  }

  getAccessToken(): string {
    const { token } = useAuth();
    console.log('Token in service:', token.value);
    console.log('Token type:', typeof token.value);
    if (!token.value) {
      console.warn('Token is null or undefined!');
      return '';
    }
    // Loại bỏ "Bearer " nếu đã có trong token
    const cleanToken = token.value.startsWith('Bearer ') 
      ? token.value.replace('Bearer ', '') 
      : token.value;
    return cleanToken;
  }
}

export { BaseService };
