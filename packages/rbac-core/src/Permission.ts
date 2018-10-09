/**
 * Contains implementation of a `permission` primitive
 */

import { Permission } from './models/Permission';

type PermissionStorage = RBAC.IStorage<Permission>;

class Permissions {
  private storage: PermissionStorage;

  constructor(storage: PermissionStorage) {
    this.storage = storage;
  }

  public async register(params: RBAC.IPermissionRegister) {
    const permission = Permission.prepare(params);
    return this.storage.patch(permission.id(), permission.version(), permission);
  }

  public async unregister(id: string) {
    return this.storage.remove(id);
  }

  public async list(filter: RBAC.IStorageFilter, cursor?: string) {
    return this.storage.list(filter, cursor);
  }
}

export default Permissions;
