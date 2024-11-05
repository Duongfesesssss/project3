import type { RestData, RestPagedDataTable } from '../../models/base-response.model';
import type { FilterHoatDongDaoTaoDatatable } from '../../models/dto/request/filter/filte-hoat-dong-dao-tao-datatable.model';
import type { HoatDongDaoTaoDTO } from '../../models/dto/request/hoatdong-daotao/hoat-dong-dao-tao.model';
import type { HoatDongDaoTaoModel } from '../../models/dto/response/hoat-dong-dao-tao/hoat-dong-dao-tao.model';
import { BaseService } from '../base.service';

const URL = '/api/hoatdong-daotao';
const DATATABLE_URL = `${URL}/datatable`;
const DOITUONG_TRUYENTHONG_DATATABLE_URL = '/api/hoatdong-truyenthong/datatable';

class _HoatDongDaoTaoService extends BaseService {
  async datatable(body: FilterHoatDongDaoTaoDatatable) {
    const res = await $api<RestPagedDataTable<HoatDongDaoTaoModel[]>>(`${this.baseApiUrl}${DATATABLE_URL}`, {
      method: 'POST',
      body: body,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async insert(entity: HoatDongDaoTaoDTO) {
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

  async update(entity: HoatDongDaoTaoDTO) {
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

  async delete(entity: HoatDongDaoTaoDTO) {
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

  async truyenThongDatatable(body: FilterHoatDongDaoTaoDatatable) {
    const res = await $api<RestPagedDataTable<HoatDongDaoTaoModel[]>>(`${this.baseApiUrl}${DOITUONG_TRUYENTHONG_DATATABLE_URL}`, {
      method: 'POST',
      body: body,
    });
    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const HoatDongDaoTaoService = new _HoatDongDaoTaoService();
export { HoatDongDaoTaoService };
