import type { BaseCategoryModel } from '../../response/categories/category.model';

class FilterCongTrinhNhotableDTO {
  first?: number;
  rows?: number;
  sortField?: string;
  sortOrder?: string;
  keyword?: string;
  nguonKinhPhiId?: number;
  nguonKinhPhi?: BaseCategoryModel;
  donViTaiTroId?: number;
  provinceCode?: string;
  constructor(
    first: number,
    rows: number,
    sortField?: string,
    sortOrder?: string,
    keyword?: string,
    nguonKinhPhiId?: number,
    nguonKinhPhi?: BaseCategoryModel,
    donViTaiTroId?: number,
    provinceCode?: string,

  ) {
    this.rows = rows;
    this.first = first;
    this.keyword = keyword;
    this.nguonKinhPhi = nguonKinhPhi;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.nguonKinhPhiId = nguonKinhPhiId;
    this.donViTaiTroId = donViTaiTroId;
    this.provinceCode = provinceCode;
  }
}
export { FilterCongTrinhNhotableDTO };
