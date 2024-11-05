import { BaseService } from './base.service';
import type { ChangePasswordUserDTO } from './../models/dto/request/user/change-password-user.model';
import type { UserDTO } from './../models/dto/request/user/create-user.model';
import type { SavePermissionsDTO } from './../models/dto/request/user/save-permissions-user.model';
import type { RestBase, RestData } from './../models/base-response.model.js';
import type { UserModel, UserByGroup } from './../models/dto/response/user/user.model';

class _UserService extends BaseService {
  async listByGroup(id: string = ''): Promise<UserByGroup[]> {
    const res = await $api<RestData<UserByGroup[]>>(
      '/api/user/list-by-group',
      {
        method: 'GET',
        params: {
          groupId: id,
        },
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  async getUserList(
    searchKey?: string,
    group_id?: string,
  ) {
    const res = await $api<RestData<UserModel>>(`/api/user/list`, {
      method: 'POST',
      body: {
        draw: 1,
        filter: 0,
        columns: [],
        order: [],
        start: 0,
        length: 100,
        search: {
          value: searchKey,
        },
        group_id: group_id,
      },
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
    console.log('fullres', res);
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  async getUserByUsername(user_name: string) {
    const res = await $api<RestData<UserModel>>(`/api/user/${user_name}`, {
      method: 'GET',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return {};
  }

  async createUser(user: UserDTO) {
    const res = await useFetch<RestData<number>>(`/api/user/create`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `${this.getAccessToken()}`,
      }),
      body: JSON.stringify(user),
    });
    if (res && res.data.value?.status == EnumStatus.OK) {
      return res.data.value;
    }
    return null;
  }

  async updateUser(user: UserDTO) {
    return await $api<RestBase>(`/api/user/update`, {
      method: 'POST',
      body: user,
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
  }

  async deleteUser(user_name: string) {
    return await $api<RestBase>(`/api/user/delete/${user_name}`, {
      method: 'POST',
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
  }

  async lockUser(user_name: string, locked: boolean) {
    return await $api<RestBase>(`/api/user/set-lock/${user_name}`, {
      method: 'POST',
      params: {
        locked: locked,
      },
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
  }

  async changePassword(changePasswordDTO: ChangePasswordUserDTO) {
    return await $api<RestBase>(`/api/user/change-password`, {
      method: 'POST',
      body: changePasswordDTO,
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
  }

  async savePermissionsUser(savePermissionDTO: SavePermissionsDTO) {
    return await $api<RestBase>(`/api/user/save-permissions`, {
      method: 'POST',
      body: savePermissionDTO,
      headers: {
        Authorization: `${this.getAccessToken()}`,
      },
    });
  }
}
const UserService = new _UserService();

export { UserService };
