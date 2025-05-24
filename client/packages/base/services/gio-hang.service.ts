import { BaseService } from './base.service';
import type { GioHangModel, GioHangItemModel } from '../models/dto/response/gio-hang/gio-hang.model';

class _GioHangService extends BaseService {
  async getGioHangByUserId(userId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log('res',res.data)
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      return null;
    }
  }

  async addToCart(userId: string, bookId: string, quantity: number) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId,
          quantity
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
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      return null;
    }
  }

  async updateQuantity(userId: string, bookId: string, quantity: number) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId,
          quantity
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
      console.error('Lỗi khi cập nhật số lượng:', error);
      return null;
    }
  }

  async removeItem(userId: string, bookId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId
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
      console.error('Lỗi khi xóa sách khỏi giỏ hàng:', error);
      return null;
    }
  }

  async clearCart(userId: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/cart/clear/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      return false;
    }
  }
}

const GioHangService = new _GioHangService();
export { GioHangService };
