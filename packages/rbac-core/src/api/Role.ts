import Model from '../models/Role';

type RoleStorage = RBAC.IStorage<RBAC.IRole>;

export class Role {
  private storage: RoleStorage;

  constructor(storage: RoleStorage) {
    this.storage = storage;
  }

  public async read(id: string) {
    const serialized = await this.storage.read(id);
    return new Model(serialized as RBAC.IRole);
  }

  public async create(id: string, datum: Model) {

  }

  public async update(id: string, datum: Model) {

  }

  public async delete(id: string) {

  }

  public async list(filter: RBAC.IStorageFilter, cursor?: string) {

  }
}

export type RoleModel = Model;
export default Role;
