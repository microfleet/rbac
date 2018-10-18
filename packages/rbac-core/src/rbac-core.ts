import { Permission, PermissionModel } from './api/Permission'
import { Role, RoleModel } from './api/Role'
import { Storage } from './interfaces'

interface CoreOptions {
  storage: {
    permission: Storage<PermissionModel>,
    role: Storage<RoleModel>,
  }
}

export class Core {
  public permission: Permission
  public role: Role

  constructor(opts: CoreOptions) {
    this.permission = new Permission(opts.storage.permission)
    this.role = new Role(opts.storage.role)
  }
}

export default Core
