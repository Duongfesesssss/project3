import type { RestData } from '~/models/base-response.model';
import type { UserGroupRoles } from '~/models/user-group-roles.model';

class _UserGroupRolesService {
  async list(): Promise<UserGroupRoles[]> {
    const res = await $api<RestData<UserGroupRoles[]>>(
      '/api/user-group/roles',
      {
        method: 'GET',
      },
    );
    if (res != null && res?.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }
}
const UserGroupRolesService = new _UserGroupRolesService();

export { UserGroupRolesService };
