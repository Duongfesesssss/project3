import type { ProvinceModel } from '../../cms/models/region.model';
import type { RegionModel } from '../models/region.model';
import { BaseService } from './base.service';
import type { RestData, RestPagedDataTable } from '~/packages/base/models/base-response.model';

const baseRegionUrl = '/api/region';
const provincetUrl = `${baseRegionUrl}/provinces`;
const districtUrl = `${baseRegionUrl}/districts`;
const communeUrl = `${baseRegionUrl}/communes`;

class _RegionService extends BaseService {
  // service load dữ liệu của vùng
  async listRegion(p: string = ''): Promise<RegionModel[]> {
    const res = await $fetch<RestData<RegionModel[]>>(`${this.baseApiUrl}${baseRegionUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        p: p,
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // service load dữ liệu của tỉnh
  async GetProvinces(regionCode?: string): Promise<ProvinceModel[]> {
    const res = await $fetch<RestData<ProvinceModel[]>>(`${this.baseApiUrl}${provincetUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        regionCode: regionCode,
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // service load dữ liệu của quận, huyện
  async listDistrict(parent_id?: string): Promise<RegionModel[]> {
    const res = await $fetch<RestData<RegionModel[]>>(`${this.baseApiUrl}${districtUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        parent_id: parent_id,
      },
    });
    if (res && res.status == EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // service load dữ liệu của phường, xã
  async listCommune(parent_id?: string): Promise<RegionModel[]> {
    const res = await useFetch<RestPagedDataTable<RegionModel[]>>(`${this.baseApiUrl}${communeUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
      params: {
        parent_id: parent_id,
      },
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value.data;
    }
    return [];
  }

  // service lấy dữ liệu một hành chính theo id
  public async getRegion(areaCode: string): Promise<RegionModel> {
    const response = await $fetch<RestData<RegionModel>>(`${this.baseApiUrl}${baseRegionUrl}/${areaCode}`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `${this.getAccessToken()}`,
      }),
    });

    if (response && response.status === EnumStatus.OK) {
      return response.data;
    }

    return {};
  }
}

const RegionService = new _RegionService();
export { RegionService };
