export interface MemberPointHistoryModel {
  _id: string;
  card_id: string;
  user_id: string;
  source: 'order' | 'review' | 'redeem' | 'manual' | 'adjust';
  type: 'earn' | 'spend' | 'adjust';
  points: number;
  description?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
