import { BaseService } from '../base.service';
import type { RestData } from '../../models/base-response.model.ts';
import type { TaiLieuTapHuan } from '../../models/dto/request/hoatdong-daotao/tai-lieu-tap-huan.model';

const BaseUrl = '/api/tailieu-taphuan';

class _TaiLieuTapHuanService extends BaseService {
  // gắn tài liệu vào hoạt động đào tạo
  async insert(entity: TaiLieuTapHuan) {
    const response = await $api<RestData<TaiLieuTapHuan>>(
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

  // xóa tài liệu tập huấn
  async delete(entity: TaiLieuTapHuan) {
    const response = await $api<RestData<TaiLieuTapHuan>>(
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
const TaiLieuTapHuanService = new _TaiLieuTapHuanService();
export { TaiLieuTapHuanService };
