/**
 * Contains implementation of a `permission` primitive
 */

import Model from '../models/Permission';

type PermissionStorage = RBAC.IStorage<RBAC.IPermission>;

export class Permission {
  private storage: PermissionStorage;

  constructor(storage: PermissionStorage) {
    this.storage = storage;
  }

  public async read(id: RBAC.IPermission['id']) {
    const datum = await this.storage.read(id);
    return new Model(datum as RBAC.IPermission);
  }

  public async register(params: RBAC.IPermissionRegister) {
    const permission = Model.prepare(params);
    return this.storage.patch(permission.id(), permission.version(), permission.toJSON());
  }

  public async unregister(id: RBAC.IPermission['id']) {
    return this.storage.remove(id);
  }

  public async list(filter: RBAC.IStorageFilter, cursor?: string) {
    const datum = await this.storage.list(filter, cursor) as RBAC.IStorageList<RBAC.IPermission>;
    return {
      cursor: datum.cursor,
      data: datum.data.map((x) => new Model(x)),
    };
  }
}

export type PermissionModel = Model;

export default Permission;
