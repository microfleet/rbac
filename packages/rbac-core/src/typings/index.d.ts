declare namespace RBAC {
  interface IPermission {
    id: string;
    reserved: boolean;
    name: string;
    deprecated: boolean;
    version: string;
  }

  interface IRole {
    id?: string;
    name: string;
    description?: string;
    permission: Array<IPermission['id']>;
    meta?: {
      [key: string]: string | boolean | number,
    };
  }

  interface IPermissionRegister {
    serviceName: string;
    version: string;
    name: string;
    value: string;
    deprecated: boolean;
    reserved: boolean;
  }

  interface IStorageFilter {
    prefix?: string;
  }

  interface IStorageList<T> {
    cursor: string;
    data: T[];
  }

  interface IStorage<T> {
    read(id: string): PromiseLike<T | void>;
    create(id: string, datum: T): PromiseLike<T | void>;
    update(id: string, datum: T): PromiseLike<T | void>;
    patch(id: string, version: string, datum: T): PromiseLike<T | void>;
    remove(id: string): PromiseLike<void>;
    list(filter: IStorageFilter, cursor?: string): PromiseLike<IStorageList<T> | void>;
    exists(id: string): PromiseLike<boolean>;
  }
}
