import { BaseService } from './base.service';
import type { ThanhToanModel, ThanhToanItemModel } from '../models/dto/response/thanh-toan/thanh-toan.model';

class _ThanhToanService extends BaseService {
  async createOrder(userId: string, shippingAddress: string, paymentMethod: string, voucherId?: string, note?: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          voucher_id: voucherId,
          note: note
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
          'Authorization': `Bearer ${this.getAccessToken()}`
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
      const response = await fetch(`${this.baseApiUrl}/api/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
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
          'Authorization': `Bearer ${this.getAccessToken()}`
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
}

const ThanhToanService = new _ThanhToanService();
export { ThanhToanService }; 