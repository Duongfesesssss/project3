class UserAuthModel {
  id?: string;
  user_name?: string;
  email?: string;
  phone_number?: string;
  avatar_path?: string;
  unread_notification_count?: number;
  lockout_end?: Date;
  lockout_enabled?: boolean;
  notification?: boolean;
  citizen_identity?: null;
  last_login?: Date;
  approved?: null;
  groups?: object[];
  unit?: null;
  user_info?: UserInfo;
}

export interface UserInfo {
  user_id?: null;
  address?: null;
  full_name?: null;
  district_code?: null;
  commune_code?: null;
  province?: null;
  district?: null;
  commune?: null;
}
export { UserAuthModel };
