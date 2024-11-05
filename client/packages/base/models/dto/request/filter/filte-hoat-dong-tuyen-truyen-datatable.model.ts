import { BaseFilter } from '../base-filter';

class FilterHoatDongTuyenTruyenDatatable extends BaseFilter {
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
  listNoiDungTuyentruyenId?: Array<number>;
  listDoiTuongTuyentruyenId?: Array<number>;
}

export { FilterHoatDongTuyenTruyenDatatable };
