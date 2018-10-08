declare namespace RBAC {
  interface IPermission {
    id: string;
    reserved: boolean;
    name: string;
    deprecated: boolean;
    version: string;
  }

  interface IStorageFilter {
    prefix?: string;
  }

  interface IStorageList<T> {
    cursor: string;
    data: T[];
  }

  interface IStorage<T> {
    read(id: string): Promise<T>;
    create(id: string, datum: T): Promise<T>;
    update(id: string, datum: T): Promise<T>;
    remove(id: string): Promise<void>;
    list(filter: IStorageFilter, cursor?: string): Promise<IStorageList<T>>;
    exists(id: string): Promise<boolean>;
  }
}
