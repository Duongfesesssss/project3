import {
    type RestData,
    type RestPagedDataTable,
  } from '../models/base-response.model';
import type { VoucherModel } from '../models/dto/response/vocher/voucher.model';
  import { BaseService } from './base.service';
  
  class _VoucherService extends BaseService {
    async getVoucherDataTable(filterProject: any) {
      try {
        const res = await $api<RestPagedDataTable<VoucherModel[]>>(
          '/api/voucher/datatable', // nếu có endpoint này
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterProject),
          }
        );
  
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
      const res = await $api<RestData<VoucherModel[]>>('/api/voucher', {
        method: 'GET',
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res;
      }
      return null;
    }
  
    async getVoucherById(id: string) {
      const res = await $api<RestData<VoucherModel>>(`/api/voucher/${id}`, {
        method: 'GET',
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
  
      console.error('Không tìm thấy voucher với ID:', id);
      return null;
    }
  
    async validateVoucher(code: string) {
      const res = await $api<RestData<VoucherModel>>(`/api/voucher/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
  
      console.error('Voucher không hợp lệ hoặc đã hết hạn:', code);
      return null;
    }
  
    async insert(entity: VoucherModel) {
      const response = await $api<RestData<VoucherModel>>(`/api/voucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  
    async update(entity: VoucherModel) {
      const response = await $api<RestData<VoucherModel>>(`/api/voucher`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  
    async delete(entity: VoucherModel) {
      const response = await $api<RestData<null>>(`/api/voucher`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  }
  
  const VoucherService = new _VoucherService();
  export { VoucherService };
  