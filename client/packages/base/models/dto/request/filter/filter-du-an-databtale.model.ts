import type { BaseCategoryModel } from '../../response/categories/category.model';

class FilterDuAnDatatableDTO {
  rows: number;
  first: number;
  keyword?: string;
  nguonKinhPhi?: BaseCategoryModel;
  toChuc?: BaseCategoryModel;
  hoatDongChinh?: BaseCategoryModel;
  tongKinhPhi?: BaseCategoryModel;
  from?: Date;
  to?: Date;
  sortField?: string;
  sortOrder?: string;
  // nguonKinhPhiId?: number;
  // toChucId?: number;
  // hoatDongChinhId?: number;
  // tongKinhPhiId?: number;
  listNguonKinhPhiId?: Array<number>;
  listToChucId?: Array<number>;
  listHoatDongChinhId?: Array<number>;
  listTongKinhPhiId?: Array<number>;
  constructor(
    rows: number,
    first: number,
    keyword?: string,
    nguonKinhPhi?: BaseCategoryModel,
    toChuc?: BaseCategoryModel,
    hoatDongChinh?: BaseCategoryModel,
    tongKinhPhi?: BaseCategoryModel,
    from?: Date,
    to?: Date,
    sortField?: string,
    sortOrder?: string,
    listNguonKinhPhiId?: Array<number>,
    listToChucId?: Array<number>,
    listHoatDongChinhId?: Array<number>,
    listTongKinhPhiId?: Array<number>,
  ) {
    this.rows = rows;
    this.first = first;
    this.keyword = keyword;
    this.nguonKinhPhi = nguonKinhPhi;
    this.toChuc = toChuc;
    this.hoatDongChinh = hoatDongChinh;
    this.tongKinhPhi = tongKinhPhi;
    this.from = from;
    this.to = to;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.listNguonKinhPhiId = listNguonKinhPhiId;
    this.listToChucId = listToChucId;
    this.listHoatDongChinhId = listHoatDongChinhId;
    this.listTongKinhPhiId = listTongKinhPhiId;
  }
}
export { FilterDuAnDatatableDTO };
