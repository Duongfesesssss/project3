import type { RestBase, RestData } from '../models/base-response.model';
import type { UserAuthModel } from '../models/dto/response/auth/user-auth.model';
import type {
  UserAuthChangePasswordDTO,
  UserAuthDTO,
  UserAuthResetPasswordDTO,
  UserAuthResetAndChangePasswordDTO,
} from '../models/dto/request/auth/user-auth.model';
import { BaseService } from './base.service';

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
  }


const AuthService = new _AuthService();
export { AuthService };
