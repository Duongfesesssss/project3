import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { FilterHocVienDatatable } from '../../models/dto/request/filter/filter-hoc-vien-datatable.model';
import type { HocVien } from '../../models/dto/request/hoatdong-daotao/hoc-vien.model';
import type { HocVienModel } from '../../models/dto/response/hoc-vien/hoc-vien.model';
import { BaseService } from '../base.service';

const URL = '/api/hoc-vien';
const DATATABLE_URL = `${URL}/datatable`;
class _HocVienService extends BaseService {
  async datatable(body: FilterHocVienDatatable) {
    const res = await $api<RestPagedDataTable<HocVienModel[]>>(`${this.baseApiUrl}${DATATABLE_URL}`, {
      method: 'POST',
      body: body,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async insert(entity: HocVien) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async update(entity: HocVien) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async delete(entity: HocVien) {
    const res = await $api<RestData<number>>(`${this.baseApiUrl}${URL}`, {
      method: `DELETE`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const HocVienService = new _HocVienService();
export { HocVienService };
