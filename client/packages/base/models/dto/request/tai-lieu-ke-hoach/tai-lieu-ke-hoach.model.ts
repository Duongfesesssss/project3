export interface TaiLieuKeHoach {
  id: number;
  tenfile_luutru: string;
  tenfile_goc: string;
  url: string;
  ten_tailieu: string;
  so_vanban: string;
  ghi_chu: null;
  ngay_phathanh: null;
  phanloai_tailieu_id: number;
  giaidoan_id: number;
  donvi_phathanh_id: number;
  province_code: string;
  district_code: string;
  commune_code: string;
  giaiDoan: GiaiDoan;
  donViPhatHanh: GiaiDoan;
  phanLoaiTaiLieu: PhanLoaiTaiLieu;
}

export interface GiaiDoan {
  id: number;
  mo_ta: string;
}
export interface PhanLoaiTaiLieu {
  id: number;
  mo_ta: string;
  parent_id: null;
  nhom_tailieu_id: number;
  dm_nhom_tailieu: DmNhomTailieu;
}
export interface DmNhomTailieu {
  id: number;
  mo_ta: string;
  parent_id: null;
  listPhanloaiTailieu: null[];
}
export interface province {
  area_id: string;
  name_vn: string;
  parent_id: string;
  visible: boolean;
}
export interface district {
  area_id: string;
  name_vn: string;
  parent_id: string;
  visible: boolean;
  province: province;
  geo_json: string;
}
export interface commune {
  area_id: string;
  name_vn: string;
  parent_id: string;
  province_code: string;
  district: district;
  search_content: null;
  geo_json: string;
}
