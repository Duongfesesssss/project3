class FilterCongCuHoTroDatatableDTO {
  rows: number;
  first: number;
  page: number;
  keyword?: string;
  from?: Date;
  to?: Date;
  sortField?: string;
  sortOrder?: string;
  nguonKinhPhiId?: number;
  donViTaiTroId?: number;
  provinceCode?: string;
  listNguonKinhPhiId?: Array<number>;
  listDonViTaiTroId?: Array<number>;
  listLoaiCongCuId?: Array<number>;
  listKinhPhi?: Array<number>;
  listProvinceCode?: Array<string>;
  constructor(
    rows: number,
    first: number,
    page: number,
    keyword?: string,
    from?: Date,
    to?: Date,
    sortField?: string,
    sortOrder?: string,
    nguonKinhPhiId?: number,
    donViTaiTroId?: number,
    provinceCode?: string,
    listNguonKinhPhiId?: Array<number>,
    listDonViTaiTroId?: Array<number>,
    listLoaiCongCuId?: Array<number>,
    listKinhPhi?: Array<number>,
    listProvinceCode?: Array<string>,
  ) {
    this.rows = rows;
    this.first = first;
    this.page = page;
    this.keyword = keyword;
    this.from = from;
    this.to = to;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.nguonKinhPhiId = nguonKinhPhiId;
    this.donViTaiTroId = donViTaiTroId;
    this.provinceCode = provinceCode;
    this.listNguonKinhPhiId = listNguonKinhPhiId;
    this.listDonViTaiTroId = listDonViTaiTroId;
    this.listLoaiCongCuId = listLoaiCongCuId;
    this.listKinhPhi = listKinhPhi;
    this.listProvinceCode = listProvinceCode;
  }
}
export { FilterCongCuHoTroDatatableDTO };
