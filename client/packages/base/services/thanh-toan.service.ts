import { BaseService } from './base.service';
import { EnumStatus } from '../utils/enums';
import type { ThanhToanModel, ThanhToanItemModel } from '../models/dto/response/thanh-toan/thanh-toan.model';

class _ThanhToanService extends BaseService {
async createOrder(
  userId: string,
  items: Array<{ book_id: string, quantity: number, price: number }>,
  shippingAddress: string,
  paymentMethod: string,
  voucherId?: string,
  note?: string,
  shippingFee?: number,
  discountAmount?: number
) {
  try {
    const response = await fetch(`${this.baseApiUrl}/api/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAccessToken()
      },
      body: JSON.stringify({
        user_id: userId,
        items: items,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        voucher_id: voucherId,
        note: note,
        shipping_fee: shippingFee,
        discount_amount: discountAmount
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    if (res && res.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    return null;
  }
}


  async getUserOrders(userId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/order/user/${userId}`, {
        headers: {
          'Authorization': this.getAccessToken()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      return null;
    }
  }

  async getOrderDetail(orderId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/order/detail/${orderId}`, {
        headers: {
          'Authorization': this.getAccessToken()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
      return null;
    }
  }

async getUserPaidOrders() {
  try {
    const response = await fetch(`${this.baseApiUrl}/api/order/my-paid-orders`, {
      headers: {
        'Authorization': this.getAccessToken()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    if (res && res.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng đã thanh toán:', error);
    return null;
  }
}

async createPayOSPayment(params: {
  orderId: string;
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const response = await fetch(`${this.baseApiUrl}/api/payment/payos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAccessToken()
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    if (res && res.success) {
      return res.data; // chứa: checkoutUrl, qrCode,...
    }

    console.error('PayOS create failed:', res.message);
    return null;
  } catch (error) {
    console.error('Lỗi khi gọi PayOS:', error);
    return null;
  }
}


}

const ThanhToanService = new _ThanhToanService();
export { ThanhToanService }; 