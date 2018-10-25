export type RBACActionType = 'POST' | 'GET' | 'PATCH' | 'DELETE'

export interface TPermission {
  id: string
  reserved: boolean
  name: string
  deprecated: boolean
  version: string
  actionType?: RBACActionType[]
}

export interface TRole {
  id?: string
  name: string
  description?: string
  permissions: {
    [id: string]: RBACActionType[]
  }
  meta: {
    [key: string]: string | boolean | number,
  }
}

export interface PermissionRegister {
  serviceName: string
  version: string
  name: string
  value: string
  deprecated?: boolean
  reserved?: boolean
  actionType?: RBACActionType[]
}

export interface StorageFilter {
  cursor?: string
  prefix?: string
  limit?: number
}

export interface StorageList<T> {
  cursor: string
  data: T[]
}

export interface StorageConstructor {
  new <T>(dbAdapter: any, db: string): Storage<T>
}

export type VersionedDatum<T> = T & {
  version: string
}

export interface Storage<T> {
  read(id: string): PromiseLike<T>
  create(id: string, datum: T): PromiseLike<T>
  update(id: string, datum: Partial<T>): PromiseLike<T>
  patch(id: string, datum: VersionedDatum<T>): PromiseLike<VersionedDatum<T>>
  remove(id: string): PromiseLike<void>
  list(filter: StorageFilter): PromiseLike<StorageList<T>>
  exists(id: string): PromiseLike<boolean>
}
