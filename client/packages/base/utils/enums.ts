enum EnumStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}
enum EnumState {
  Active = 'Đang hoạt động',
  Locked = 'Đang khóa',
}

enum EnumKieuDuLieuGiamSat {
  DuLieuQuanTrac = 1,
  DuLieuCanhBao = 2,
  DuLieuPCTT = 3,
  DuLieuDeDieu = 4,
}

enum EnumOptionQuanTracMua {
  None = 0,
  MuaDem = 4,
  Mua3Ngay = 5,
  Mua7Ngay = 6,
}
enum EnumObsHour {
  Obs1 = 1,
  Obs7 = 7,
  Obs13 = 13,
  Obs19 = 19,
}
enum EnumLoaiNhomNguonDL {
  Mua = 5,
  MucNuoc = 6,
  Gio = 7,
  NhietDo = 8,
  HoThuyLoi = 9,
  HoThuyDien = 10,
}
enum EnumLoaiQuanTrac {
  Mua = 1,
  MucNuoc = 2,
  Gio = 3,
  NhietDo = 4,
  HoThuyLoi = 5,
  HoThuyDien = 6,
}

enum EnumMedia {
  uploadImage = '/_upload/images',
  uploadDocument = '/_upload/documents',
  getImage = '/_images/media',
  getDocument = '/_documents',
}
export {
  EnumStatus,
  EnumState,
  EnumKieuDuLieuGiamSat,
  EnumOptionQuanTracMua,
  EnumObsHour,
  EnumLoaiNhomNguonDL,
  EnumLoaiQuanTrac,
  EnumMedia,
};
