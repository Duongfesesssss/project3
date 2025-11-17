import type { MembershipTierModel } from './membership-tier.model';

export interface MemberCardModel {
  _id: string;
  user_id: string;
  tier_id?: MembershipTierModel | string | null;
  points_balance: number;
  lifetime_points: number;
  lifetime_spend: number;
  last_tier_change?: string;
  issued_at?: string;
  updated_at?: string;
}
