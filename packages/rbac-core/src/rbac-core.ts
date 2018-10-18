import { Permission, TPermission, PermissionModel } from './api/Permission'
import { Role, TRole, RoleModel } from './api/Role'
import { Storage } from './interfaces'

export { RoleModel, PermissionModel }
export { TRole, TPermission }

interface CoreOptions {
  storage: {
    permission: Storage<TPermission>,
    role: Storage<TRole>,
  }
}

export class RBACCore {
  public permission: Permission
  public role: Role

  constructor(opts: CoreOptions) {
    this.permission = new Permission(opts.storage.permission)
    this.role = new Role(opts.storage.role)
  }
}

export default RBACCore
