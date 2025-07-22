import { BaseService } from './base.service';
import { EnumStatus } from '../utils/enums';

class _DonHangService extends BaseService {
  async getDatatable(params: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    status?: string;
  }) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/orders/datatable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi xác thực');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      throw error;
    }
  }

  async getOrderDetail(orderId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi xác thực');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi xác thực');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
      throw error;
    }
  }
}

const DonHangService = new _DonHangService();
export { DonHangService };