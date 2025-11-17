import { BaseService } from './base.service';
import { $api } from '~/packages/base/composables/useApi';
import type { ApiResponse, PaginationMeta } from '~/packages/base/models/dto/response/common/api-response.model';
import type { MemberCardModel } from '~/packages/base/models/dto/response/member/member-card.model';
import type { MemberPointHistoryModel } from '~/packages/base/models/dto/response/member/member-point-history.model';
import type { MemberPointHistoryPagination } from '~/packages/base/models/dto/response/member/member-point-history-pagination.model';
import type { MemberCardWithUser } from '~/packages/base/models/dto/response/member/member-card-with-user.model';
import type { MembershipTierModel } from '~/packages/base/models/dto/response/member/membership-tier.model';
import type {
  AdjustPointsPayload,
  ListCardsPayload,
  RedeemPointsPayload,
  SaveTierPayload
} from '~/packages/base/models/dto/request/member/member.payloads';

class _MemberService extends BaseService {
  async getMyMemberCard() {
    const response = await $api<ApiResponse<MemberCardModel>>('/api/member/me');
    return response?.data;
  }

  async getMyPointHistory(options?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (options?.page) query.set('page', String(options.page));
    if (options?.limit) query.set('limit', String(options.limit));
    const qs = query.toString();
    const response = await $api<ApiResponse<MemberPointHistoryModel[]>>(`/api/member/me/history${qs ? `?${qs}` : ''}`);
    const defaultPagination: PaginationMeta = {
      total: 0,
      page: options?.page || 1,
      limit: options?.limit || 10
    };
    return {
      data: response?.data ?? [],
      pagination: response?.pagination ?? defaultPagination
    } satisfies MemberPointHistoryPagination;
  }

  async redeemPoints(payload: RedeemPointsPayload) {
    const response = await $api<ApiResponse<MemberCardModel>>('/api/member/me/redeem', {
      method: 'POST',
      body: payload
    });
    return response;
  }

  async listMemberCards(params?: ListCardsPayload) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.keyword) query.set('keyword', params.keyword);
    const qs = query.toString();
    const response = await $api<ApiResponse<MemberCardWithUser[]>>(`/api/member/cards${qs ? `?${qs}` : ''}`);
    return response;
  }

  async adjustPoints(payload: AdjustPointsPayload) {
    return $api<ApiResponse<MemberCardModel>>('/api/member/adjust', {
      method: 'POST',
      body: payload
    });
  }

  async triggerTierCheck(userId: string) {
    return $api<ApiResponse<MemberCardModel>>('/api/member/tiers/check', {
      method: 'POST',
      body: { user_id: userId }
    });
  }

  async getTiers() {
    const response = await $api<ApiResponse<MembershipTierModel[]>>('/api/member/tiers');
    return response?.data ?? [];
  }

  async createTier(payload: SaveTierPayload) {
    const response = await $api<ApiResponse<MembershipTierModel>>('/api/member/tiers', {
      method: 'POST',
      body: payload
    });
    return response?.data;
  }

  async updateTier(tierId: string, payload: SaveTierPayload) {
    const response = await $api<ApiResponse<MembershipTierModel>>(`/api/member/tiers/${tierId}`, {
      method: 'PUT',
      body: payload
    });
    return response?.data;
  }

  async deleteTier(tierId: string) {
    return $api<ApiResponse<null>>(`/api/member/tiers/${tierId}`, {
      method: 'DELETE'
    });
  }

  async getStats() {
    const response = await $api<ApiResponse<{ totalCards: number; byTier: Array<{ _id: string; totalMembers: number; totalPoints: number; lifetimeSpend: number; }> }>>('/api/member/stats/summary');
    return response?.data;
  }
}

const MemberService = new _MemberService();
export { MemberService };
