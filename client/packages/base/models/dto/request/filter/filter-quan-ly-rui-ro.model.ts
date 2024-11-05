class FilterQuanLyRuiRotableDTO {
  first?: number;
  rows?: number;
  page?: number;
  sortField?: string;
  sortOrder?: string;
  keyword?: string;
  provinceCode?: string;
  nguonKinhPhiId?: number;
  donViTaiTroId?: number;
  listProvinceCode?: Array<string>;
  listNguonKinhPhiId?: Array<number>;
  listDonViTaiTroId?: Array<number>;
  listKinhPhi?: Array<number>;

  constructor(
    first: number,
    rows: number,
    sortField?: string,
    sortOrder?: string,
    keyword?: string,
    provinceCode?: string,
    nguonKinhPhiId?: number,
    donViTaiTroId?: number,
    listProvinceCode?: Array<string>,
    listNguonKinhPhiId?: Array<number>,
    listDonViTaiTroId?: Array<number>,
    listKinhPhi?: Array<number>,
  ) {
    this.first = first;
    this.rows = rows;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.keyword = keyword;
    this.provinceCode = provinceCode;
    this.nguonKinhPhiId = nguonKinhPhiId;
    this.donViTaiTroId = donViTaiTroId;
    this.listProvinceCode = listProvinceCode;
    this.listNguonKinhPhiId = listNguonKinhPhiId;
    this.listDonViTaiTroId = listDonViTaiTroId;
    this.listKinhPhi = listKinhPhi;
  }
}
export { FilterQuanLyRuiRotableDTO };
