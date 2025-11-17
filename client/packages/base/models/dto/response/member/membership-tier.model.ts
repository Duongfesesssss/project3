export interface MembershipTierModel {
  _id: string;
  name: string;
  description?: string;
  min_points: number;
  min_lifetime_spend: number;
  discount_rate: number;
  benefits: string[];
  priority: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
