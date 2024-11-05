import { BaseService } from '../base.service';
import type { RestData, RestPagedDataTable } from '../../models/base-response.model.ts';
import type { TaiLieuModel } from '../../models/dto/request/tai-lieu/tai-lieu.model';
import type { FilterTaiLieuDatatable } from '../../models/dto/request/filter/filter-tai-lieu-datatable.model';
import type { ChartData } from '~/packages/main/models/dto/request/thong-ke-hoat-dong-dao-tao/ke-hoach-dao-tao.model';

const BASE_URL = '/api/tai-lieu';
const DATATABLE_URL = `${BASE_URL}/datatable`;
class _TaiLieuService extends BaseService {
  async datatable(filter: FilterTaiLieuDatatable) {
    const response = await $api<RestPagedDataTable<TaiLieuModel[]>>(`${this.baseApiUrl}${DATATABLE_URL}`, {
      method: 'POST',
      body: filter,
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response;
    }

    return null;
  }

  async GetList() {
    const response = await $api<RestPagedDataTable<TaiLieuModel[]>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'GET',
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response.data;
    }

    return [];
  }

  async getItem(id: number) {
    const response = await $api<RestData<TaiLieuModel>>(`${this.baseApiUrl}${BASE_URL}/${id}`, {
      method: 'GET',
    });

    if (response && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }

  async insert(entity: TaiLieuModel) {
    const response = await $api<RestData<TaiLieuModel>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    if (response) {
      return response;
    }

    return null;
  }

  async update(entity: TaiLieuModel) {
    const response = await $api<RestData<TaiLieuModel>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    if (response) {
      return response;
    }

    return null;
  }

  async delete(entity: TaiLieuModel) {
    const response = await $api<RestData<TaiLieuModel>>(`${this.baseApiUrl}${BASE_URL}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });

    if (response) {
      return response;
    }

    return null;
  }

  async DowloadFile(id: number, filename: string) {
    const response = await $api(`${this.baseApiUrl}${BASE_URL}/${id}/download`, {
      method: 'GET',
    });
    if (response) {
      const URL = window.URL || window.webkitURL;
      const downloadUrl = URL.createObjectURL(response as Blob);

      if (filename) {
        // use HTML5 a[download] attribute to specify filename
        const a = document.createElement('a');
        // safari doesn't support this yet
        if (typeof a.download === 'undefined') {
          window.open(downloadUrl);
        }
        else {
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
        }
      }
      else {
        window.open(downloadUrl);
      }

      setTimeout(function () {
        URL.revokeObjectURL(downloadUrl);
      }, 100); // cleanup
    }
  }

  async ChartTinhTrang(giaiDoanId?: number, nam?: number, capTaiLieuId?: number, phanloaiId?: number) {
    const res = await $fetch<RestData<ChartData>>(`${this.baseApiUrl}/api/tai-lieu/tinh-trang/chart`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        giaiDoanId: giaiDoanId,
        nam: nam,
        capTaiLieuId: capTaiLieuId,
        phanloaiId: phanloaiId,
      },
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const TaiLieuService = new _TaiLieuService();
export { TaiLieuService };
