import type { RestBase, RestData } from '../models/base-response.model';
import type { UserAuthModel } from '../models/dto/response/auth/user-auth.model';
import type {
  UserAuthChangePasswordDTO,
  UserAuthDTO,
  UserAuthResetPasswordDTO,
  UserAuthResetAndChangePasswordDTO,
} from '../models/dto/request/auth/user-auth.model';
import { BaseService } from './base.service';
import { $api } from '~/packages/base/composables/useApi';
import { EnumStatus } from '../utils/enums';

class _AuthService extends BaseService {
  async getUserAuth() {
    const res = await useFetch<RestData<UserAuthModel>>(
      `${this.baseApiUrl}/api/auth/user`,
      {
        method: 'GET',
        headers: {
          Authorization: `${this.getAccessToken()}`,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return {};
  }

  async updateUserAuth(userDto: UserAuthDTO) {
    const res = await useFetch<RestData<UserAuthModel>>(
      `${this.baseApiUrl}/api/auth/user`,
      {
        method: 'POST',
        body: userDto,
        headers: {
          Authorization: `${this.getAccessToken()}`,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value.data;
    }
    return {};
  }

  async changePasswordUserAuth(userDto: UserAuthChangePasswordDTO) {
    const res = await useFetch<RestBase>(
      `${this.baseApiUrl}/api/auth/change-password`,
      {
        method: 'POST',
        body: userDto,
        headers: {
          Authorization: `${this.getAccessToken()}`,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.status;
    }
    return EnumStatus.ERROR;
  }

  async resetPasswordUserAuth(userDto: UserAuthResetPasswordDTO) {
    const res = await useFetch<RestBase>(
      `${this.baseApiUrl}/api/auth/reset-password`,
      {
        method: 'POST',
        body: userDto,
        headers: {
          Authorization: `${this.getAccessToken()}`,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      console.log(res);
      return res.status;
    }
    return EnumStatus.ERROR;
  }

  async resetAndChangePasswordUserAuth(userDto: UserAuthResetAndChangePasswordDTO) {
    const res = await useFetch<RestBase>(
      `${this.baseApiUrl}/api/auth/reset-password`,
      {
        method: 'PUT',
        body: userDto,
        headers: {
          Authorization: `${this.getAccessToken()}`,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      console.log(res);
      return res.status;
    }
    return EnumStatus.ERROR;
  }

  async signUp(userDto: UserAuthDTO) {
    const res = await useFetch<RestBase>(
      `${this.baseApiUrl}/api/auth/register`,
      {
        method: 'POST',
        body: userDto,
      },
    );
    
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      console.log('Đăng ký thành công:', res.data.value);
      return res.data.value;
    }
    console.error('Đăng ký thất bại:', res);
    return EnumStatus.ERROR;
  }

  // async signIn(userDto: { email: string; password: string }) {
  //     const res = await useFetch<RestBase>(
  //       `${this.baseApiUrl}/api/auth/login`,
  //       {
  //         method: 'POST',
  //         body: userDto,
  //       },
  //     );
  
  //     if (res != null && res.data.value?.status === EnumStatus.OK) {
  //       console.log('Đăng nhập thành công:', res.data.value);
  //       return res.data.value; // Trả về dữ liệu từ API
  //     }
  
  //     console.error('Đăng nhập thất bại:', res);
  //     return { status: 'error', message: res?.data?.value};
  //   }

  /**
   * Lấy thông tin profile người dùng hiện tại
   */
  async getProfile() {
    try {
      const response = await $api('/api/auth/profile') as any;
      return response;
    } catch (error) {
      console.error('Lỗi getProfile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin profile
   */
  async updateProfile(data: { user_name: string; full_name: string; phone: string; address: string }) {
    try {
      const response = await $api('/api/auth/update-profile', {
        method: 'PUT',
        body: data
      }) as any;
      return response;
    } catch (error) {
      console.error('Lỗi updateProfile:', error);
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: { current_password: string; new_password: string; confirm_password: string }) {
    try {
      const response = await $api('/api/auth/change-password', {
        method: 'PUT',
        body: data
      }) as any;
      return response;
    } catch (error) {
      console.error('Lỗi changePassword:', error);
      throw error;
    }
  }
}


const AuthService = new _AuthService();
export { AuthService };
