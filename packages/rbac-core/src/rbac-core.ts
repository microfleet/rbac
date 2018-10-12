import { Permission, PermissionModel } from './api/Permission';
import { Role, RoleModel } from './api/Role';
import { IStorage } from './interfaces';

interface ICoreOptions {
  storage: {
    permission: IStorage<PermissionModel>,
    role: IStorage<RoleModel>,
  };
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
