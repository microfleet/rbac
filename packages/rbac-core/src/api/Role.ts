import Model from '../models/Role';

export type RoleModel = RBAC.IRole;
type RoleStorage = RBAC.IStorage<RoleModel>;

export class Role {
  private storage: RoleStorage;

  constructor(storage: RoleStorage) {
    this.storage = storage;
  }

  public async read(id: string) {
    const serialized = await this.storage.read(id);
    return new Model(serialized as RoleModel);
  }

  public async create(datum: RoleModel) {
    const role = new Model(datum);
    await this.storage.create(role.id(), role.toJSON());
    return role;
  }

  public async update(id: string, datum: RoleModel) {
    const serialized = await this.storage.update(id, datum);
    return new Model(serialized as RoleModel);
  }

  public async remove(id: string) {
    await this.storage.remove(id);
  }

  public async list(filter: RBAC.IStorageFilter) {
    const datum = await this.storage.list(filter) as RBAC.IStorageList<RoleModel>;
    return {
      cursor: datum.cursor,
      data: datum.data.map((x) => new Model(x)),
    };
  }
}

export default Role;
