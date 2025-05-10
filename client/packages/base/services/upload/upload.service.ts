import type { RestData } from '../../models/base-response.model';
import { BaseService } from '../base.service';

class _UploadService extends BaseService {
  async Images(form: FormData) {
    try {
      const res = await $api<any>(`${this.baseApiUrl}/api/upload/images`, {
        method: 'POST',
        body: form,
      });
      console.log('Phản hồi từ API:', res); // Log phản hồi từ API

      // Kiểm tra phản hồi từ backend
      if (res && res.url) {
        return res; // Trả về phản hồi nếu hợp lệ
      } else {
        throw new Error('Phản hồi không hợp lệ từ server');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API Upload Images:', error);
      throw error;
    }
  }

  async Videos(form: FormData) {
    const res = await $api<RestData<string[]>>(`${this.baseApiUrl}/api/upload/videos`, {
      method: 'POST',
      body: form,
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const UploadService = new _UploadService();
export { UploadService };