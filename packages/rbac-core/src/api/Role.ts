import { TRole, Storage, StorageFilter, StorageList } from '../interfaces'
import RoleModel from '../models/Role'

export { RoleModel, TRole }
export type RoleStorage = Storage<TRole>

export class Role {
  private storage: RoleStorage

  constructor(storage: RoleStorage) {
    this.storage = storage
  }

  public async read(id: string) {
    const serialized = await this.storage.read(id)
    return new RoleModel(serialized as TRole)
  }

  public async create(datum: TRole) {
    const role = new RoleModel(datum)
    await this.storage.create(role.id(), role.toJSON())
    return role
  }

  public async update(id: string, datum: TRole) {
    const serialized = await this.storage.update(id, datum)
    return new RoleModel(serialized as TRole)
  }

  public async remove(id: string) {
    await this.storage.remove(id)
  }

  public async list(filter: StorageFilter) {
    const datum = await this.storage.list(filter) as StorageList<TRole>
    return {
      cursor: datum.cursor,
      data: datum.data.map(x => new RoleModel(x)),
    }
  }
}

export default Role
