import {
  type RestData,
  type RestPagedDataTable,
} from '../models/base-response.model';
import type { NhaXuatBanModel } from '../models/dto/response/nha-xuat-ban/nha-xuatban.model';
import { BaseService } from './base.service';

class _NhaXuatBanService extends BaseService {
  async getNhaXuatBanDataTable(filterProject: any) {
    try {
      const res = await $api<RestPagedDataTable<NhaXuatBanModel[]>>(
        '/api/publisher/datatable',
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
      console.error('Lỗi khi gọi API getNhaXuatBanDataTable:', error);
      throw error;
    }
  }

  async getAllNhaXuatBan() {
    const res = await $api<RestData<NhaXuatBanModel[]>>('/api/publisher', {
      method: 'GET',
    });

    if (res && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async getNhaXuatBanById(id: string) {
    const res = await $api<RestData<NhaXuatBanModel>>(`/api/publisher/${id}`, {
      method: 'GET',
    });

    if (res && res.status === EnumStatus.OK) {
      return res.data;
    }

    console.error('Không tìm thấy nhà xuất bản với ID:', id);
    return null;
  }

  async insert(entity: NhaXuatBanModel) {
    const response = await $api<RestData<NhaXuatBanModel>>(`/api/publisher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }

  async update(entity: NhaXuatBanModel) {
    const response = await $api<RestData<NhaXuatBanModel>>(`/api/publisher`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }

  async delete(entity: NhaXuatBanModel) {
    const response = await $api<RestData<null>>(`/api/publisher`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }
}

const NhaXuatBanService = new _NhaXuatBanService();
export { NhaXuatBanService }; 