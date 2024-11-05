import type { BaseCategoryModel } from './category.model';

interface PhanLoaiTaiLieuModel extends BaseCategoryModel {
  parent_id?: number;
  nhom_tailieu_id: number;
}

export type { PhanLoaiTaiLieuModel };
