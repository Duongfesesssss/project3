import type { CategoryModel } from '../../../../../cms/models/category.model';
import type { ProvinceModel } from '../../../../../cms/models/region.model';

class GiangVienModel {
  id?: number;
  ho_ten?: string;
  ngay_sinh?: Date;
  gioi_tinh?: boolean;
  la_nguoi_khuyettat?: boolean;
  coquan_tochuc?: string;
  trinhdo_chuyenmon?: string;
  dien_thoai?: string;
  email?: string;
  province_code?: string;
  cap_giangvien_id?: number;
  chuc_vu?: string;
  capGiangVien?: CategoryModel;
  province?: ProvinceModel;
  anh_daidien?: string;
  cv_url?: string;
  thoigian_daotao?: Date;
  thoigian_daotao_denngay?: Date;
  constructor() {
    this.id = 0;
    this.ngay_sinh = undefined,
    this.cap_giangvien_id = 0;
    this.chuc_vu = '';
    this.coquan_tochuc = '';
    this.la_nguoi_khuyettat = false;
    this.trinhdo_chuyenmon = '';
    this.thoigian_daotao = undefined;
    this.thoigian_daotao_denngay = undefined;
  }
}

export { GiangVienModel };
