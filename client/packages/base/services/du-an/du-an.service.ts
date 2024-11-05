import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model.ts';
import type { FilterDuAnDatatableDTO } from '../../models/dto/request/filter/filter-du-an-databtale.model.js';
import type { DuAnModel } from '../../models/dto/response/du-an/du-an.model.ts';

const BaseUrl = '/api/du-an';
const DatatableUrl = `${BaseUrl}/datatable`;
class _DuAnService extends BaseService {
  // lấy dữ liệu du-an ra datatable
  async DuAnDatable(data: FilterDuAnDatatableDTO) {
    const response = await $api<RestPagedDataTable<DuAnModel[]>>(
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

  async insert(data: DuAnModel) {
    const response = await $api<RestData<DuAnModel>>(
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

  async update(data: DuAnModel) {
    const response = await $api<RestData<DuAnModel>>(
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

  async delete(data: DuAnModel) {
    const response = await $api<RestData<DuAnModel>>(
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
const DuAnService = new _DuAnService();
export { DuAnService };
