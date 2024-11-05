import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { FilterQuanLyRuiRotableDTO } from '../../models/dto/request/filter/filter-quan-ly-rui-ro.model';
import type { QuanLyRuiRoModel } from '~/packages/base/models/dto/request/quan-ly-rui-ro/quan-ly-rui-ro.model.ts';

class _QuanLyRuiRoService extends BaseService {
  async getListQuanLyRuiRo(q = '', page = 1, pageSize = 5) {
    const res = await useFetch<RestPagedDataTable<QuanLyRuiRoModel[]>>(`${this.baseApiUrl}/api/mohinh-quanly-rrtt`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `${this.getAccessToken()}`,
      }),
      params: {
        page: page,
        pageSize: pageSize,
        q: q,
      },
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }
    return null;
  }

  async getListQuanLyRuiRoDatatable(data: FilterQuanLyRuiRotableDTO) {
    const res = await $fetch<RestPagedDataTable<QuanLyRuiRoModel[]>>(
      `${this.baseApiUrl}/api/mohinh-quanly-rrtt/datatable`,
      {
        method: 'POST',
        headers: new Headers({
          'Authorization': this.getAccessToken(),
          'content-type': 'application/json',
        }),
        body: JSON.stringify(data),
      },
    );
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async addQuanLyRuiRo(useDto: QuanLyRuiRoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/mohinh-quanly-rrtt`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `${this.getAccessToken()}`,
      }),
      body: JSON.stringify(useDto),
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }

    return null;
  }

  async editQuanLyRuiRo(useDto: QuanLyRuiRoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/mohinh-quanly-rrtt`, {
      method: 'PUT',
      body: JSON.stringify(useDto),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${this.getAccessToken()}`,
      },
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }
    return null;
  }

  async deleteQuanLyRuiRo(useDto: QuanLyRuiRoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/mohinh-quanly-rrtt`, {
      method: `DELETE`,
      body: JSON.stringify(useDto),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${this.getAccessToken()}`,
      },
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }
    return null;
  }
}

const QuanLyRuiRoService = new _QuanLyRuiRoService();
export { QuanLyRuiRoService };
