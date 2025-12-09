export interface ReviewModel {
  _id?: string;
  user_id: {
    _id: string;
    user_name?: string;
    username?: string;
    full_name?: string;
    display_name?: string;
    email?: string;
    avatar?: string;
  };
  book_id: string;
  order_id: string;
  rating: number;
  comment: string;
  helpful_count: number;
  verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}
