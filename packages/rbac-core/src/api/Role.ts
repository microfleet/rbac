import Model from '../models/Role';

type RoleStorage = RBAC.IStorage<Model>;

export class Role {
  private storage: RoleStorage;

  constructor(storage: RoleStorage) {
    this.storage = storage;
  }

  async read(id: string) {

  }

  async create(id: string, datum: Model) {

  }

  async update(id: string, datum: Model) {

  }

  async delete(id: string) {

  }

  async list(filter: RBAC.IStorageFilter, cursor?: string) {

  }
}

export type RoleModel = Model;
export default Role;
