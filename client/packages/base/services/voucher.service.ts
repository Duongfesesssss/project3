import {
    type RestData,
    type RestPagedDataTable,
  } from '../models/base-response.model';
import type { VoucherModel } from '../models/dto/response/voucher/voucher.model';
import { BaseService } from './base.service';
import { EnumStatus } from '../utils/enums';

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
    try {
      const response = await fetch(`${this.baseApiUrl}/api/voucher`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
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
  }    async getVoucherById(id: string) {
      try {
        const response = await fetch(`${this.baseApiUrl}/api/voucher/${id}`, {
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

        console.error('Không tìm thấy voucher với ID:', id);
        return null;
      } catch (error) {
        console.error('Lỗi khi lấy thông tin voucher:', error);
        return null;
      }
    }
  
  async validateVoucher(code: string, userId: string, subtotal: number) {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/voucher/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({ code, user_id: userId, subtotal }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log('Validate voucher response:', res);
      
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      
      console.error('Validate voucher failed:', res);
      return null;
    } catch (error) {
      console.error('Error validating voucher:', error);
      throw error;
    }
  }    async insert(entity: VoucherModel) {
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
  