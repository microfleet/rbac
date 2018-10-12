/**
 * Contains implementation of a `permission` primitive
 */
import { IPermission, IPermissionRegister, IStorage, IStorageFilter, IStorageList } from '../interfaces';
import Model from '../models/Permission';

export type PermissionModel = IPermission;
type PermissionStorage = IStorage<PermissionModel>;

export class Permission {
  private storage: PermissionStorage;

  constructor(storage: PermissionStorage) {
    this.storage = storage;
  }

  public async read(id: PermissionModel['id']) {
    const datum = await this.storage.read(id);
    return new Model(datum as PermissionModel);
  }

  public async register(params: IPermissionRegister) {
    const permission = Model.prepare(params);
    return this.storage.patch(permission.id(), permission.toJSON());
  }

  public async unregister(id: PermissionModel['id']) {
    return this.storage.remove(id);
  }

  public async list(filter: IStorageFilter) {
    const datum = await this.storage.list(filter) as IStorageList<PermissionModel>;
    return {
      cursor: datum.cursor,
      data: datum.data.map((x) => new Model(x)),
    };
  }
}

export default Permission;
