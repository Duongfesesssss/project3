import type { TaiLieuModel } from '../../models/dto/request/tai-lieu/tai-lieu.model';
import type { FilterBaoCaoDatatableDTO } from '~/packages/base/models/dto/request/bao-cao/filer-bao-cao/filter-bao-cao.model.ts';
import type { RestPagedDataTable, RestData } from '~/packages/base/models/base-response.model';

import { BaseService } from '~/packages/base/services/base.service';
import type { ChartData } from '~/packages/main/models/dto/request/thong-ke-hoat-dong-dao-tao/ke-hoach-dao-tao.model';

class _BaoCaoService extends BaseService {
  async postBaoCaoDatatable(data: FilterBaoCaoDatatableDTO) {
    const res = await $fetch<RestPagedDataTable<TaiLieuModel>>(
      `${this.baseApiUrl}/api/tai-lieu/bao-cao/datatable`,
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

  async getBaoCaoChart(giaiDoanId?: number, namBaoCao?: number, capTaiLieuId?: number) {
    const res = await $fetch<RestData<ChartData>>(`${this.baseApiUrl}/api/tai-lieu/bao-cao/chart`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        giaiDoanId: giaiDoanId,
        nam: namBaoCao,
        capTaiLieuId: capTaiLieuId,
      },
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const BaoCaoService = new _BaoCaoService();
export { BaoCaoService };
