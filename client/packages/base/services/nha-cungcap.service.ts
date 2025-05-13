import {
  type RestData,
  type RestPagedDataTable,
} from '../models/base-response.model';
import type { NhaCungCapModel } from '../models/dto/response/nha-cung-cap/nha-cungcap.model';
import { BaseService } from './base.service';

class _NhaCungCapService extends BaseService {
  async getNhaCungCapDataTable(filterProject: any) {
    try {
      const res = await $api<RestPagedDataTable<NhaCungCapModel[]>>(
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
      console.error('Lỗi khi gọi API getNhaCungCapDataTable:', error);
      throw error;
    }
  }

  async getAllNhaCungCap() {
    const res = await $api<RestData<NhaCungCapModel[]>>('/api/publisher', {
      method: 'GET',
    });

    if (res && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async getNhaCungCapById(id: string) {
    const res = await $api<RestData<NhaCungCapModel>>(`/api/publisher/${id}`, {
      method: 'GET',
    });

    if (res && res.status === EnumStatus.OK) {
      return res.data;
    }

    console.error('Không tìm thấy nhà cung cấp với ID:', id);
    return null;
  }

  async insert(entity: NhaCungCapModel) {
    const response = await $api<RestData<NhaCungCapModel>>(`/api/publisher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }

  async update(entity: NhaCungCapModel) {
    const response = await $api<RestData<NhaCungCapModel>>(`/api/publisher`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    return response ?? null;
  }

  async delete(entity: NhaCungCapModel) {
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

const NhaCungCapService = new _NhaCungCapService();
export { NhaCungCapService };
