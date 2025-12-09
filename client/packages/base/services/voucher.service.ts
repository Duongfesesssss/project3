import {
  type RestData,
  type RestPagedDataTable,
} from '../models/base-response.model';
import type { VoucherModel } from '../models/dto/response/voucher/voucher.model';
import type { ApiResponse } from '~/packages/base/models/dto/response/common/api-response.model';
import { $api } from '~/packages/base/composables/useApi';
import { BaseService } from './base.service';
import { EnumStatus } from '../utils/enums';

export type ValidatedVoucherResponse = {
  discount: number;
  discountAmount: number;
  voucher: VoucherModel;
};

class _VoucherService extends BaseService {
  async getVoucherDataTable(filterProject: any) {
    try {
      const res = await $api<RestPagedDataTable<VoucherModel[]>>('/api/voucher/datatable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterProject),
      });

      if (res) {
        return res;
      }

      console.error('Không nhận được phản hồi từ server:', res);
      return null;
    } catch (error) {
      console.error('Lỗi khi gọi API getVoucherDataTable:', error);
      throw error;
    }
  }

  async getAllVouchers() {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/voucher`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log('Vouchers response:', res);

      if (res && res.status === EnumStatus.OK) {
        return res;
      }

      console.error('Get vouchers failed:', res);
      return null;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  }

  async getVoucherById(id: string) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/voucher/${id}`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }

      console.error('Không tìm thấy voucher với ID:', id);
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin voucher:', error);
      return null;
    }
  }

  async getPublicVouchers() {
    try {
      const response = await $api<ApiResponse<VoucherModel[]>>('/api/voucher/public');
      return response?.data ?? [];
    } catch (error) {
      console.error('Error fetching public vouchers:', error);
      throw error;
    }
  }

  async getMyVouchers() {
    try {
      const response = await $api<ApiResponse<VoucherModel[]>>('/api/voucher/my');
      return response?.data ?? [];
    } catch (error) {
      console.error('Error fetching personal vouchers:', error);
      throw error;
    }
  }

  async validateVoucher(code: string, userId: string, subtotal: number) {
    try {
      const response = await $api<ApiResponse<ValidatedVoucherResponse>>('/api/voucher/validate', {
        method: 'POST',
        body: {
          code,
          user_id: userId,
          subtotal,
        },
      });
      return response?.data ?? null;
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Không thể kiểm tra voucher';
      console.error('Error validating voucher:', error);
      throw new Error(message);
    }
  }

  async insert(entity: VoucherModel) {
    const response = await $api<RestData<VoucherModel>>('/api/voucher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }

  async update(entity: VoucherModel) {
    const response = await $api<RestData<VoucherModel>>(`/api/voucher/${entity._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...entity,
        _id: undefined,
      }),
    });

    return response ?? null;
  }

  async delete(entity: VoucherModel | string) {
    const id = typeof entity === 'string' ? entity : entity._id || (entity as any).id;
    if (!id) {
      throw new Error('Thiếu ID voucher để xóa');
    }
    const response = await $api<RestData<null>>(`/api/voucher/${id}`, {
      method: 'DELETE',
    });

    return response ?? null;
  }
}

const VoucherService = new _VoucherService();
export { VoucherService };
  