declare module 'find-my-way';
declare module 'level-mem';

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
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
    reverse?: boolean;
    limit?: number;
  }

  interface IStorageList<T> {
    cursor: string;
    data: T[];
  }

  interface IStorage<T> {
    read(id: string): PromiseLike<T | void>;
    create(id: string, datum: T): PromiseLike<T | void>;
    update(id: string, datum: any): PromiseLike<T | void>;
    patch(id: string, datum: any): PromiseLike<T | void>;
    remove(id: string): PromiseLike<void>;
    list(filter: IStorageFilter): PromiseLike<IStorageList<T> | void>;
    exists(id: string): PromiseLike<boolean>;
    close(): PromiseLike<void>;
  }
}
