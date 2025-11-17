export interface ListCardsPayload {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface RedeemPointsPayload {
  points: number;
  reason?: string;
  reference_id?: string;
}

export interface AdjustPointsPayload {
  user_id: string;
  delta_points: number;
  reason?: string;
  reference_id?: string;
}

export interface SaveTierPayload {
  name: string;
  description?: string;
  min_points: number;
  min_lifetime_spend: number;
  discount_rate: number;
  benefits: string[];
  priority: number;
  is_active: boolean;
}
