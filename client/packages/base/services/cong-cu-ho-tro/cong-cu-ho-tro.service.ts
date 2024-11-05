import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model.ts';
import type { FilterCongCuHoTroDatatableDTO } from '../../models/dto/request/filter/filter-cong-cu-ho-tro-datatable.model';
import type { CongCuHoTroDTO } from '../../models/dto/request/cong-cu-ho-tro/cong-cu-ho-tro.model';
import type { CongCuHoTroModel } from '../../models/dto/response/cong-cu-ho-tro/cong-cu-ho-tro.model';

const BaseUrl = '/api/cong-cu-ho-tro';
const DatatableUrl = `${BaseUrl}/datatable`;
class _CongCuHoTroService extends BaseService {
  // get data record from database
  async datatable(data: FilterCongCuHoTroDatatableDTO) {
    const response = await $api<RestPagedDataTable<CongCuHoTroModel[]>>(
      `${this.baseApiUrl}${DatatableUrl}`,
      {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify(data),
      },
    );
    if (response && response.status == EnumStatus.OK) {
      return response;
    }
    return null;
  }

  // add new record from database
  async insert(data: CongCuHoTroDTO) {
    const response = await $api<RestData<CongCuHoTroModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify(data),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }

  // update info record from database
  async update(data: CongCuHoTroDTO) {
    const response = await $api<RestData<CongCuHoTroModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'PUT',
        headers: new Headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify(data),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }

  // delete record to database
  async delete(data: CongCuHoTroDTO) {
    const response = await $api<RestData<CongCuHoTroModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'DELETE',
        headers: new Headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify(data),
      },
    );

    if (response) {
      return response;
    }

    return null;
  }
}
const CongCuHoTroService = new _CongCuHoTroService();
export { CongCuHoTroService };
