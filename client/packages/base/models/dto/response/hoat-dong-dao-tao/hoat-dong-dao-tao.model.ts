import type { RegionModel } from '../../../region.model';
import type { HocVien } from '../../request/hoatdong-daotao/hoc-vien.model';
import type { TaiLieuTapHuan } from '../../request/hoatdong-daotao/tai-lieu-tap-huan.model';
import type { BaseCategoryModel } from '../categories/category.model';
import type { NoiDungDaoTaoModel } from '../noidung-daotao/noidung-daotao.model';

interface HoatDongDaoTaoModel {
  id: number;
  ten_khoa: string;
  province_code: string;
  thoigian_batdau?: Date;
  thoigian_ketthuc?: Date;
  soluong_hocvien?: number;
  nguon_kinhphi_id: number;
  donvi_taitro_id: number;
  noidung_taphuan_id: number;
  doituong_taphuan_id: number;
  phuongthuc_taphuan_id: number;
  loaihinh_daotao_id: number;
  listHocVien: Array<HocVien>;
  listTailieuTaphuan: Array<TaiLieuTapHuan>;
  province: RegionModel;
  nguonKinhPhi: BaseCategoryModel;
  donViTaiTro: BaseCategoryModel;
  noiDungTapHuan: Array<NoiDungDaoTaoModel>;
  doiTuongTapHuan: BaseCategoryModel;
  phuongThucTapHuan: BaseCategoryModel;
  loaiHinhDaoTao: BaseCategoryModel;

}

export type { HoatDongDaoTaoModel };
