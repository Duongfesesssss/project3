class FilterKeHoachDatatableDTO {
  first?: number;
  rows?: number;
  page?: number;
  sortField?: string;
  sortOrder?: string;
  keyword?: string;
  donViPhatHanhId?: number;
  nhomTaiLieuId?: number;
  giaiDoanId?: number;
  phanLoaiTaiLieuId?: number;
  from?: Date;
  to?: Date;
  provinceCode?: string;
  districtCode?: string;
  regionCode?: string;
  capTaiLieuId?: number;

  constructor(
    first: number,
    rows: number,
    page: number,
    sortField: string,
    sortOrder: string,
    keyword: string,
    donViPhatHanhId: number,
    nhomTaiLieuId: number,
    giaiDoanId: number,
    phanLoaiTaiLieuId: number,
    from: Date,
    to: Date,
    provinceCode: string,
    districtCode: string,
    capTaiLieuId?: number,
  ) {
    this.first = first;
    this.rows = rows;
    this.page = page;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.keyword = keyword;
    this.donViPhatHanhId = donViPhatHanhId;
    this.nhomTaiLieuId = nhomTaiLieuId;
    this.giaiDoanId = giaiDoanId;
    this.phanLoaiTaiLieuId = phanLoaiTaiLieuId;
    this.from = from;
    this.to = to;
    this.provinceCode = provinceCode;
    this.districtCode = districtCode;
    this.capTaiLieuId = capTaiLieuId;
  }
}

export { FilterKeHoachDatatableDTO };
