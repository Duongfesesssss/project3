import type { BaseCategoryModel } from '../categories/category.model';

export class DuAnModel {
  id?: number;
  ten_duan?: string;
  tochuc_id?: number;
  thoigian_batdau?: Date;
  thoigian_ketthuc?: Date;
  nguon_kinhphi_id?: number;
  hoatdong_chinh_id?: number;
  sanpham_chinh?: string;
  tong_kinhphi_id?: number;
  dia_ban?: string;
  nguonKinhPhi?: BaseCategoryModel;
  toChuc?: BaseCategoryModel;
  hoatDongChinh?: BaseCategoryModel;
  tongKinhPhi?: BaseCategoryModel;
  constructor(id?: number, tochuc_id?: number, ten_duan?: string, thoigian_batdau?: Date, thoigian_ketthuc?: Date,
    nguon_kinhphi_id?: number, hoatdong_chinh_id?: number, sanpham_chinh?: string, tong_kinhphi_id?: number,
    dia_ban?: string, nguonKinhPhi?: BaseCategoryModel, toChuc?: BaseCategoryModel, hoatDongChinh?: BaseCategoryModel,
    tongKinhPhi?: BaseCategoryModel) {
    this.id = id;
    this.ten_duan = ten_duan;
    this.tochuc_id = tochuc_id;
    this.thoigian_batdau = thoigian_batdau;
    this.thoigian_ketthuc = thoigian_ketthuc;
    this.nguon_kinhphi_id = nguon_kinhphi_id;
    this.hoatdong_chinh_id = hoatdong_chinh_id;
    this.sanpham_chinh = sanpham_chinh;
    this.tong_kinhphi_id = tong_kinhphi_id;
    this.dia_ban = dia_ban;
    this.nguonKinhPhi = nguonKinhPhi;
    this.toChuc = toChuc;
    this.hoatDongChinh = hoatDongChinh;
    this.tongKinhPhi = tongKinhPhi;
  }
}
