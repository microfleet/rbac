import { Microfleet, ConnectorsTypes, TConnectorsTypes } from '@microfleet/core'
import RBACCore, { PermissionModel, RoleModel } from '@microfleet/rbac-core'
import RBACStorageRedis from '@microfleet/rbac-storage-redis'
import merge from 'lodash/merge'
import conf from './config'

export default class RBACService extends Microfleet {
  private static readonly defaultOpts = conf.get('/', {
    env: process.env.NODE_ENV,
  })

  constructor(options: any = {}) {
    super(merge({}, RBACService.defaultOpts, options))

    this.addConnector(ConnectorsTypes.migration as TConnectorsTypes, async () => {
      this.rbac = new RBACCore({
        storage: {
          permission: new RBACStorageRedis<PermissionModel>(this.redis, 'perm'),
          role: new RBACStorageRedis<RoleModel>(this.redis, 'role'),
        },
      })
    })
  }
}
