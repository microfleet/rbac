export type RBACActionType = 'POST' | 'GET' | 'PATCH' | 'DELETE';

export interface IPermission {
  id: string;
  reserved: boolean;
  name: string;
  deprecated: boolean;
  version: string;
  actionType?: RBACActionType[];
}

export interface IRole {
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

export interface IPermissionRegister {
  serviceName: string;
  version: string;
  name: string;
  value: string;
  deprecated: boolean;
  reserved: boolean;
  actionType?: RBACActionType[];
}

export interface IStorageFilter {
  cursor?: string;
  prefix?: string;
  limit?: number;
}

export interface IStorageList<T> {
  cursor: string;
  data: T[];
}

export interface IStorage<T> {
  read(id: string): PromiseLike<T | void>;
  create(id: string, datum: T): PromiseLike<T | void>;
  update(id: string, datum: any): PromiseLike<T | void>;
  patch(id: string, datum: any): PromiseLike<T | void>;
  remove(id: string): PromiseLike<void>;
  list(filter: IStorageFilter): PromiseLike<IStorageList<T> | void>;
  exists(id: string): PromiseLike<boolean>;
}
