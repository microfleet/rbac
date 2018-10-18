export type RBACActionType = 'POST' | 'GET' | 'PATCH' | 'DELETE'

export interface PermissionModel {
  id: string
  reserved: boolean
  name: string
  deprecated: boolean
  version: string
  actionType?: RBACActionType[]
}

export interface RoleModel {
  id?: string
  name: string
  description?: string
  permissions: {
    [id: string]: PermissionModel['actionType'][]
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
  deprecated: boolean
  reserved: boolean
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

export interface Storage<T> {
  read(id: string): PromiseLike<T | void>
  create(id: string, datum: T): PromiseLike<T | void>
  update(id: string, datum: any): PromiseLike<T | void>
  patch(id: string, datum: any): PromiseLike<T | void>
  remove(id: string): PromiseLike<void>
  list(filter: StorageFilter): PromiseLike<StorageList<T> | void>
  exists(id: string): PromiseLike<boolean>
}
