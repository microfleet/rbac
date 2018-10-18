/**
 * Contains implementation of a `permission` primitive
 */
import { TPermission, PermissionRegister, Storage, StorageFilter, StorageList } from '../interfaces'
import PermissionModel from '../models/Permission'

export { PermissionModel, TPermission }
export type PermissionStorage = Storage<TPermission>

export class Permission {
  private storage: PermissionStorage

  constructor(storage: PermissionStorage) {
    this.storage = storage
  }

  public async read(id: TPermission['id']) {
    const datum = await this.storage.read(id)
    return new PermissionModel(datum as TPermission)
  }

  public async register(params: PermissionRegister) {
    const permission = PermissionModel.prepare(params)
    return this.storage.patch(permission.id(), permission.toJSON())
  }

  public async unregister(id: TPermission['id']) {
    return this.storage.remove(id)
  }

  public async list(filter: StorageFilter) {
    const datum = await this.storage.list(filter) as StorageList<TPermission>
    return {
      cursor: datum.cursor,
      data: datum.data.map(x => new PermissionModel(x)),
    }
  }
}

export default Permission
