class FilterKeHoachDatatableDTO {
  first?: number;
  rows?: number;
  keyword?: string;
  sortField?: string;
  sortOrder?: string;
  donViPhatHanhId?: number;
  nhomTaiLieuId?: number;
  giaiDoanId?: number;
  phanLoaiTaiLieuId?: number;
  from?: Date;
  to?: Date;
  province_code?: string;
  district_code?: string;
  commune_code?: string;
  listNamTaiLieu?: Array<number>;
  listGiaiDoanId?: Array<number>;
  constructor(
    first: number,
    rows: number,
    keyword?: string,
    sortField?: string,
    sortOrder?: string,
    donViPhatHanhId?: number,
    nhomTaiLieuId?: number,
    giaiDoanId?: number,
    phanLoaiTaiLieuId?: number,
    from?: Date,
    to?: Date,
    province_code?: string,
    district_code?: string,
    commune_code?: string,
  ) {
    this.first = first;
    this.rows = rows;
    this.keyword = keyword;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.donViPhatHanhId = donViPhatHanhId;
    this.nhomTaiLieuId = nhomTaiLieuId;
    this.giaiDoanId = giaiDoanId;
    this.phanLoaiTaiLieuId = phanLoaiTaiLieuId;
    this.from = from;
    this.to = to;
    this.province_code = province_code;
    this.district_code = district_code;
    this.commune_code = commune_code;
  }
}

export { FilterKeHoachDatatableDTO };
