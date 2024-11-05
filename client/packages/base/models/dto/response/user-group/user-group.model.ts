class UserGroup {
  group?: Group;
  role?: Role;

  constructor(group?: Group, role?: Role) {
    this.group = group;
    this.role = role;
  }
}

export interface Group {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  lockoutEnabled?: boolean;
  roleId?: null;
  parentId?: null;
}

export interface Role {
  id?: string;
  name?: null;
  normalizedName?: null;
  concurrencyStamp?: null;
  userRoles?: null;
}
export { UserGroup };
