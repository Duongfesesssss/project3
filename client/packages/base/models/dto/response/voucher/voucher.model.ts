class VoucherModel {
  _id?: string;
  code = '';
  discount = 0;
  discount_type: 'percentage' | 'fixed' = 'percentage';
  max_discount?: number | null;
  valid_from?: string | Date;
  valid_until?: string | Date;
  usage_limit = 1;
  used_count = 0;
  min_order_value = 0;
  visibility: 'private' | 'public' = 'private';
  // Alias để tương thích với field type phía backend
  type?: 'private' | 'public';
  description?: string;
  owner_user_id?: string | null;
  source?: string;
  status?: 'active' | 'inactive';
  auto_generated?: boolean;
  metadata?: Record<string, any>;
  created_at?: string | Date;
  updated_at?: string | Date;
}
  
  class DiscountModel {
    code: string;
    label: string;
    type: 'fixed' | 'percentage' | 'shipping';
    value: number;
    minAmount: number;
    constructor(
      code: string,
      label: string,
      type: 'fixed' | 'percentage' | 'shipping',
      value: number,
      minAmount: number
    ) {
      this.code = code;
      this.label = label;
      this.type = type;
      this.value = value;
      this.minAmount = minAmount;
    }
  }
  
  export { VoucherModel, DiscountModel };