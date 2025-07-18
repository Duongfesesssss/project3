class VoucherModel {
    id?: string; // optional nếu tạo mới
    code?: string; // mã voucher, ví dụ: 'SALE20'
    name?: string; // tên chương trình, ví dụ: 'Giảm 20%'
    description?: string; // mô tả thêm (có thể rỗng)
    discount_type?: 'percent' | 'amount'; // loại giảm giá
    discount_value?: number; // giá trị giảm (VD: 20 hoặc 50000)
    max_discount?: number; // giới hạn giảm tối đa (nếu có)
    min_order_value?: number; // đơn hàng tối thiểu để dùng
    quantity?: number; // số lượng còn lại
    start_date?: string; // định dạng ISO: '2025-05-07T00:00:00.000Z'
    end_date?: string;   // thời hạn kết thúc
    is_active?: boolean = true; // Gán giá trị mặc định
    created_at?: string;
    updated_at?: string;
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