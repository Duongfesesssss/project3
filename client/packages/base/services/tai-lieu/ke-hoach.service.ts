import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model.ts';
import type { FilterKeHoachDatatableDTO } from '../../models/dto/request/filter-ke-hoach/filter-ke-hoach-datatable.model';
import type { KeHoachModel } from '../../models/dto/request/tai-lieu/ke-hoach.model';

const BaseUrl = '/api/tai-lieu/ke-hoach';
const DatatableUrl = `${BaseUrl}/datatable`;
class _KeHoachService extends BaseService {
  async KeHoachDatatable(data: FilterKeHoachDatatableDTO) {
    const response = await $fetch<RestPagedDataTable<KeHoachModel[]>>(
      `${this.baseApiUrl}${DatatableUrl}`,
      {
        method: 'POST',
        headers: new Headers({
          'Authorization': this.getAccessToken(),
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

  async getItem(id: number) {
    const response = await $api<RestData<KeHoachModel>>(
      `${this.baseApiUrl}${BaseUrl}/${id}`,
      {
        method: 'get',
      },
    );

    if (response && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }

  async insert(data: KeHoachModel) {
    const response = await $fetch<RestData<KeHoachModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'POST',
        headers: new Headers({
          'Authorization': this.getAccessToken(),
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

  async update(data: KeHoachModel) {
    const response = await $fetch<RestData<KeHoachModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'PUT',
        headers: new Headers({
          'Authorization': this.getAccessToken(),
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

  async delete(data: KeHoachModel) {
    const response = await $fetch<RestData<KeHoachModel>>(
      `${this.baseApiUrl}${BaseUrl}`,
      {
        method: 'DELETE',
        headers: new Headers({
          'Authorization': this.getAccessToken(),
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
const KeHoachService = new _KeHoachService();
export { KeHoachService };
