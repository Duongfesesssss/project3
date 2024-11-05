import type { BaseCategoryModel } from '../../../response/categories/category.model';
import type { RegionModel } from '~/packages/base/models/region.model';

class FilterBaoCaoDatatableDTO {
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
  regionCode?: string;
  districtCode?: string;
  capTaiLieuId?: number;
  regionCodes?: Array<RegionModel>;
  provinceCodes?: Array<RegionModel>;
  listGiaiDoanId?: Array<number>;
  listDonViPhatHanhId?: Array<number>;
  listNamTaiLieu?: Array<number>;
  listNgayBanHanh?: Array<Date>;
  listNgayHieuLuc?: Array<Date>;
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
    capTaiLieuId: number,
    regionCodes: Array<RegionModel>,
    provinceCodes: Array<RegionModel>,
    listGiaiDoanId?: Array<BaseCategoryModel>,
    listDonViPhatHanhId?: Array<number>,
    listNamTaiLieu?: Array<number>,
    listNgayBanHanh?: Array<Date>,
    listNgayHieuLuc?: Array<Date>,
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
    this.provinceCodes = provinceCodes;
    this.regionCodes = regionCodes;
    this.listGiaiDoanId = listGiaiDoanId;
    this.listDonViPhatHanhId = listDonViPhatHanhId;
    this.listNamTaiLieu = listNamTaiLieu;
    this.listNgayBanHanh = listNgayBanHanh;
    this.listNgayHieuLuc = listNgayHieuLuc;
  }
}

export { FilterBaoCaoDatatableDTO };
