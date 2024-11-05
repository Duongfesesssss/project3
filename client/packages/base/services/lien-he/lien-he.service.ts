import type { RestBase } from '../../models/base-response.model';
import { BaseService } from '~/packages/base/services/base.service';

class _LienHeService extends BaseService {
  async guiLienHe(data: FormData) {
    const res = await useFetch<RestBase>(`${this.baseApiUrl}/api/lien-he`,
      {
        method: 'POST',
        body: data,
      },
    );
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }
    return null;
  }
}

const LienHeService = new _LienHeService();
export { LienHeService };
