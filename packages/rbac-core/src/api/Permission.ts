/**
 * Contains implementation of a `permission` primitive
 */

import Model from '../models/Permission';

type PermissionStorage = RBAC.IStorage<Model>;

export class Permission {
  private storage: PermissionStorage;

  constructor(storage: PermissionStorage) {
    this.storage = storage;
  }

  public async register(params: RBAC.IPermissionRegister) {
    const permission = Model.prepare(params);
    return this.storage.patch(permission.id(), permission.version(), permission);
  }

  public async unregister(id: string) {
    return this.storage.remove(id);
  }

  public async list(filter: RBAC.IStorageFilter, cursor?: string) {
    return this.storage.list(filter, cursor);
  }
}

export type PermissionModel = Model;

export default Permission;
