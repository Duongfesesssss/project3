export class UserByGroup {
  constructor() {
    this.id = '';
    this.username = '';
  }

  id?: string;
  username?: string;
}

export class UserModel {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  unit?: string;
  position?: string;
  password?: string;
  confirmPassword?: string;
  avatarPath?: string;
  groupId?: number;
  roleId?: number;
  cmnd?: string;
  notification?: string;
  provinceCode?: number;
  districtCode?: number;
  communeCode?: number;

  constructor(
    userId: string,
    userName: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    unit: string,
    position: string,
    password: string,
    confirmPassword: string,
    avatarPath: string,
    groupId: number,
    roleId: number,
    cmnd: string,
    provinceCode: number,
    districtCode: number,
    communeCode: number,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.unit = unit;
    this.position = position;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.avatarPath = avatarPath;
    this.groupId = groupId;
    this.roleId = roleId;
    this.cmnd = cmnd;
    this.provinceCode = provinceCode;
    this.districtCode = districtCode;
    this.communeCode = communeCode;
  }
}

export interface UserInfo {
  user_id?: string;
  address?: null;
  full_name?: string;
  province_code?: string;
  district_code?: string;
  commune_code?: string;
  province?: null;
  district?: null;
  commune?: null;
}
