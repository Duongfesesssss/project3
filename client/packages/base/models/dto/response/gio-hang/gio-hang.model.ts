class GioHangItemModel {
  book_id?: {
    _id?: string;
    title?: string;
    image_link?: string;
    price?: number;
  };
  quantity?: number;
  price?: number;
}

class GioHangModel {
  _id?: string;
  user_id?: string;
  items?: GioHangItemModel[];
  total_amount?: number;
  created_at?: Date;
  updated_at?: Date;
}

export { GioHangModel, GioHangItemModel };
