import { ConnectorsTypes } from '@microfleet/core'
import RBACCore, { PermissionModel, RoleModel } from '@microfleet/rbac-core'
import RBACStorageRemote from '@microfleet/rbac-storage-remote'

export class RBACAgent {
  private rbac: RBACCore
  private ready: boolean = false

  constructor(amqp: any, endpoint: string) {
    this.rbac = new RBACCore({
      storage: {
        permission: new RBACStorageRemote<PermissionModel>(amqp, `${endpoint}.permissions`),
        role: new RBACStorageRemote<RoleModel>(amqp, `${endpoint}.roles`),
      },
    })

    this.init()
  }

  public async init() {

  }

  public async match(roles: string[], action: any) {

  }

  public async register(actions: any[]) {

  }
}
