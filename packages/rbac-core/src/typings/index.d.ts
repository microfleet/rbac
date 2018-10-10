declare module 'find-my-way';

declare namespace RBAC {
  type ActionType = 'POST' | 'GET' | 'PATCH' | 'DELETE';

  interface IPermission {
    id: string;
    reserved: boolean;
    name: string;
    deprecated: boolean;
    version: string;
    actionType?: ActionType[];
  }

  interface IRole {
    id?: string;
    name: string;
    description?: string;
    permissions: {
      [id: string]: Array<IPermission['actionType']>,
    };
    meta: {
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
    actionType?: ActionType[];
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
