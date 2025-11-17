import type { MemberCardModel } from './member-card.model';
import type { MembershipTierModel } from './membership-tier.model';

export interface MemberCardWithUser extends MemberCardModel {
  user_id:
    | {
        _id: string;
        full_name?: string;
        email?: string;
        phone?: string;
      }
    | string;
  tier_id?: MembershipTierModel | string | null;
}
