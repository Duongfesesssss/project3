import { $publicApi } from '../composables/usePublicApi';
import { EnumStatus } from '../utils/enums';
import type { BookModel } from '../models/dto/response/book/book.model';

interface RecommendationItem {
  book: BookModel;
  pop_score?: number;
  raw_sold?: number;
  wr_score?: number;
  related?: Array<{ book: BookModel; weight: number }>;
}

export class RecommendationService {
  static async getPopular(limit = 12): Promise<RecommendationItem[]> {
    const res = await $publicApi<{ status: string; data: RecommendationItem[] }>(`/api/recommendations/popular?limit=${limit}`);
    if (res && res.status === EnumStatus.OK) return res.data || [];
    return [];
  }

  static async getRated(limit = 12): Promise<RecommendationItem[]> {
    const res = await $publicApi<{ status: string; data: RecommendationItem[] }>(`/api/recommendations/rated?limit=${limit}`);
    if (res && res.status === EnumStatus.OK) return res.data || [];
    return [];
  }

  static async getRelated(bookId: string, limit = 5) {
    const res = await $publicApi<{ status: string; data: { related: Array<{ book: BookModel; weight: number }> } }>(
      `/api/recommendations/related/${bookId}?limit=${limit}`
    );
    if (res && res.status === EnumStatus.OK) return res.data.related || [];
    return [];
  }
}
