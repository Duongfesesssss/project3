import { BaseFilter } from '../base-filter';

class FilterHocVienDatatable extends BaseFilter {
  provinceCode?: string;
  districtCode?: string;
  communeCode?: string;
  doiTuongId?: number;
  lopTapHuanId?: number;

  constructor(
    first: number,
    rows: number,
    page: number,
    sortField: string,
    sortOrder: string,
    keyword: string,
    provinceCode: string,
    doiTuongId: number,
    lopTapHuanId: number,
  ) {
    super();
    this.first = first;
    this.rows = rows;
    this.page = page;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.keyword = keyword;
    this.provinceCode = provinceCode;
    this.doiTuongId = doiTuongId;
    this.lopTapHuanId = lopTapHuanId;
  }
}

export { FilterHocVienDatatable };
