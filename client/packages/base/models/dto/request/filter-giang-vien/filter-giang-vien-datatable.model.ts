import type { RegionModel } from '../../../region.model';
import { BaseFilter } from '../base-filter';

class FilterGiangVienDatatable extends BaseFilter {
  provinceCode?: string;
  capGiangVienId?: number;
  listProvinceCode?: Array<RegionModel>;

  constructor(
    provinceCode: string,
    capGiangVienId: number,
    first: number,
    rows: number,
    page: number,
    sortField: string,
    sortOrder: string,
    keyword: string,
    listProvinceCode?: Array<RegionModel>,
  ) {
    super();
    this.first = first;
    this.rows = rows;
    this.page = page;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.keyword = keyword;
    this.provinceCode = provinceCode;
    this.capGiangVienId = capGiangVienId;
    this.listProvinceCode = listProvinceCode;
  }
}

export { FilterGiangVienDatatable };
