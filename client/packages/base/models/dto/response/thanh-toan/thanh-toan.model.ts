class ThanhToanItemModel {
  book_id?: {
    _id?: string;
    title?: string;
    image_link?: string;
    price?: number;
    author?: string;
    publisher?: string;
  };
  quantity?: number;
  price?: number;
}

class ThanhToanModel {
  _id?: string;
  user_id?: string;
  order_date?: Date;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'cod' | 'credit_card' | 'bank_transfer';
  total_amount?: number;
  discount_amount?: number;
  shipping_address?: string;
  note?: string;
  voucher_id?: string;
  items?: ThanhToanItemModel[];
  created_at?: Date;
  updated_at?: Date;
}

export { ThanhToanModel, ThanhToanItemModel }; 