import { BaseFilter } from '../base-filter';

class FilterHoatDongDaoTaoDatatable extends BaseFilter {
  provinceCode?: string;
  nguonKinhPhiId?: number;
  donViTaiTroId?: number;
  noiDungTapHuanId?: number;
  doiTuongTapHuanId?: number;
  phuongThucTapHuanId?: number;
  from?: Date;
  to?: Date;
  listNguonKinhPhiId?: Array<number>;
  listDonViTaiTroId?: Array<number>;
  listNoiDungTapHuanId?: Array<number>;
  listDoiTuongTapHuanId?: Array<number>;
  listPhuongThucTapHuanId?: Array<number>;
  listLoaiHinhDaoTaoId?: Array<number>;

  constructor(
    first: number,
    rows: number,
    page: number,
    sortField: string,
    sortOrder: string,
    keyword: string,
    provinceCode: string,
    nguonKinhPhiId: number,
    donViTaiTroId: number,
    noiDungTapHuanId: number,
    doiTuongTapHuanId: number,
    phuongThucTapHuanId: number,
    from: Date,
    to: Date,
    listNguonKinhPhiId: Array<number>,
    listDonViTaiTroId: Array<number>,
    listNoiDungTapHuanId: Array<number>,
    listDoiTuongTapHuanId: Array<number>,
    listPhuongThucTapHuanId: Array<number>,
    listLoaiHinhDaoTaoId: Array<number>,
  ) {
    super();
    this.first = first;
    this.rows = rows;
    this.page = page;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.keyword = keyword;
    this.provinceCode = provinceCode;
    this.nguonKinhPhiId = nguonKinhPhiId;
    this.donViTaiTroId = donViTaiTroId;
    this.noiDungTapHuanId = noiDungTapHuanId;
    this.doiTuongTapHuanId = doiTuongTapHuanId;
    this.phuongThucTapHuanId = phuongThucTapHuanId;
    this.from = from;
    this.to = to;
    this.listNguonKinhPhiId = listNguonKinhPhiId;
    this.listDonViTaiTroId = listDonViTaiTroId;
    this.listNoiDungTapHuanId = listNoiDungTapHuanId;
    this.listDoiTuongTapHuanId = listDoiTuongTapHuanId;
    this.listPhuongThucTapHuanId = listPhuongThucTapHuanId;
    this.listLoaiHinhDaoTaoId = listLoaiHinhDaoTaoId;
  }
}

export { FilterHoatDongDaoTaoDatatable };
