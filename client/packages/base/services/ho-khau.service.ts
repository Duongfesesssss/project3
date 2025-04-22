import {
  type RestData,
  type RestPagedDataTable,
} from '../models/base-response.model';
import type { HoKhauModel } from '../models/dto/response/ho-khau/ho-khau.model';
import { BaseService } from './base.service';

class _HoKhauService extends BaseService {
  async HoKhauDataTable(filterProject) {
    try {
      // Gửi các tham số phân trang và sắp xếp qua body
      const res = await $api<RestPagedDataTable<HoKhauModel[]>>('/api/ho-khau/datatable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterProject)
      });

      // Kiểm tra và trả về dữ liệu
      if (res) {
        return res;
      }
      console.error('Không nhận được phản hồi từ server:', res);
      return null;
    } catch (error) {
      console.error('Lỗi khi gọi API HoKhauDataTable:', error);
      throw error;
    }
  }

  async getHoKhauID(id?: string) {
    const res = await $api<RestPagedDataTable<HoKhauModel[]>>(
      `/api/ho-khau/${id}`,
      {
        method: 'GET',
      },
    );

    if (res && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async insert(entity: HoKhauModel) {
    const response = await $api<RestPagedDataTable<HoKhauModel[]>>(
      `/api/ho-khau`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }

  async update(entity: HoKhauModel) {
    const response = await $api<RestPagedDataTable<HoKhauModel[]>>(
      `/api/ho-khau`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }

  async delete(entity: HoKhauModel) {
    const response = await $api<RestPagedDataTable<HoKhauModel[]>>(
      `/api/ho-khau`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }
}

// Tạo instance duy nhất cho service
const HoKhauService = new _HoKhauService();
export { HoKhauService };

