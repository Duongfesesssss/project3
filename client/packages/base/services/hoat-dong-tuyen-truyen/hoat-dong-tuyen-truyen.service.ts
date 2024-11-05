import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { FilterHoatDongTuyenTruyenDatatable } from '../../models/dto/request/filter/filte-hoat-dong-tuyen-truyen-datatable.model';
import type { HoatDongTuyenTruyenDTO } from '../../models/dto/request/hoatdong-tuyentruyen/hoat-dong-tuyen-truyen.model';
import type { HoatDongDaoTaoChiTietModel } from '../../models/dto/response/categories/hoat-dong-dao-tao-chi-tiet.model';
import type { HoatDongTuyenTruyenModel } from '../../models/dto/response/hoat-dong-tuyen-truyen/hoat-dong-tuyen-truyen.model';
import { BaseService } from '../base.service';
import type { HoatDongTuyenTruyenChartModel } from '~/packages/main/models/dto/request/thong-ke-hoat-dong-dao-tao/ke-hoach-dao-tao.model';

const URL = '/api/hoatdong-truyenthong';
const DATATABLE_URL = `${URL}/datatable`;
const TABLE_URL = `${URL}/public/table`;

class _HoatDongTuyenTruyenService extends BaseService {
  async datatable(body: FilterHoatDongTuyenTruyenDatatable) {
    const res = await $api<RestPagedDataTable<HoatDongTuyenTruyenModel[]>>(`${this.baseApiUrl}${DATATABLE_URL}`, {
      method: 'POST',
      body: body,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async insert(entity: HoatDongTuyenTruyenDTO) {
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

  async update(entity: HoatDongTuyenTruyenDTO) {
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

  async delete(entity: HoatDongTuyenTruyenDTO) {
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

  // api load dữ liệu ở main
  async getHoatDongTuyenTruyenTable(filter: FilterHoatDongTuyenTruyenDatatable) {
    const res = await $api<RestPagedDataTable<HoatDongTuyenTruyenModel[]>>(
      `${this.baseApiUrl}${TABLE_URL}`, {
        method: 'POST',
        body: filter,
      });

    if (res && res.status == EnumStatus.OK) {
      return res;
    }

    return null;
  }

  async getChartHoatDongTuyenTruyen(data: FilterHoatDongTuyenTruyenDatatable) {
    const res = await $fetch<RestPagedDataTable<HoatDongTuyenTruyenChartModel>>(
      `${this.baseApiUrl}${URL}/public/chart`,
      {
        method: 'POST',
        headers: {
          Authorization: this.getAccessToken(),
        },
        body: JSON.stringify(data),
      },
    );

    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async getSummarize(data: FilterHoatDongTuyenTruyenDatatable) {
    const res = await $fetch<RestPagedDataTable<HoatDongDaoTaoChiTietModel[]>>(
      `${this.baseApiUrl}${URL}/public/summarize`,
      {
        method: 'POST',
        headers: {
          Authorization: this.getAccessToken(),
        },
        body: JSON.stringify(data),
      },
    );

    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const HoatDongTuyenTruyenService = new _HoatDongTuyenTruyenService();
export { HoatDongTuyenTruyenService };
