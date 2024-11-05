export class CongCuHoTroDTO {
  id: number;
  ten_duan: string;
  thoigian_thuchien?: Date;
  donvi_taitro_id?: number;
  nguon_kinhphi_id?: number;
  loai_congcu_id?: number;
  province_code?: string;
  mo_ta?: string;
  so_luong?: number;
  constructor(
    id: number,
    ten_duan: string,
    thoigian_thuchien?: Date,
    donvi_taitro_id?: number,
    nguon_kinhphi_id?: number,
    province_code?: string,
    loai_congcu_id?: number,
    mo_ta?: string,
    so_luong?: number,
  ) {
    this.id = id;
    this.ten_duan = ten_duan;
    this.thoigian_thuchien = thoigian_thuchien;
    this.donvi_taitro_id = donvi_taitro_id;
    this.nguon_kinhphi_id = nguon_kinhphi_id;
    this.province_code = province_code;
    this.loai_congcu_id = loai_congcu_id;
    this.mo_ta = mo_ta;
    this.so_luong = so_luong;
  }
}
