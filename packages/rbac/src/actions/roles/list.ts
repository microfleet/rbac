import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'
import { RoleModel } from '@microfleet/rbac-core'

const toJSON = (x: RoleModel) => x.toJSON()
const list: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest) {
  const { cursor, data } = await this.rbac.role.list(request.params)
  return {
    meta: {
      cursor,
      limit: request.params.limit,
    },
    data: data.map(toJSON),
  }
}

list.auth = 'internal'
list.schema = 'input.roles.list'
list.transports = [ActionTransport.amqp, ActionTransport.internal]
list.rbac = {
  actionName: 'roles.list',
  name: 'RBAC Roles List/Iterator',
  actionType: ['GET'],
}

export default list
