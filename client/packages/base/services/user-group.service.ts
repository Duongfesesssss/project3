// import type { RestData } from '~/models/base-response.model';
import type { RestData } from '../models/base-response.model';
import type { UserGroup } from '../models/dto/response/user-group/user-group.model';

class _UserGroupService {
  async list(): Promise<UserGroup[]> {
    const res = await $api<RestData<UserGroup[]>>(
      '/api/user-group/list',
      {
        method: 'GET',
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  async create(entity: UserGroup): Promise<UserGroup | null> {
    const res = await $api<RestData<UserGroup>>(
      '/api/user-group/create',
      {
        method: 'POST',
        body: JSON.stringify(entity),
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }

  async delete(userGroupId: string): Promise<null | UserGroup> {
    const res = await $api<RestData<UserGroup>>(
      `/api/user-group/delete/?id=${userGroupId}`,
      {
        method: 'POST',
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }

  async update(formData: FormData): Promise<UserGroup | null> {
    const res = await $api<RestData<UserGroup>>(
      '/api/user-group/update',
      {
        method: 'POST',
        body: formData,
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }

  async get(userGroupId: string): Promise<{ group: { id: string;
    code: string;
    name: string;
    description: string;
    roleId: string;
    lockoutEnabled: boolean;
    parentId: string; }; role: { id: string; name: string }; } | null> {
    const res = await $api<RestData<{ group: { id: string; code: string; name: string; description: string; lockoutEnabled: boolean; parentId: string; roleId: string }; role: { id: string; name: string } }>>(
      `/api/user-group/get/?id=${userGroupId}`,
      {
        method: 'GET',
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }
}
const UserGroupService = new _UserGroupService();

export { UserGroupService };
