import type { RegionModel } from '../../../region.model';
import type { BaseCategoryModel } from '../categories/category.model';

interface HocVienModel {
  id: number;
  ho_ten: string;
  gioi_tinh?: boolean;
  ngay_sinh?: Date;
  donvi_congtac: string;
  doituong_dbtt_id?: number;
  province_code?: string;
  district_code?: string;
  commune_code?: string;
  chuc_vu?: string;
  so_dienthoai?: string;
  email?: string;
  lop_taphuan_id: number;
  la_nguoi_khuyettat?: boolean;
  doiTuong?: BaseCategoryModel;
  province?: RegionModel;
  district?: RegionModel;
  commune?: RegionModel;
}

export type { HocVienModel };
