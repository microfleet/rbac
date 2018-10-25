import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'
import { TRole } from '@microfleet/rbac-core'

const read: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest): Promise<TRole> {
  const Role = await this.rbac.role.read(request.params.id)
  return Role.toJSON()
}

read.auth = 'internal'
read.schema = 'input.roles.read'
read.transports = [ActionTransport.amqp, ActionTransport.internal]
read.rbac = {
  actionName: 'roles.read',
  name: 'RBAC Roles Read',
  actionType: ['GET'],
}

export default read
