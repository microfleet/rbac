import assert = require('assert')
import { Storage, StorageFilter, StorageList, VersionedDatum } from '@microfleet/rbac-core'

export interface RoutingTable {
  [action: string]: string
}

export interface Config {
  amqp: any
  routingTable: RoutingTable
}

export const defaultRolesRoutingTable = {
  read: 'read',
  create: 'create',
  update: 'update',
  list: 'list',
}

export const defaultPermissionsRoutingTable = {
  read: 'read',
  list: 'list',
  patch: 'register',
}

export class RemoteStorage<T> implements Storage<T> {
  private readonly remote: any
  private readonly serviceName: string
  private readonly routingTable: RoutingTable

  constructor(config: Config, serviceName: string) {
    this.remote = config.amqp
    this.routingTable = config.routingTable
    this.serviceName = serviceName
  }

  public async exists(id: string) {
    return this.remote
      .publishAndWait(this.route('exists'), { id })
  }

  public async read(id: string) {
    return this.remote
      .publishAndWait(this.route('read'), { id })
  }

  public async create(id: string, datum: T) {
    return this.remote
      .publishAndWait(this.route('create'), { id, datum })
  }

  public async update(id: string, datum: any) {
    return this.remote
      .publishAndWait(this.route('update'), { id, datum })
  }

  public async patch(id: string, datum: VersionedDatum<T>): Promise<VersionedDatum<T>> {
    return this.remote
      .publishAndWait(this.route('patch'), { id, datum })
  }

  public async remove(id: string) {
    return this.remote
      .publishAndWait(this.route('remove'), { id })
  }

  public async list(filter: StorageFilter = {}): Promise<StorageList<T>> {
    return this.remote
      .publishAndWait(this.route('list'), { filter })
  }

  private route(action: string): string {
    const routingKey = this.routingTable[action]
    assert(routingKey, `${action} routing not avaiable`)
    return `${this.serviceName}.${routingKey}`
  }
}
