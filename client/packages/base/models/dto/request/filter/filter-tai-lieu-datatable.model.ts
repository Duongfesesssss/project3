import { BaseFilter } from '../base-filter';

class FilterTaiLieuDatatable extends BaseFilter {
  donViPhatHanhId?: number;
  nhomTaiLieuId?: number;
  giaiDoanId?: number;
  phanLoaiTaiLieuId?: number;
  khoaTapHuanId?: number;
  duAnId?: number;
  regionCode?: string;
  provinceCode?: string;
  districtCode?: string;
  from?: Date;
  to?: Date;

  constructor(
    first: number,
    rows: number,
    page: number,
    sortField: string,
    sortOrder: string,
    keyword: string,
    donViPhatHanhId?: number,
    nhomTaiLieuId?: number,
    giaiDoanId?: number,
    phanLoaiTaiLieuId?: number,
    khoaTapHuanId?: number,
    duAnId?: number,
    regionCode?: string,
    provinceCode?: string,
    districtCode?: string,
    from?: Date,
    to?: Date,
  ) {
    super();
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
    this.khoaTapHuanId = khoaTapHuanId;
    this.duAnId = duAnId;
    this.regionCode = regionCode;
    this.provinceCode = provinceCode;
    this.districtCode = districtCode;
    this.from = from;
    this.to = to;
  }
}

export { FilterTaiLieuDatatable };
