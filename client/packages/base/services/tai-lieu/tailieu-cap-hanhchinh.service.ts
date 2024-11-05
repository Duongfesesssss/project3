import { BaseService } from '../base.service';
import type { RestData } from '../../models/base-response.model.ts';
import type { TaiLieuCapHanhChinh } from '../../models/dto/request/tai-lieu/tai-lieu-cap-hanh-chinh.model';

const BaseUrl = '/api/tailieu-cap-hanhchinh';

class _TaiLieuCapHanhChinhService extends BaseService {
  async update(entity: TaiLieuCapHanhChinh) {
    const response = await $api<RestData<TaiLieuCapHanhChinh>>(
      `${this.baseApiUrl}${BaseUrl}`,
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

  async insert(entity: TaiLieuCapHanhChinh) {
    const response = await $api<RestData<TaiLieuCapHanhChinh>>(
            `${this.baseApiUrl}${BaseUrl}`,
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

  async delete(entity: TaiLieuCapHanhChinh) {
    const response = await $api<RestData<TaiLieuCapHanhChinh>>(
            `${this.baseApiUrl}${BaseUrl}`,
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
const TaiLieuCapHanhChinhService = new _TaiLieuCapHanhChinhService();
export { TaiLieuCapHanhChinhService };
