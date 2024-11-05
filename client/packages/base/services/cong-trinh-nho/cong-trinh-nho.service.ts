import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { FilterCongTrinhNhotableDTO } from '../../models/dto/request/filter/filter-cong-trinh-nho-datatable.model';
import type { CongTrinhNhoModel } from '~/packages/base/models/dto/request/cong-trinh-nho/cong-trinh-nho.model';

class _CongTrinhNhoService extends BaseService {
  async getListCongTrinhNho(q: string = '', page: number = 1, pageSize: number = 1000) {
    const res = await useFetch<RestPagedDataTable<CongTrinhNhoModel[]>>(`${this.baseApiUrl}/api/congtrinh-quymo-nho`, {
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

  async congTrinhNhoDatable(data: FilterCongTrinhNhotableDTO) {
    const res = await $fetch<RestPagedDataTable<CongTrinhNhoModel[]>>(
      `${this.baseApiUrl}/api/congtrinh-quymo-nho/datatable`,
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

  async addCongTrinhNho(useDto: CongTrinhNhoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/congtrinh-quymo-nho`, {
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

  async editCongTrinhNho(useDto: CongTrinhNhoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/congtrinh-quymo-nho`, {
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

  async deleteCongTrinhNho(useDto: CongTrinhNhoModel) {
    const res = await useFetch<RestData<number>>(`${this.baseApiUrl}/api/congtrinh-quymo-nho`, {
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
const CongTrinhNhoService = new _CongTrinhNhoService();
export { CongTrinhNhoService };
