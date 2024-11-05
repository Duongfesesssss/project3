import type { RegionModel } from '../../../region.model';
import type { BaseCategoryModel } from '../categories/category.model';
import type { NoiDungTuyenTruyenModel } from '../noidung-tuyentruyen/noidung-tuyentruyen.model';

interface HoatDongTuyenTruyenModel {
  id: number;
  ten_hoatdong: string;
  ngay_batdau?: Date;
  ngay_ketthuc?: Date;
  province_code: string;
  soluong_nam?: number;
  soluong_nu?: number;
  soluong_dbtt?: number;
  mo_ta?: string;
  nguon_kinhphi_id: number;
  donvi_taitro_id: number;
  noidung_truyenthong_id: number;
  doituong_truyenthong_id: number;
  province: RegionModel;
  nguonKinhPhi: BaseCategoryModel;
  donViTaiTro: BaseCategoryModel;
  noidungTruyenthong: Array<NoiDungTuyenTruyenModel>;
  doituongTruyenthong: BaseCategoryModel;
}

export type { HoatDongTuyenTruyenModel };
