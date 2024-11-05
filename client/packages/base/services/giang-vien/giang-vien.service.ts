import { BaseService } from '../base.service';
import type { RestData, RestError, RestPagedDataTable } from '../../models/base-response.model';
import type { GiangVienModel } from '../../models/dto/response/giang-vien/giang-vien.model';
import type { FilterGiangVienDatatable } from '~/packages/base/models/dto/request/filter-giang-vien/filter-giang-vien-datatable.model';

class _GiangVienService extends BaseService {
  async GetList(filter: FilterGiangVienDatatable) {
    const res = await $api<RestPagedDataTable<GiangVienModel[]>>(`${this.baseApiUrl}/api/giang-vien/datatable`, {
      method: 'POST',
      body: filter,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async Insert(entity: GiangVienModel) {
    const res = await $api<RestData<number> | RestError>(`${this.baseApiUrl}/api/giang-vien`, {
      method: 'POST',
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res as RestData<number>;
    }
    else if (res && res.status == EnumStatus.ERROR) {
      return res as RestError;
    }

    return null;
  }

  async Edit(entity: GiangVienModel) {
    const res = await $api<RestData<number> | RestError>(`${this.baseApiUrl}/api/giang-vien`, {
      method: 'PUT',
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res as RestData<number>;
    }
    else if (res && res.status == EnumStatus.ERROR) {
      return res as RestError;
    }
    return null;
  }

  async Delete(entity: GiangVienModel) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}/api/giang-vien`, {
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

const GiangVienService = new _GiangVienService();
export { GiangVienService };
