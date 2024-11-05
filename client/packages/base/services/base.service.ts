abstract class BaseService {
  public readonly baseApiUrl: string;

  constructor() {
    // const runtimeConfig = useRuntimeConfig()
    this.baseApiUrl = 'http://localhost:8888';
    // this.baseApiUrl = runtimeConfig.public.baseURL;
  }

  getAccessToken(): string {
    const { token } = useAuth();
    return token.value!;
  }
}

export { BaseService };
