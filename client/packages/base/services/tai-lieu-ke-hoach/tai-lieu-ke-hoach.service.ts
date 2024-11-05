import type { TaiLieuKeHoach } from '~/packages/base/models/dto/request/tai-lieu-ke-hoach/tai-lieu-ke-hoach.model';
import type { FilterKeHoachDatatableDTO } from '~/packages/base/models/dto/request/tai-lieu-ke-hoach/filter-tai-lieu-ke-hoach/filter-ke-hoach.model';
import type { RestPagedDataTable, RestData } from '~/packages/base/models/base-response.model';
import { BaseService } from '~/packages/base/services/base.service';
import type { ChartData } from '~/packages/main/models/dto/request/thong-ke-hoat-dong-dao-tao/ke-hoach-dao-tao.model';

class _TaiLieuKeHoachService extends BaseService {
  async getTaiLieuKeHoachDatatable(data: FilterKeHoachDatatableDTO) {
    const res = await $fetch<RestPagedDataTable<TaiLieuKeHoach>>(`${this.baseApiUrl}/api/tai-lieu/ke-hoach/datatable`, {
      method: 'POST',
      headers: {
        Authorization: this.getAccessToken(),
      },
      body: JSON.stringify(data),
    });

    if (res && res.status == EnumStatus.OK) {
      return res;
    }
    return null;
  }

  async getTaiLieuKeHoachChart(giaiDoanId?: number, nam?: number, capTaiLieuId?: number) {
    const res = await $fetch<RestData<ChartData>>(`${this.baseApiUrl}/api/tai-lieu/ke-hoach/chart`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        giaiDoanId: giaiDoanId,
        nam: nam,
        capTaiLieuId: capTaiLieuId,
      },
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res;
    }
    return null;
  }
}

const TaiLieuKeHoachService = new _TaiLieuKeHoachService();
export { TaiLieuKeHoachService };
