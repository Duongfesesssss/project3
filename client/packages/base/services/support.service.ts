import { BaseService } from './base.service';

class _SupportService extends BaseService {
  async listThreads(params?: { status?: string }) {
    const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : '';
    const res = await $api<any | { data: any }>(`/api/support/threads${query}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache' },
    });
    // controller trả về mảng thuần; nếu $api wrap {data} thì fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res as any;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }

  async getMessages(threadId: string) {
    if (!threadId) return [];
    const noCache = `?t=${Date.now()}`;
    const res = await $api<any | { data: any }>(`/api/support/threads/${threadId}/messages${noCache}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = res as any;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }
}

const SupportService = new _SupportService();
export { SupportService };
