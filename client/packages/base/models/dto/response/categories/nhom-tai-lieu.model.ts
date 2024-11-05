import type { BaseCategoryModel } from './category.model';
import type { PhanLoaiTaiLieuModel } from './phan-loai-tai-lieu.model';

interface NhomTaiLieuModel extends BaseCategoryModel {
  parent_id?: number;
  listPhanLoaiTaiLieu: PhanLoaiTaiLieuModel;
}

export type { NhomTaiLieuModel };
