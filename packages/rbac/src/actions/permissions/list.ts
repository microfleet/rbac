import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'
import { PermissionModel } from '@microfleet/rbac-core'

const toJSON = (x: PermissionModel) => x.toJSON()
const list: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest) {
  const { cursor, data }  = await this.rbac.permission.list(request.params)
  return {
    meta: {
      cursor,
      limit: request.params.limit,
    },
    data: data.map(toJSON),
  }
}

list.auth = 'internal'
list.schema = 'input.permissions.list'
list.transports = [ActionTransport.amqp, ActionTransport.internal]
list.rbac = {
  actionName: 'permissions.list',
  name: 'RBAC Permissions List',
  actionType: ['GET'],
}

export default list
