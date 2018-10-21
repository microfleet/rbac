import { Storage, StorageFilter, StorageList } from '@microfleet/rbac-core'

export class RemoteStorage<T> implements Storage<T> {
  private remote: any
  private serviceName: string

  constructor(amqp: any, serviceName: string) {
    this.remote = amqp
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

  public async patch(id: string, datum: any): Promise<T> {
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

  private route(routingKey: string): string {
    return `${this.serviceName}.${routingKey}`
  }
}
