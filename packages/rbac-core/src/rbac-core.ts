import { Permission, PermissionModel } from './api/Permission';
import { Role, RoleModel } from './api/Role';

interface ICoreOptions {
  storage: {
    permission: RBAC.IStorage<PermissionModel>,
    role: RBAC.IStorage<RoleModel>,
  };
}

export const enum CoreDuties {
  agent,
  master,
}

export class Core {
  public permission: Permission;
  public role: Role;

  constructor(opts: ICoreOptions) {
    this.permission = new Permission(opts.storage.permission);
    this.role = new Role(opts.storage.role);
  }
}

export default Core;
