import type { RestData } from '../../models/base-response.model';
import { BaseService } from '../base.service';

class _UploadService extends BaseService {
  async Images(form: FormData) {
    const res = await $api<RestData<string[]>>(`${this.baseApiUrl}/upload/images`, {
      method: 'POST',
      body: form,
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async Videos(form: FormData) {
    const res = await $api<RestData<string[]>>(`${this.baseApiUrl}/upload/videos`, {
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