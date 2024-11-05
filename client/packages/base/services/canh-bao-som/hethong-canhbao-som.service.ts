import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { CanhBaoSomModel } from '../../models/dto/response/canh-bao-som/canh-bao-som.model';
import type { FilterHeThongCanhBaoSomDatatable } from '~/packages/base/models/dto/request/hethong-canhbao-som/filter-hethong-canhbao-som.modal';

const BASE_URL = '/api/hethong-canhbao-som';
class _HeThongCanhBaoSomService extends BaseService {
  async GetList(filter: FilterHeThongCanhBaoSomDatatable) {
    const res = await $api<RestPagedDataTable<CanhBaoSomModel[]>>(`${this.baseApiUrl}${BASE_URL}/datatable`, {
      method: 'POST',
      body: filter,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async Insert(entity: CanhBaoSomModel) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async Edit(entity: CanhBaoSomModel) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async Delete(entity: CanhBaoSomModel) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: `DELETE`,
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const HeThongCanhBaoSomService = new _HeThongCanhBaoSomService();
export { HeThongCanhBaoSomService };
