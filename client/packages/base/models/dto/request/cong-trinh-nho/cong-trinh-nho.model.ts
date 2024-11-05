import type { RegionModel } from '../../../region.model';
import type { BaseCategoryModel } from '../../response/categories/category.model';

class CongTrinhNhoModel {
  id?: number;
  ten_congtrinh?: string;
  lon?: number;
  lat?: number;
  dia_chi?: string;
  mo_ta?: string;
  kinh_phi?: number;
  donvi_taitro_id?: number;
  nguon_kinhphi_id?: number;
  province_code?: string;
  donViTaiTro?: BaseCategoryModel;
  nguonKinhPhi?: BaseCategoryModel;
  province?: RegionModel;

  constructor() {
    this.id = 0,
    this.ten_congtrinh = '';
  }
}

export { CongTrinhNhoModel };
