export class HoatDongDaoTaoChiTietModel {
  mo_ta?: string;
  soluong_hoatdong?: number;
  so_luong_nam?: number;
  so_luong_nu?: number;
  so_luong_dbtt?: number;

  constructor(
    mo_ta?: string,
    soluong_hoatdong?: number,
    so_luong_nam?: number,
    so_luong_nu?: number,
    so_luong_dbtt?: number,
  ) {
    this.mo_ta = mo_ta;
    this.soluong_hoatdong = soluong_hoatdong;
    this.so_luong_nam = so_luong_nam;
    this.so_luong_nu = so_luong_nu;
    this.so_luong_dbtt = so_luong_dbtt;
  }
}
